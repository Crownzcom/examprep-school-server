import express from 'express';
import fs from 'fs';
import csv from 'csv-parser';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import {
    databases,
    database_id,
    student_Table_id,
    admin_table_id,
    Query
} from '../appwriteConfig.js';

const router = express.Router();
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '../data');
const adminCSV = path.join(dataDir, 'admin_users.csv');
const studentCSV = path.join(dataDir, 'student_users.csv');

const USER_TYPE = {
    ADMIN: 'admin',
    STUDENT: 'student',
};

// Ensure the data directory exists
const ensureDataDirectoryExists = async () => {
    try {
        await mkdirAsync(dataDir, { recursive: true });
    } catch (err) {
        console.error('Failed to create data directory:', err);
        throw err;
    }
};

// Function to read user data from a CSV file
const readUserDataFromCSV = async (csvFile) => {
    return new Promise((resolve, reject) => {
        const users = [];
        fs.createReadStream(csvFile)
            .pipe(csv())
            .on('data', (row) => users.push(row))
            .on('end', () => resolve(users))
            .on('error', (error) => reject(error));
    });
};

// Function to query another server-side and save user data to a CSV file
const fetchAndSaveUserData = async (csvFile, userType) => {
    const excludeKeys = ['$createdAt', '$updatedAt', '$permissions', '$databaseId', '$collectionId'];
    try {
        let list = [];
        let columns = new Set();

        console.log('DATABASE ID: ', database_id);

        if (userType === USER_TYPE.STUDENT) {
            const students = await databases.listDocuments(database_id, student_Table_id);
            console.log('Students List: ', students)
            list = students.documents;
        } else if (userType === USER_TYPE.ADMIN) {
            const admins = await databases.listDocuments(database_id, admin_table_id);
            list = admins.documents;
        }

        if (list.length > 0) {
            // Collect all columns present in the data, excluding the specified keys
            list.forEach(user => {
                Object.keys(user).forEach(key => {
                    if (!excludeKeys.includes(key)) {
                        columns.add(key);
                    }
                });
            });

            // Convert the Set to an array and join to form the CSV header
            const header = Array.from(columns).join(',');

            // Map each user to a CSV row, ensuring all columns are included
            const csvData = list.map(user => {
                return Array.from(columns).map(col => {
                    let value = user[col];
                    if (Array.isArray(value)) {
                        // Convert the array to a string with single quotes
                        value = `"${JSON.stringify(value).replace(/"/g, "'")}"`;
                    }
                    return value || '';
                }).join(',');
            }).join('\n');

            await writeFileAsync(csvFile, `${header}\n${csvData}`);
        } else {
            return false;
        }

        return list;
    } catch (error) {
        console.error('Failed to fetch user data from external server:', error);
        throw error;
    }
};

// Function to search user in the external database and update the CSV if found
const searchAndUpdateUser = async (csvFile, userType, userId) => {
    const excludeKeys = ['$createdAt', '$updatedAt', '$permissions', '$databaseId', '$collectionId'];
    let userList = [];
    try {
        if (userType === USER_TYPE.STUDENT) {
            const students = await databases.listDocuments(database_id, student_Table_id, [Query.equal('userID', `${userId}`)]);
            userList = students.documents;
        } else if (userType === USER_TYPE.ADMIN) {
            const admins = await databases.listDocuments(database_id, admin_table_id, [Query.equal('userID', `${userId}`)]);
            userList = admins.documents;
        }

        if (userList.length > 0) {
            let columns = new Set();

            // Collect all columns present in the data, excluding the specified keys
            userList.forEach(user => {
                Object.keys(user).forEach(key => {
                    if (!excludeKeys.includes(key)) {
                        columns.add(key);
                    }
                });
            });

            // Convert the Set to an array and join to form the CSV header
            const header = Array.from(columns).join(',');

            // Map each user to a CSV row, ensuring all columns are included
            const csvData = userList.map(user => {
                return Array.from(columns).map(col => {
                    let value = user[col];
                    if (Array.isArray(value)) {
                        // Convert the array to a string with single quotes
                        value = `"${JSON.stringify(value).replace(/"/g, "'")}"`;
                    }
                    return value || '';
                }).join(',');
            }).join('\n');

            await writeFileAsync(csvFile, `${header}\n${csvData}`, { flag: 'a' });
            return userList[0];
        } else {
            return null;
        }
    } catch (error) {
        console.error('Failed to search and update user from external server:', error);
        throw error;
    }
};

router.post('/getEmail', async (req, res) => {
    const { userId, userType } = req.body;
    console.log(req.body);
    const csvFile = userType === USER_TYPE.ADMIN ? adminCSV : studentCSV;

    try {
        await ensureDataDirectoryExists();

        let users = [];

        try {
            await readFileAsync(csvFile);
            users = await readUserDataFromCSV(csvFile);
        } catch (err) {
            console.error('Failed to read CSV file:', err);
            users = await fetchAndSaveUserData(csvFile, userType);
        }

        if (!users || users.length === 0) {
            users = await fetchAndSaveUserData(csvFile, userType);
            if (!users) {
                return res.status(404).json({ error: 'No users found' });
            }
        }

        let userInfo = users.find((user) => user.userID === userId);
        if (userInfo) {
            res.json({ email: userInfo.email, userInfo });
        } else {
            // User not found in CSV, search in the external database
            user = await searchAndUpdateUser(csvFile, userType, userId);
            if (user) {
                res.json({ email: user.email, user });
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;

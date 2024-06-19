// userRouter.js
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from "crypto";
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import {
    databases,
    users,
    c_account,
    c_databases,
    c_client,
    database_id,
    student_Table_id,
    admin_table_id,
    ID,
} from '../appwriteConfig.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const countersFilePath = path.join(__dirname, '..', 'data', 'counters.json');

// Function to simulate delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to read counters from the JSON file
const readCounters = async () => {
    if (!fs.existsSync(countersFilePath)) {
        fs.writeFileSync(countersFilePath, JSON.stringify({ studentCounter: 0, adminCounter: 0 }));
    }
    const counters = fs.readFileSync(countersFilePath, 'utf8');
    return JSON.parse(counters);
};

// Helper function to write counters to the JSON file
const writeCounters = async (counters) => {
    fs.writeFileSync(countersFilePath, JSON.stringify(counters, null, 2));
};

// Helper function to generate unique emails and passwords
const generateEmail = (userType, counter) => {
    if (userType === 'student') {
        return `st${String(counter).padStart(3, '0')}@student.school`;
    } else if (userType === 'admin') {
        return `ad${String(counter).padStart(3, '0')}@admin.school`;
    }
};

const generateUserID = (userType, counter) => {
    if (userType === 'student') {
        return `STU${String(counter).padStart(3, '0')}`;
    } else if (userType === 'admin') {
        return `ADM${String(counter).padStart(3, '0')}`;
    }
}

const generatePassword = (length = 8) => {
    return crypto.randomBytes(length).toString("hex").slice(0, length);
};

// Create users and corresponding documents
router.post('/create-users', async (req, res) => {
    try {
        const usersData = req.body;
        /*===rq.body format============
            [
                {
                    **"userType": "student", 
                    **"firstName": "Mary",
                    **"lastName": "Doe",
                    "otherName": null,
                    **"gender": "female",
                    **"studClass": "P7",  //Primary [P1, P2, --- P7] Secondary [S1, S2, S3, --- S6]
                    **"stream": "a",
                    **"label": ["student"]  //Label - ["student"] / ["admin"]
                },
                {
                    **"userType": "admin",
                    **"firstName": "Alex",
                    **"lastName": "Doe",
                    "otherName": null,
                    **"gender": "male",
                    **"label": ["admin"]
                }
            ]
        */

        const createdUsers = [];
        let counters = await readCounters();

        for (const userData of usersData) {
            const { userType, firstName, lastName, otherName, gender, studClass, stream, label } = userData;

            const accountCreationDate = moment().utcOffset('+03:00').toISOString();
            console.log(accountCreationDate);
            console.log('Account Creation Date: ', accountCreationDate);

            if (userType === 'admin') {
                counters.adminCounter += 1;
            } else {
                counters.studentCounter += 1;
            }
            await writeCounters(counters);

            const counter = userType === 'admin' ? counters.adminCounter : counters.studentCounter;

            const email = generateEmail(userType, counter);
            const userID = generateUserID(userType, counter);
            const password = generatePassword();
            const name = `${firstName} ${lastName} ${otherName}`.trim();

            console.log(`userID: ${userID}, email: ${email}`);

            let documentData = {}
            if (userType === 'admin') {
                documentData = {
                    userID,
                    firstName,
                    lastName,
                    otherName,
                    gender,
                    email,
                    label,
                    accountCreationDate,
                    userType
                }
            } else if (userType === 'student') {
                documentData = {
                    userID,
                    firstName,
                    lastName,
                    otherName,
                    gender,
                    studClass,
                    stream,
                    label,
                    accountCreationDate,
                    email,
                    userType
                };
            }
            else {
                throw new Error("Invalid user type: " + userType);
            }

            console.log('user documentData: ', documentData)

            const userResponse = await users.create(userID, email, null, password, name);
            console.log('created user: ', userResponse)

            const collectionId = userType === 'student' ? student_Table_id : admin_table_id;

            console.log('user collectionId: ', collectionId)

            const addUserToTable = await databases.createDocument(database_id, collectionId, ID.unique(), documentData);

            delay(5000);

            console.log('Added to table: ', addUserToTable)

            createdUsers.push(userType === 'student' ? {
                userID,
                firstName,
                lastName,
                otherName,
                email,
                studClass,
                stream,
                password
            } : {
                userID,
                firstName,
                lastName,
                otherName,
                email,
                password
            });

            delay(2000);
        }

        // await writeCounters(counters);

        res.status(200).json(createdUsers);

        /**Response format sent back to the client-side
        [
            {
                "userID": "STU001",
                "firstName": "Mary",
                "lastName": "Doe",
                "otherName": null,
                "email": "st001@student.school",
                "studClass": "P7",
                "stream": "a",
                "password": "6cced7f2"
            },
            {
                "userID": "STU002",
                "firstName": "David",
                "lastName": "Doe",
                "otherName": null,
                "email": "st002@student.school",
                "studClass": "P6",
                "stream": "b",
                "password": "37cf8541"
            },
            {
                "userID": "ADM001",
                "firstName": "Alex",
                "lastName": "Doe",
                "otherName": null,
                "email": "ad001@admin.school",
                "password": "b1cf4233"
            }
        ]
         */

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;

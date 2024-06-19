import express from 'express';
import dotenv from 'dotenv';
import fs from 'fs';
import {
    database_id,
    databases,
    ID,
} from '../appwriteConfig.js';
import { AttributeType, tableInitialization, examSubjectTablesInitialization, examSubjectTableNames, classTablesInitialization } from '../routes/tables.js';
import { writeMultipleDocuments } from '../utils/appwriteUtils.js';

const router = express.Router();

// Load environment variables from .env file
dotenv.config();

// Function to reload environment variables from .env file
const reloadEnvVars = async () => {
    const envVars = dotenv.parse(fs.readFileSync('.env'));
    for (const key in envVars) {
        if (envVars.hasOwnProperty(key)) {
            process.env[key] = envVars[key];
        }
    }
};

// Function to update .env file
const updateEnvFile = async (key, value) => {
    try {
        const envFilePath = '.env';
        const envVars = await dotenv.parse(fs.readFileSync(envFilePath));
        envVars[key] = value;

        const envFileContent = await Object.keys(envVars)
            .map(key => key === 'APPWRITE_ENDPOINT' ? `${key}=${envVars[key]}` : `${key}="${envVars[key]}"`)
            .join('\n');

        fs.writeFileSync(envFilePath, envFileContent);
        console.log(`Updated environment file: KEY - ${key}, VALUE - ${value}`);

        // Reload environment variables
        await reloadEnvVars();
    } catch (err) {
        console.log(`Failed to update environment variable: KEY - ${key}, VALUE - ${value}`);
    }
};


// Stores the form data temporarily for SSE updates
let tempFormData = {};

//For table data population
let databaseID;
let classTableID;
let schoolTableID;

/* ============= FUNCTIONS TO CREATE ATTRIBUTE(S) ============= */
//Creates a single attribute in a table
const createAttribute = async (dbID, colID, attrType, data) => {
    const { ...options } = data;

    console.log(`Creating attribute ${options.key} - Type: ${attrType}` + `Collection ID: ${colID}`);

    try {
        let response;
        switch (attrType) {
            case AttributeType.DATETIME:
                response = await databases.createDatetimeAttribute(
                    dbID,
                    colID,
                    options.key,
                    options.required || false,
                    options.defaultValue !== undefined ? options.defaultValue : null,
                    options.arr || false
                );
                break;
            case AttributeType.STRING:
                response = await databases.createStringAttribute(
                    dbID,
                    colID,
                    options.key,
                    options.size,
                    options.required || false,
                    options.defaultValue !== undefined ? options.defaultValue : null,
                    options.arr || false,
                    options.encrypt || false
                );

                break;
            case AttributeType.EMAIL:
                response = await databases.createEmailAttribute(
                    dbID,
                    colID,
                    options.key,
                    options.required || false,
                    options.defaultValue !== undefined ? options.defaultValue : null,
                    options.arr || false
                );
                break;
            case AttributeType.ENUM:
                response = await databases.createEnumAttribute(
                    dbID,
                    colID,
                    options.key,
                    options.elements,
                    options.required || false,
                    options.defaultValue !== undefined ? options.defaultValue : null,
                    options.arr || false
                );
                break;
            case AttributeType.INTEGER:
                response = await databases.createIntegerAttribute(
                    dbID,
                    colID,
                    options.key,
                    options.required || false,
                    options.min,
                    options.max,
                    options.defaultValue !== undefined ? options.defaultValue : null,
                    options.arr || false
                );
                break;
            case AttributeType.BOOLEAN:
                response = await databases.createBooleanAttribute(
                    dbID,
                    colID,
                    options.key,
                    options.required || false,
                    options.defaultValue !== undefined ? options.defaultValue : null,
                    options.arr || false
                );
                break;
            case AttributeType.FLOAT:
                response = await databases.createFloatAttribute(
                    dbID,
                    colID,
                    options.key,
                    options.required || false,
                    options.min,
                    options.max,
                    options.defaultValue !== undefined ? options.defaultValue : null,
                    options.arr || false
                );
                break;
            case AttributeType.URL:
                response = await databases.createUrlAttribute(
                    dbID,
                    colID,
                    options.key,
                    options.required || false,
                    options.defaultValue !== undefined ? options.defaultValue : null,
                    options.arr || false
                );
                break;
            case AttributeType.IP:
                response = await databases.createIpAttribute(
                    dbID,
                    colID,
                    options.key,
                    options.required || false,
                    options.defaultValue !== undefined ? options.defaultValue : null,
                    options.arr || false
                );
                break;
            default:
                throw new Error(`Unknown attribute type: ${attrType}`);
        }

        await delay(1000);

        // Create Index for user IDs [In the future, information will passed in config.data if an attribute requires an index]
        if (options.key === "userID") {
            await delay(1000);
            console.log('INDEX Attribute response: ' + JSON.stringify(response));
            console.log("Creating Index for user ID");
            await createIndex(dbID, colID, options.key, 'key', [`${options.key}`], ['ASC'])
        }
        else if (options.key === "studClass") {
            await delay(1000);
            console.log('INDEX Attribute response: ' + JSON.stringify(response));
            console.log("Creating Index for studClass");
            await createIndex(dbID, colID, options.key, 'key', [`${options.key}`], ['ASC'])
        }
        else if (options.key === "stream") {
            await delay(1000);
            console.log('INDEX Attribute response: ' + JSON.stringify(response));
            console.log("Creating Index for stream");
            await createIndex(dbID, colID, options.key, 'key', [`${options.key}`], ['ASC'])
        }
    } catch (e) {
        console.log(`Failed to create ${attrType} attribute - ${options.key}`, e);
        throw new Error(`Failed to create ${attrType} attribute - ${options.key}`, e);
    }
};

//Creates multiple attributes for a single table
const createAllAttributes = async (data) => {
    // console.log(`Creating batch attributes: `, data);
    try {
        for (const config of data.attributes) {
            await delay(1000)
            await createAttribute(data.dbID, data.colID, config.attrType, config.data)
        }
    } catch (e) {
        console.log(`Failed to create batch attributes`, e);
        throw new Error(`Failed to create batch attributes`, e);
    }
};
/* ========================================================== */

//Function to create index
const createIndex = async (dbID, colID, key, type, attributes, order) => { //data.dbID, data.colID, config.attrType, config.data
    try {
        console.log('INDEX Attributes: ', attributes);
        console.log('Creating index - Collection: ', colID)
        const result = await databases.createIndex(
            dbID, // databaseId
            colID, // collectionId
            key, // key
            type, // type [key, unique, fullText, spatial]
            attributes, // attributes - ARRAY
            order ? order : null // orders (optional) - ARRAY
        );
        console.log('Index created successfully', result);
    } catch (e) {
        console.log('Failed to create index', e);
    }
}

/* ============= FUNCTIONS TO CREATE DATABASE(S) ============= */
const createdB = async () => {
    try {
        let DBid = ID.unique();

        databaseID = DBid;

        console.log('DBid: ', DBid);
        // console.log(`Env vars: \nAPI - ${ process.env.APPWRITE_API_KEY }\nEndpoint - ${ process.env.APPWRITE_ENDPOINT }\nProject ID - ${ process.env.APPWRITE_PROJECT_ID }\n`)
        const response = await databases.create(DBid, 'database-3');
        console.log('DB created', response);
        await updateEnvFile('DATABASE_ID', DBid);
        return response;
    } catch (e) {
        console.log(`Failed to create school appwrite database: ${e}`);
        throw new Error(`Failed to create school appwrite database: ${e}`);
    }
};

/* ============= FUNCTIONS TO CREATE TABLE(S) ============= */
// Create Single database tables/collections
const createTable = async (dbID, tableName, attributes, res) => {
    try {
        let subjects = {}
        let tableId = ID.unique()
        const response = await databases.createCollection(
            dbID, // databaseId
            tableId, // collectionId
            tableName, // name
            ["read(\"any\")", "create(\"any\")", "update(\"any\")", "delete(\"any\")"], // permissions (optional)
            false, // documentSecurity (optional)
            true // enabled (optional)
        );

        console.log(`${tableName} created: `, response);
        const colID = response.$id

        if (!colID || colID === null) {
            throw new Error(`Could not create "${tableName}" table due to lack of collection / table ID ${tableName}`)
        }

        // Add table to .env file
        await updateEnvFile(`${tableName.toUpperCase()}_TABLE_ID`, colID);

        // Call createAllAttributes to create all attributes
        await createAllAttributes({ dbID, colID, attributes });
        await delay(1000);

        // Send update after table creation
        sendUpdate(res, { status: `${tableName} table created successfully`, table: tableName });

        // Return created table details
        if (tableName === 'school' || tableName === 'classes') {
            return { tableName: tableName, tableId: tableId };
        }
        else {
            return { tableName: tableName, tableId: tableId };
        }
    } catch (e) {
        console.log(`Failed to create ${tableName} table / collection: ${e}`);
        sendUpdate(res, { status: `Failed to create ${tableName} table`, error: e.message });
        throw new Error(`Failed to create ${tableName} table / collection: ${e}`);
    }
}

//Create Multiple Tables
const createTables = async (dbID, tableData, res) => {
    let response = [];
    for (const table of tableData) {
        const { tableName, attributes } = table;
        try {
            const resp = await createTable(dbID, tableName, attributes, res);
            if (resp != undefined || resp != null) {
                response.push(resp);
            }
        } catch (e) {
            console.log(`Error creating table ${tableName}: `, e);
        }
    }
    console.log('Finished Creating all Tables');
    return response;
}

/* ========================================================== */

// Function to send status updates
const sendUpdate = (res, message) => {
    res.write(`data: ${JSON.stringify(message)}\n\n`);
};

// Function to simulate delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/* ========================== ROUTES ========================== */
// Endpoint to receive form data
router.post('/submit', (req, res) => {
    tempFormData = req.body;
    console.log(' Received Data ', tempFormData);
    res.json({ message: 'Form data received. You can now connect to the SSE endpoint for updates.' });
});

// Endpoint to send status updates during the initialization process
router.get('/status-updates', async (req, res) => {
    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let initialTables = null;
    let examSubjectTables = null;
    let examSubjects = null; // array exam subject names ---> TODO: WILL BE GOT FROM CLIENT SIDE IN FUTURE
    let classes = tempFormData.classes.map(cls => cls.class);
    console.log(classes);

    sendUpdate(res, { classes: classes });
    await delay(1000);

    try {
        if (!tempFormData) {
            throw new Error('No form data available');
        }

        // exam subject names ---> TODO: WILL BE GOT FROM CLIENT SIDE IN FUTURE
        if (examSubjects === null) {
            examSubjects = tempFormData.educationLevel === 'Primary' ? examSubjectTableNames.primary : examSubjectTableNames.secondary;
        }

        // Initial Tables
        initialTables = await tableInitialization(classes, tempFormData.streams);
        sendUpdate(res, { status: 'Setting Up exam tables', subjects: examSubjects });
        examSubjectTables = await examSubjectTablesInitialization(examSubjects);
        // classTables = await classTablesInitialization(classes);

        sendUpdate(res, { status: 'Received form data', data: tempFormData });
        await delay(1000);

        // Updating .env file with API data
        if (tempFormData.apiKey && tempFormData.endpointUrl && tempFormData.projectId) {
            sendUpdate(res, { status: 'Updating .env file with API data' });
            await delay(1000);

            await updateEnvFile('APPWRITE_API_KEY', tempFormData.apiKey);
            await delay(5000);

            await updateEnvFile('APPWRITE_ENDPOINT', tempFormData.endpointUrl);
            await delay(5000);

            await updateEnvFile('APPWRITE_PROJECT_ID', tempFormData.projectId);
            await delay(5000);

            await sendUpdate(res, { status: 'Updated .env file' });
            await delay(5000);
        } else {
            sendUpdate(res, { status: 'Missing required API data' });
            throw new Error('Missing required API data');
        }

        // Creating database
        sendUpdate(res, { status: 'Creating database' });
        await delay(1000);
        const dbResp = await createdB();
        sendUpdate(res, { status: 'Database created successfully' });

        // Creating tables/collections
        sendUpdate(res, { status: 'Creating tables/collections' });
        await delay(1000);

        // Exam Tables
        const subjectExamTables = await createTables(dbResp.$id, examSubjectTables, res);
        console.log('Exam subject tables: \n', subjectExamTables)
        sendUpdate(res, { status: 'Exam Tables created successfully' });
        // sendUpdate(res, { status: 'Exam Tables created successfully', tables: examSubjectTables });

        // Class Tables
        // await createTables(dbResp.$id, classTables)
        // sendUpdate(res, { status: 'Class Tables created successfully', tables: classTables });

        // General Tables
        const multTablesResp = await createTables(dbResp.$id, initialTables, res);
        console.log('Response from multiple tables: \n', multTablesResp);
        sendUpdate(res, { status: 'General Tables created successfully', databaseID: dbResp.$id, tables: multTablesResp, subjectExamTables: subjectExamTables });
        // sendUpdate(res, { status: 'General Tables created successfully' });

        sendUpdate(res, { status: 'All Tables created successfully' });

        // Set project setup status to true

        // Reload Env Vars
        await reloadEnvVars();

        // Confirmation message on success
        console.log('Successfully created');
        sendUpdate(res, { success: 'Setup created successfully' });
    } catch (e) {
        console.log('Failed to create project setup', e);
        sendUpdate(res, { message: 'Failed to create setup', error: e.message });
    } finally {
        tempFormData = null;
        sendUpdate(res, { message: 'Process closed' });
        res.end();
    }
});

export default router;

//==testing routes================================
// Define a route to send DATABASE_ID to the client with streaming responses
// router.get('/database-id', (req, res) => {
//     // Set headers to keep the connection open
//     res.setHeader('Content-Type', 'text/event-stream');
//     res.setHeader('Cache-Control', 'no-cache');
//     res.setHeader('Connection', 'keep-alive');

//     // Send the initial status
//     res.write('data: Reading .env file...\n\n');

//     setTimeout(() => {
//         // Simulate reading the .env file
//         res.write('data: Finished reading .env file...\n\n');

//         setTimeout(() => {
//             // Get the DATABASE_ID from the environment variables
//             const databaseId = process.env.DATABASE_ID;

//             // Send the final response
//             res.write(`data: { "DATABASE_ID": "${databaseId}" }\n\n`);
//             res.end();
//         }, 1000); // Simulate delay in processing
//     }, 1000); // Simulate delay in reading the file
// });
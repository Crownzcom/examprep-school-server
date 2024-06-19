// Importing required modules and dotenv package
import { Client, Users, Account, Databases, ID } from "node-appwrite";
import {
    Client as cClient,
    Account as cAccount,
    Databases as cDatabases,
    Permission as cPermission,
    Role as cRole,
    Query,
} from "appwrite";

import dotenv from "dotenv";
dotenv.config();

// Initialize  server side SDK
const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

// let ProjID =
console.log('Project ID: ', process.env.APPWRITE_ENDPOINT)
const account = new Account(client);
const users = new Users(client);
const databases = new Databases(client);

// Initialize client side SDK
const c_client = new cClient()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID);

const c_account = new cAccount(c_client);
const c_databases = new cDatabases(c_client);
// const query = new Query(c_client);

// DERRICK (CLOUD) - Database and collection IDs
const database_id = process.env.DATABASE_ID;
const school_table_id = process.env.SCHOOL_TABLE_ID;
const admin_table_id = process.env.ADMIN_TABLE_ID
const student_Table_id = process.env.STUDENT_TABLE_ID;
// const teachersTable_id = process.env.TEACHERS_TABLE_ID;
const results_Table_id = process.env.STUDENT_RESULTS_TABLE_ID;
const classes_Table_id = process.env.CLASSES_TABLE_ID;

export {
    account,
    databases,
    client,
    users,
    c_account,
    c_databases,
    c_client,
    database_id,
    student_Table_id,
    admin_table_id,
    // teachersTable_id,
    results_Table_id,
    school_table_id,
    classes_Table_id,
    Query,
    ID,
};

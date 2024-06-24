import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import initiate from './routes/initiate.js'; // Adjust the path as needed
import authentication from './routes/login.js';
import createAccount from './routes/signup.js';
import fetchStudents from './routes/fetchStudents.js';
import appwriteApi from './routes/createDocs.js';
import exams from './routes/exams.js'

const app = express();
const port = 3001;

// Enable CORS for all origins
app.use(
    cors({
        origin: "*",
    }),
);

// Parse JSON bodies
app.use(bodyParser.json());

// Use the routes defined in initiate.js
app.use('/initiate', initiate);

//User Account Creation
app.use('/create-account', createAccount);

//User Login routes
app.use('/login', authentication);

// Use the routes defined in initiate.js
app.use('/students', fetchStudents);

//Create collection docs
app.use('/appwrite', appwriteApi);

//Route for exam related processes
app.use('/exam', exams)

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

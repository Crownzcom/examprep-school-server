import express from 'express';
import dotenv from 'dotenv';
import { databases, database_id, ID } from '../appwriteConfig.js'; // Adjust the import path as necessary

const router = express.Router();

// Load environment variables from .env file
dotenv.config();

/* ============= FUNCTIONS TO DOCUMENT(S) ============= */
// Function to write multiple documents to the collection
const writeMultipleDocuments = async (databaseId, collectionId, documents) => {
    const results = [];
    let i = 0;
    for (const doc of documents) {
        try {
            console.log('Creating document... CollectionId: ', collectionId);
            console.log('documents: ', documents)
            const documentId = ID.unique(); // Generate a unique ID for each document
            const result = await databases.createDocument(
                databaseId,
                collectionId,
                documentId,
                doc,
                ["read(\"any\")"] // Adjust permissions as necessary
            );

            console.log('Successfully created document')

            results.push(result);
        }
        catch (err) {
            console.log(`Failed to create document: ${err}`)
            throw new Error(`Failed to create document: ${err}`);
        }
    }

    return results;
};

// Define the POST endpoint that can insert multiple documents in multiple tables
router.post('/insert-docs', async (req, res) => {
    const data = req.body;

    console.log('Received data: ', data);

    if (!Array.isArray(data)) {
        return res.status(400).json({ error: 'Invalid input data format. Expected an array.' });
    }

    try {
        const results = [];

        for (const entry of data) {
            const { databaseId, collectionId, documents } = entry;

            if (!databaseId || !collectionId || !Array.isArray(documents)) {
                return res.status(400).json({ error: 'Invalid input data in one of the entries.' });
            }

            console.log('Table ID: ', collectionId)

            const entryResults = await writeMultipleDocuments(databaseId, collectionId, documents);
            results.push({ databaseId, collectionId, entryResults });

            console.log('Documents created: ', entryResults)
        }

        res.status(200).json({ message: 'Documents written successfully', results });
    } catch (error) {
        res.status(500).json({ error: 'Error writing documents', details: error.message });
    }
});

export default router;

import { databases, ID } from '../appwriteConfig.js';

export const writeMultipleDocuments = async (databaseId, collectionId, documents) => {
    const results = [];

    for (const doc of documents) {
        const documentId = ID.unique(); // Generate a unique ID for each document

        const result = await databases.createDocument(
            databaseId,
            collectionId,
            documentId,
            doc,
            ["read(\"any\")"]
        );

        results.push(result);
    }

    return results;
}

// Example usage
// const schoolClasses = [
//     { class: 'P7', streams: ['north', 'stream'] },
//     { class: 'P6', streams: ['west', 'east', 'south', 'north'] }
// ];

// const databaseId = '<DATABASE_ID>'; // Replace with your actual database ID
// const collectionId = '<COLLECTION_ID>'; // Replace with your actual collection ID

// writeMultipleDocuments(databaseId, collectionId, schoolClasses)
//     .then(results => {
//         console.log('Documents written successfully:', results);
//     })
//     .catch(error => {
//         console.error('Error writing documents:', error);
//     });

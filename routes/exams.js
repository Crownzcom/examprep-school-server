import express from "express";
import fs from "fs";
import { promises as fsPromises } from "fs";
import { constants as fsConstants } from "fs";
import path from "path";
import dotenv from "dotenv";
import { promisify } from "util";
import { fileURLToPath } from "url";
import {
    databases,
    database_id,
    Query,
} from "../appwriteConfig.js";

dotenv.config();

const router = express.Router();
const dirname = path.dirname(fileURLToPath(import.meta.url));
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

const examCountersFilePath = path.join(dirname, '..', 'data', 'exam_creation_counter.json');

// ==================== FUNCTIONS ====================
const fetchQuestionsForSubject = async (collection_id) => {
    try {
        console.log("Determining subject...");
        console.log("Fetching subject questions...");

        const response = await databases.listDocuments(
            database_id,
            collection_id,
            [Query.limit(200), Query.orderAsc("$id")]
        );

        const questions = response.documents;
        const questionData = questions;

        questionData.forEach((obj) => {
            obj.questions = obj.questions.map((q) => JSON.parse(q));
            delete obj.$createdAt;
            delete obj.$updatedAt;
            delete obj.$permissions;
            delete obj.$databaseId;
            delete obj.$collectionId;
        });

        console.log("Finished fetching question data: ");
        return questionData;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
};

const selectRandomQuestions = async (subjectName, questionsData, categoryIds, collection_id, qtnHistory) => {
    let updatedQtnHistory = {
        collection_id,
        questionsJSON: { ...qtnHistory?.questionsJSON },
    };

    let categoriesWithQuestions = await Promise.all(categoryIds.map(async (categoryId) => {
        const category = questionsData.find((cat) => cat.category === categoryId);
        if (!category) {
            console.log(`Category ${categoryId} not found`);
            return null;
        }

        let attemptedQuestionIds = qtnHistory?.questionsJSON?.[categoryId] || [];
        let allQuestionIds = category.questions.map((question) => question.id);

        console.log('Attempted questions: ' + attemptedQuestionIds.length + '\n allQuestionIds: ' + allQuestionIds.length);

        // Reset the attempted question IDs if they exceed or match all available questions
        if (attemptedQuestionIds.length >= allQuestionIds.length) {
            console.log('Resetting attempted questions to empty array');
            attemptedQuestionIds = [];
            updatedQtnHistory.questionsJSON[categoryId] = [];
        }

        // Filter available questions that haven't been attempted
        let availableQuestions = category.questions.filter((question) => {
            let questionId = question.id;
            return !attemptedQuestionIds.includes(questionId);
        });

        let numQuestions = 1;
        if (subjectName === 'social_studies' && (categoryId === 36 || categoryId === 51)) {
            numQuestions = 5;
        }

        if (availableQuestions.length < numQuestions) {
            attemptedQuestionIds = [];
            availableQuestions = category.questions;
        }

        let selectedQuestions = [...availableQuestions].sort(() => 0.5 - Math.random()).slice(0, numQuestions);

        if (selectedQuestions.length < numQuestions) {
            let questionsNeeded = numQuestions - selectedQuestions.length;
            let additionalQuestions = [];

            for (let i = 0; i < questionsNeeded; i++) {
                if (attemptedQuestionIds.length > 0) {
                    let oldQuestionId = attemptedQuestionIds.shift();
                    let oldQuestion = category.questions.find((q) => q.id === oldQuestionId);
                    if (oldQuestion) {
                        additionalQuestions.push(oldQuestion);
                    }
                }
            }

            selectedQuestions = selectedQuestions.concat(additionalQuestions);

            if (attemptedQuestionIds.length === 0) {
                updatedQtnHistory.questionsJSON[categoryId] = [];
            }
        }

        const updatedQuestions = selectedQuestions.map((question) => {
            const updatedQuestion = { ...question };

            if (question.either && question.either.sub_questions) {
                updatedQuestion.either.sub_questions = question.either.sub_questions.map((subQ, index) => ({
                    ...subQ,
                }));
            }

            if (question.or && question.or.sub_questions) {
                updatedQuestion.or.sub_questions = question.or.sub_questions.map((subQ, index) => ({
                    ...subQ,
                }));
            }

            return updatedQuestion;
        });

        const newQuestionIds = updatedQuestions.map((question) => question.id);
        updatedQtnHistory.questionsJSON[categoryId] = [...new Set([...attemptedQuestionIds, ...newQuestionIds])];

        return { ...category, questions: updatedQuestions };
    }));

    return {
        updatedQtnHistory,
        categoriesWithQuestions: categoriesWithQuestions.filter((cat) => cat !== null),
    };
};

// Retrieve User Questions History
const getAttemptedQuestions = async (collection_id, subjectName) => {
    let fileName = 'attemptedQuestionHistory.json';
    if (subjectName && collection_id) {
        const filePath = path.join(dirname, "..", "data", fileName);

        try {
            const data = await readFile(filePath, "utf8");
            const records = JSON.parse(data);

            const userRecord = records.find(
                (record) =>
                    record.collection_id === collection_id && record.SubjectName === subjectName,
            );

            if (userRecord) {
                return {
                    questionsJSON: userRecord.questionsJSON || {},
                    timestamp: userRecord.Timestamp || null,
                };
            } else {
                return { questionsJSON: {}, timestamp: null };
            }
        } catch (error) {
            console.error(error);
            throw new Error(`Error Fetching ${subjectName} exam history: ${error}`);
        }
    } else {
        throw new Error("One of the parameters is not provided");
    }
};

// Update User Questions History
const updateQuestionHistory = async (questionsJSON, subjectName, collection_id) => {
    console.log('updatedQtnHistory: ', questionsJSON);
    let fileName = 'attemptedQuestionHistory.json';
    const filePath = path.join(dirname, "..", "data", fileName);

    try {
        let fileExists = true;
        try {
            await fsPromises.access(filePath, fsConstants.F_OK);
            console.log("File exists");
        } catch (error) {
            fileExists = false;
            console.log("File does not exist");
        }

        let records;

        if (fileExists) {
            const data = await fsPromises.readFile(filePath, "utf8");
            records = JSON.parse(data);
        } else {
            records = [];
        }

        const existingRecordIndex = records.findIndex(
            (record) =>
                record.SubjectName === subjectName && record.collection_id === collection_id,
        );

        if (existingRecordIndex >= 0) {

            records[existingRecordIndex] = {
                collection_id: collection_id,
                SubjectName: subjectName,
                questionsJSON: questionsJSON,
                Timestamp: new Date().toISOString(),
            };
        } else {
            records.push({
                collection_id: collection_id,
                SubjectName: subjectName,
                questionsJSON: questionsJSON,
                Timestamp: new Date().toISOString(),
            });
            console.log("Appending new exam record.");
        }

        const validJSON = JSON.stringify(records, null, 2);

        await fsPromises.writeFile(filePath, validJSON);

        return {
            updated: `Updated ${subjectName} exam history successfully`,
        };
    } catch (error) {
        console.error(`Error Updating ${subjectName} exam history: ${error}`);
        throw new Error(`Error Updating ${subjectName} exam history: ${error}`);
    }
};

// Function to read exam counters from the JSON file
const readCounters = async () => {
    if (!fs.existsSync(examCountersFilePath)) {
        fs.writeFileSync(examCountersFilePath, JSON.stringify({ studentCounter: 0, adminCounter: 0 }));
    }
    const counters = fs.readFileSync(examCountersFilePath, 'utf8');
    return JSON.parse(counters);
};

//Function to write exam counters to the JSON file
const writeCounters = async (counters) => {
    fs.writeFileSync(examCountersFilePath, JSON.stringify(counters, null, 2));
};

// Function to generate exam ID
const generateExamID = (counter) => {
    return `EXM${String(counter).padStart(3, '0')}`;
}

// ==================== ROUTES =================
router.get("/fetch-exam", async (req, res) => {
    const { collection_id, subjectName } = req.query;

    console.log("Request body: " + JSON.stringify(req.query));
    if (collection_id === null || collection_id === undefined || subjectName === null || subjectName === undefined) {
        return res.status(400).json({ message: `Exam processing failed. Missing collection ID.` });
    }

    try {
        const questionsData = await fetchQuestionsForSubject(collection_id);

        const categoriesToInclude = questionsData.map(category => category.category);

        const qtnHistory = await getAttemptedQuestions(collection_id, subjectName);

        const randomQuestions = await selectRandomQuestions(
            subjectName,
            questionsData,
            categoriesToInclude,
            collection_id,
            qtnHistory,
        );

        randomQuestions.categoriesWithQuestions.sort((a, b) => a.category - b.category);

        await updateQuestionHistory(randomQuestions.updatedQtnHistory.questionsJSON, subjectName, collection_id);

        //Generate Exam ID
        let counters = await readCounters();

        counters.examCounter += 1;

        const counter = counters.examCounter

        const examID = generateExamID(counter)

        //Update the exam counter json file
        await writeCounters(counters);

        res.status(200).json({ questions: randomQuestions.categoriesWithQuestions, examID: examID });

    } catch (error) {
        console.log('Error fetching exam:', error);
        res.status(500).json({ message: "An error occurred while fetching the exam." });
    }
});

export default router;

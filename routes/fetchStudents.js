import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Router } from "express";
import express from "express";
import cors from "cors";
import {
    databases,
    database_id,
    student_Table_id,
    results_Table_id,
    Query,
} from "../appwriteConfig.js";

const router = Router();
const app = express();

app.use(cors({
    origin: "*",
}));

const dirname = path.dirname(fileURLToPath(import.meta.url));

const fetchAndProcessAllStudentData = async () => {
    try {
        console.log("Fetching student data with the following config:");
        console.log("Database ID:", database_id);
        console.log("Student Table ID:", student_Table_id);
        console.log("Results Table ID:", results_Table_id);

        const students = await databases.listDocuments(
            database_id,
            student_Table_id,
            [Query.limit(100000)]
        );

        console.log('Students :', students);

        if (!students.documents) {
            throw new Error("No documents found in student table.");
        }

        return Promise.all(
            students.documents.map(async (student) => {
                console.log('Student Results');

                const results = await databases.listDocuments(
                    database_id,
                    results_Table_id,
                    [Query.equal("studID", [student.userID]), Query.limit(1000)]
                );

                console.log('Student Results Fetched: ', results);

                return {
                    userID: student.userID,
                    studName: `${student.firstName} ${student.lastName} ${student.otherName || ""}`,
                    firstName: student.firstName,
                    lastName: student.lastName,
                    otherName: student.otherName || "",
                    gender: student.gender,
                    email: student.email,
                    studClass: student.studClass,
                    stream: student.stream,
                    label: student.label,
                    userType: student.userType,
                    accountCreationDate: student.accountCreationDate ?
                        new Date(student.accountCreationDate).toLocaleString("en-US", {
                            timeZone: "Africa/Nairobi",
                            hour12: false,
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                        })
                        :
                        new Date(student.$createdAt).toLocaleString("en-US", {
                            timeZone: "Africa/Nairobi",
                            hour12: false,
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                        }),
                    Results: results.documents.map((result) => ({
                        subjectName: result.subjectName,
                        marks: result.marks,
                        examID: result.examID,
                        results: result.results,
                        finalPossibleMarks: result.finalPossibleMarks,
                        dateTime: result.dateTime ?
                            new Date(result.dateTime).toLocaleString("en-US", {
                                timeZone: "Africa/Nairobi",
                                hour12: false,
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                            })
                            :
                            new Date(result.$createdAt).toLocaleString("en-US", {
                                timeZone: "Africa/Nairobi",
                                hour12: false,
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                            }),
                    })),
                };
            })
        );
    } catch (error) {
        console.error("Error fetching and processing student data:", error);
        throw error;
    }
};

router.get("/fetch-students", async (req, res) => {
    const dataPath = path.join(dirname, "..", "data", "students.json");

    try {
        if (!fs.existsSync(dataPath)) {
            fs.writeFileSync(dataPath, JSON.stringify([]), "utf-8");
        }

        const processedData = await fetchAndProcessAllStudentData();

        fs.writeFileSync(dataPath, JSON.stringify(processedData, null, 2), "utf-8");

        res.json({
            message: "Data fetched and stored successfully!",
            data: processedData,
        });
    } catch (error) {
        console.error("Error in fetch-students route:", error);
        res.status(500).json({ error: "Failed to fetch and process student data" });
    }
});

export default router;

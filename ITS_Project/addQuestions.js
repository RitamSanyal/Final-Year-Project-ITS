const mongoose = require('mongoose');
const MCQ = require('./models/MCQ_Schema');  // Adjust the path if needed
require('dotenv').config();
const uri = process.env.MONGODB_URI;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        const sampleQuestions = [
            {
                question: "What is the capital of France?",
                options: ["Berlin", "Madrid", "Paris", "Rome"],
                correctAnswer: 2,  // Paris is the 3rd option (index 2)
                stream: "Geography",
                difficulty: "easy"
            },
            {
                question: "What is 2 + 2?",
                options: ["3", "4", "5", "6"],
                correctAnswer: 1,  // 4 is the 2nd option (index 1)
                stream: "Math",
                difficulty: "easy"
            },
            {
                question: "Which of these is a prime number?",
                options: ["4", "6", "8", "7"],
                correctAnswer: 3,  // 7 is the 4th option (index 3)
                stream: "Math",
                difficulty: "medium"
            }
        ];

        // Insert sample questions into the MCQ collection
        MCQ.insertMany(sampleQuestions)
            .then(() => {
                console.log("Questions added successfully!");
                mongoose.disconnect();
            })
            .catch((err) => {
                console.error("Error adding questions:", err);
                mongoose.disconnect();
            });
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
    });

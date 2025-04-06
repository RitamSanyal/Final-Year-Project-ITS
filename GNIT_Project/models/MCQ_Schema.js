const mongoose = require('mongoose');

const MCQSchema = new mongoose.Schema({
    stream: {
        type: String,
        required: true
    },
    question: {
        type: String,
        required: true
    },
    options: [{
        type: String,
        required: true
    }],
    correctAnswer: {
        type: Number,  // Index of correct option
        required: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    }
});

module.exports = mongoose.model('MCQ', MCQSchema);

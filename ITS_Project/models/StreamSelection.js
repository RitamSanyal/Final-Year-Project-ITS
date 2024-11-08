const mongoose = require('mongoose');

const StreamSelectionSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  // Reference to the User model
        required: true
    },
    stream_choice: {
        type: String,
        required: true,
        enum: ['IT', 'CSE', 'ECE', 'ME', 'Civil']  // Example stream choices
    },
    selectedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('StreamSelection', StreamSelectionSchema);

const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    fileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Upload",
        required: true
    },
    role: {
        type: String,
        enum: ["user", "ai"],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Conversation", conversationSchema);
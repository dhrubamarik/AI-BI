const mongoose = require("mongoose");

const uploadSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    // REVERT: Use local file path instead of S3
    filePath: {
        type: String,
        required: true
    },
    totalRows: {
        type: Number,
        default: 0
    },
    headers: {
        type: [String],
        default: []
    },
    domain: {
        type: String,
        default: "unknown"
    },
    confidence: {
        type: Number,
        default: 0
    },
    suggestedKPIs: {
        type: [String],
        default: []
    },
    schema: {
        type: Object,
        default: {}
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Upload", uploadSchema);
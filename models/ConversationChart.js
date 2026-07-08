const mongoose = require("mongoose");

const conversationChartSchema = new mongoose.Schema({
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
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
        required: true
    },
    chartType: {
        type: String,
        enum: ['pie', 'doughnut', 'bar', 'line', 'radar', 'polarArea'],
        required: true
    },
    chartTitle: String,
    chartData: {
        labels: [String],
        datasets: [{
            label: String,
            data: [mongoose.Schema.Types.Mixed],
            backgroundColor: [String],
            borderColor: [String],
            borderWidth: Number,
            tension: Number,
            fill: Boolean
        }]
    },
    chartOptions: mongoose.Schema.Types.Mixed,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("ConversationChart", conversationChartSchema);
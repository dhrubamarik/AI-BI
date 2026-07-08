const userModel = require("../models/user");
const Upload = require("../models/Upload");
const Conversation = require("../models/Conversation");
const ConversationChart = require("../models/ConversationChart");

const showDashboard = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id);
        const fileHistory = await Upload.find({ userId: req.user.id }).sort({ uploadedAt: -1 });
        const activeFile = fileHistory.length > 0 ? fileHistory[0] : null;

        let conversationHistory = [];
        if (activeFile) {
            const rawConv = await Conversation.find({ fileId: activeFile._id }).sort({ createdAt: 1 });
            
            // Enrich conversation with charts from DB
            conversationHistory = await Promise.all(rawConv.map(async (msg) => {
                const charts = await ConversationChart.find({ conversationId: msg._id });
                return {
                    _id: msg._id,
                    role: msg.role,
                    content: msg.content,
                    createdAt: msg.createdAt,
                    // Map stored data to Chart.js format
                    charts: charts.map(c => ({
                        type: c.chartType,
                        title: c.chartTitle,
                        data: c.chartData,
                        options: c.chartOptions
                    }))
                };
            }));
        }

        res.render("dashboard", { user, fileHistory, activeFile, conversationHistory });
    } catch (error) { res.status(500).send("Error"); }
};
module.exports = { showDashboard };
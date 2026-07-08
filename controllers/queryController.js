const Upload = require("../models/Upload");
const Conversation = require("../models/Conversation");
const ConversationChart = require("../models/ConversationChart");
const QueryService = require("../services/queryService");
const DynamicChartService = require("../services/dynamicChartService");
const CSVService = require("../services/csvService");

const askQuestion = async (req, res) => {
    try {
        const { question } = req.body;
        console.log('❓ Question received:', question);

        // Get active file
        const activeFile = await Upload.findOne({
            userId: req.user.id
        }).sort({ uploadedAt: -1 });

        if (!activeFile) {
            return res.status(400).json({
                success: false,
                error: "No file loaded"
            });
        }

        console.log(`📂 Active file: ${activeFile.fileName}`);

        // Save user question
        const userMessage = await Conversation.create({
            userId: req.user.id,
            fileId: activeFile._id,
            role: "user",
            content: question
        });

        // Get conversation context
        const context = await Conversation.find({
            userId: req.user.id,
            fileId: activeFile._id
        }).sort({ createdAt: -1 }).limit(10);

        // Get AI answer
        console.log('🤖 Getting AI response...');
        const queryService = new QueryService();
        const answer = await queryService.handleQuestion(
            question,
            activeFile,
            context.reverse()
        );

        // Parse CSV data from LOCAL file path
        console.log('📊 Parsing CSV from file...');
        const csvData = await CSVService.parseCSV(activeFile.filePath);
        console.log(`📈 CSV Data loaded: ${csvData.length} rows`);

        // Generate charts dynamically
        console.log('🎨 Generating chart configs...');
        const dynamicChartService = new DynamicChartService();
        let charts = await dynamicChartService.generateChartsWithAI(
            csvData,
            activeFile.schema,
            question
        );
        console.log(`✅ Charts generated: ${charts.length} charts`);

        // Save AI response
        const aiMessage = await Conversation.create({
            userId: req.user.id,
            fileId: activeFile._id,
            role: "ai",
            content: answer
        });

        // Save charts to MongoDB
        if (charts && charts.length > 0) {
            console.log('💾 Saving charts to database...');
            for (const chart of charts) {
                await ConversationChart.create({
                    userId: req.user.id,
                    fileId: activeFile._id,
                    conversationId: aiMessage._id,
                    chartType: chart.type,
                    chartTitle: chart.title,
                    chartData: chart.data,
                    chartOptions: chart.options
                });
            }
            console.log('✅ Charts saved');
        }

        res.json({
            success: true,
            answer: answer,
            charts: charts
        });

    } catch (error) {
        console.error("❌ Query error:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = { askQuestion };
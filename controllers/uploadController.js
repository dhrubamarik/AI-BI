const path = require("path");
const CSVService = require("../services/csvService");
const Upload = require("../models/Upload");
const DatasetService = require("../services/datasetService");

const uploadCSV = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: "No file uploaded"
            });
        }

        const filePath = req.file.path;
        const fileName = req.file.originalname;

        // Step 1: Parse CSV
        console.log("📁 Parsing CSV...");
        const data = await CSVService.parseCSV(filePath);

        if (!data || data.length === 0) {
            return res.status(400).json({
                success: false,
                error: "CSV file is empty"
            });
        }

        const headers = Object.keys(data[0]);

        // Step 2: AI Dataset Analysis
        console.log("🤖 Analyzing with AI...");
        const datasetService = new DatasetService();
        const analysis = await datasetService.analyzeDataset(
            headers,
            data.slice(0, 5),
            fileName
        );

        // Step 3: Save to MongoDB with local file path
        const upload = await Upload.create({
            userId: req.user.id,
            fileName: fileName,
            filePath: filePath,  // Store local path
            totalRows: data.length,
            headers: headers,
            domain: analysis.businessDomain || "unknown",
            confidence: analysis.confidence || 0,
            suggestedKPIs: analysis.suggestedKPIs || [],
            schema: analysis
        });

        console.log("✅ Upload saved:", upload._id);

        return res.json({
            success: true,
            fileName: fileName,
            totalRows: data.length,
            headers: headers,
            domain: analysis.businessDomain,
            confidence: analysis.confidence,
            suggestedKPIs: analysis.suggestedKPIs,
            uploadId: upload._id
        });

    } catch (error) {
        console.error("Upload error:", error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = { uploadCSV };
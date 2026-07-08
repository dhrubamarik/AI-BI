const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Upload = require("../models/Upload");

// POST /file/activate
// Sets a previous file as the active one
// We do this by moving it to top (update uploadedAt)
// Dashboard always shows most recent as active
router.post("/file/activate", authMiddleware, async (req, res) => {
    try {
        const { fileId } = req.body;

        // PRIVACY: Make sure this file belongs to THIS user
        const file = await Upload.findOne({
            _id: fileId,
            userId: req.user.id    // Security check
        });

        if (!file) {
            return res.json({
                success: false,
                error: "File not found"
            });
        }

        // Update timestamp so it becomes "most recent" = active
        await Upload.findByIdAndUpdate(fileId, {
            uploadedAt: new Date()
        });

        res.json({ success: true });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE /file/:fileId
// Deletes a file from MongoDB
// PRIVACY: Only owner can delete their file
router.delete("/file/:fileId", authMiddleware, async (req, res) => {
    try {
        const { fileId } = req.params;

        // PRIVACY: userId check prevents deleting others files
        const file = await Upload.findOneAndDelete({
            _id: fileId,
            userId: req.user.id    // Security check
        });

        if (!file) {
            return res.json({
                success: false,
                error: "File not found or not authorized"
            });
        }

        res.json({ success: true });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
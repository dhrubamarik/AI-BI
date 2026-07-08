const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const uploadMiddleware = require("../middleware/uploadMiddleware");
const { uploadCSV } = require("../controllers/uploadController");

// uploadMiddleware is ALREADY the middleware function
// Don't call .single() on it
router.post(
    "/upload",
    authMiddleware,
    uploadMiddleware,  // ← Already includes .single("csvFile")
    uploadCSV
);

module.exports = router;
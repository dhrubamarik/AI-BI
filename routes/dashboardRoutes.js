const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    showDashboard
} = require("../controllers/dashboardController");

router.get(
    "/dashboard",
    authMiddleware,
    showDashboard
);

module.exports = router;
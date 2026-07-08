const express = require("express");

const router = express.Router();

const {
showRegister,
registerUser,
loginUser,
logoutUser,
showLogin,
showHome
} = require("../controllers/authController");

router.get("/", showHome);

router.get("/login", showLogin);

router.post("/login", loginUser);

router.get("/register", showRegister);

router.post("/register", registerUser);

router.get("/logout", logoutUser);

module.exports = router;
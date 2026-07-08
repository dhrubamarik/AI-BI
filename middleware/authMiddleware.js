// middleware/authMiddleware.js
// This must set req.user for everything to work

const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        // No token = redirect to login
        if (!token || token === "") {
            return res.redirect("/login");
        }

        // Decode JWT → get user id
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Set req.user so controllers can use req.user.id
        req.user = decoded;

        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        res.redirect("/login");
    }
};

module.exports = authMiddleware;
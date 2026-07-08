const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user");
const saltRounds = 10;

//Home
const showHome = (req, res) => {
    res.render("index");
};
//login page
const showLogin = (req, res) => {
    res.render("login");
};
//Login function
const loginUser = async (req, res) => {
    const user = await userModel.findOne({
        email: req.body.email
    });
    if (!user) {
        return res.send("Something went wrong");
    }
    bcrypt.compare(
        req.body.password,
        user.password,
        function (err, result) {
            if (result) {
                const token = jwt.sign(
                    { id: user._id},
                    process.env.JWT_SECRET
                );
                res.cookie("token", token);
                res.redirect("/dashboard");
            }
            else {
                res.send("Something went wrong");
            }
        }
    )
}
//logout
const logoutUser = (req, res) => {
    res.cookie("token", "");
    res.redirect("/");
};

//register page 
const showRegister = (req, res) => {
    res.render("register");
};
//register function 
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
        return res.send("User already exists");
    }
    bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(password, salt, async function (err, hash) {
            const createdUser = await userModel.create({
                username,
                email,
                password: hash
            });
            res.redirect("/login");
        });
    });
};

module.exports = {
    showRegister,
    registerUser,
    loginUser,
    logoutUser,
    showLogin,
    showHome,
};
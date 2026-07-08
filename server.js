require("dotenv").config();

const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const fileRoutes = require("./routes/fileRoutes");
const queryRoutes = require("./routes/queryRoutes");  // ADD THIS

connectDB();

app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", authRoutes);
app.use("/", dashboardRoutes);
app.use("/", uploadRoutes);
app.use("/", fileRoutes);
app.use("/", queryRoutes);  // ADD THIS

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server Running on ${PORT}`);
});
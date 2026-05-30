const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const userRoutes = require("./routes/userRoutes");
const commentRoutes = require("./routes/commentRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/tasks", taskRoutes);

app.use("/api/users", userRoutes);

app.use("/api/tasks", commentRoutes);

app.get("/", (req, res) => {
  res.send("Task Tracker API Running");
});

module.exports = app;
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const userRoutes = require("./routes/userRoutes");
const commentRoutes = require("./routes/commentRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const activityRoutes = require("./routes/activityRoutes");
const memoRoutes = require("./routes/memoRoutes");
const chatRoutes = require("./routes/chatRoutes");
const exportRoutes = require("./routes/exportRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const tenantSettingRoutes = require("./routes/tenantSettingRoutes");
const apiKeyRoutes = require("./routes/apiKeyRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/tasks", taskRoutes);

app.use("/api/users", userRoutes);

app.use("/api/tasks", commentRoutes);

app.use("/api/leaves", leaveRoutes);

app.use("/api/activities", activityRoutes);

app.use("/api/memos", memoRoutes);

app.use("/api/chat", chatRoutes);

app.use("/api/export", exportRoutes);

app.use("/api/notifications", notificationRoutes);

app.use("/api/tenant-settings", tenantSettingRoutes);

app.use("/api/api-keys", apiKeyRoutes);

app.get("/", (req, res) => {
  res.send("Task Tracker API Running");
});

module.exports = app;
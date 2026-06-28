const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { exportTasks, exportLeaves } = require("../controllers/exportController");

router.get("/tasks", authMiddleware, roleMiddleware("ADMIN", "SUPER_ADMIN", "MANAGER", "HR"), exportTasks);
router.get("/leaves", authMiddleware, roleMiddleware("ADMIN", "SUPER_ADMIN", "MANAGER", "HR"), exportLeaves);

module.exports = router;

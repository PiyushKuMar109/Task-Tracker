const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getActivities } = require("../controllers/activityController");

router.get("/", authMiddleware, getActivities);

module.exports = router;

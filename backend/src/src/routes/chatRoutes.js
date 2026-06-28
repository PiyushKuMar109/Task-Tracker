const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getMessages, postMessage } = require("../controllers/chatController");

router.get("/", authMiddleware, getMessages);
router.post("/", authMiddleware, postMessage);

module.exports = router;

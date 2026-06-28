const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { getApiKeys, createApiKey, deleteApiKey } = require("../controllers/apiKeyController");

router.get("/", authMiddleware, roleMiddleware("ADMIN", "SUPER_ADMIN", "MANAGER", "HR"), getApiKeys);
router.post("/", authMiddleware, roleMiddleware("ADMIN", "SUPER_ADMIN", "MANAGER", "HR"), createApiKey);
router.delete("/:id", authMiddleware, roleMiddleware("ADMIN", "SUPER_ADMIN", "MANAGER", "HR"), deleteApiKey);

module.exports = router;

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { getTenantSettings, updateTenantSettings } = require("../controllers/tenantSettingController");

router.get("/", authMiddleware, getTenantSettings);
router.put("/", authMiddleware, roleMiddleware("ADMIN", "SUPER_ADMIN", "HR"), updateTenantSettings);

module.exports = router;

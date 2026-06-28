const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  createLeave,
  getLeaves,
  updateLeaveStatus,
} = require("../controllers/leaveController");

// Create leave request: all authenticated roles except SUPER_ADMIN should be inside a tenant, but let's allow all authenticated users
router.post(
  "/",
  authMiddleware,
  createLeave
);

// Get leave list: filtered inside controller based on role and tenant
router.get(
  "/",
  authMiddleware,
  getLeaves
);

// Approve or Reject leave request status: ADMIN, HR, and MANAGER only
router.put(
  "/:id/status",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN", "ADMIN", "HR", "MANAGER"),
  updateLeaveStatus
);

module.exports = router;

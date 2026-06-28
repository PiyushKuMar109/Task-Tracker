const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateTimeSpent,
} = require("../controllers/taskController");

const {
  getAttachments,
  getAttachmentData,
  uploadAttachment,
} = require("../controllers/attachmentController");

const {
  getSubtasks,
  createSubTask,
  toggleSubTask,
  deleteSubTask,
} = require("../controllers/subTaskController");

// Tasks core endpoints
router.post(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN", "MANAGER"),
  createTask
);

router.get(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN", "MANAGER", "MEMBER", "HR", "DEVELOPER", "QA", "DESIGNER"),
  getTasks
);

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN", "MANAGER", "MEMBER", "HR", "DEVELOPER", "QA", "DESIGNER"),
  getTaskById
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN", "MANAGER", "MEMBER", "HR", "DEVELOPER", "QA", "DESIGNER"),
  updateTask
);

router.put(
  "/:id/time",
  authMiddleware,
  roleMiddleware("ADMIN", "MANAGER", "MEMBER", "HR", "DEVELOPER", "QA", "DESIGNER"),
  updateTimeSpent
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN", "MANAGER"),
  deleteTask
);

// Attachments sub-endpoints
router.get("/:id/attachments", authMiddleware, getAttachments);
router.get("/attachments/:attachmentId", authMiddleware, getAttachmentData);
router.post("/:id/attachments", authMiddleware, uploadAttachment);

// Sub-tasks sub-endpoints
router.get("/:id/subtasks", authMiddleware, getSubtasks);
router.post("/:id/subtasks", authMiddleware, createSubTask);
router.put("/subtasks/:id/toggle", authMiddleware, toggleSubTask);
router.delete("/subtasks/:id", authMiddleware, deleteSubTask);

module.exports = router;
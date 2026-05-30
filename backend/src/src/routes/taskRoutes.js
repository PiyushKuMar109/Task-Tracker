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
} = require("../controllers/taskcontroller");

router.post(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN", "MANAGER"),
  createTask
);

router.get(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN", "MANAGER", "MEMBER"),
  getTasks
);

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN", "MANAGER", "MEMBER"),
  getTaskById
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN", "MANAGER", "MEMBER"),
  updateTask
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN", "MANAGER"),
  deleteTask
);

module.exports = router;
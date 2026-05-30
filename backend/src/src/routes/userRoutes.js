const express = require("express");

const router = express.Router();

const { getUsers, addUser, deleteUser, getUsersForAssignment } = require("../controllers/usercontroller");



const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");


// Get all users (admin and manager can see their team)
router.get("/", authMiddleware, roleMiddleware("ADMIN", "MANAGER", "MEMBER"), getUsers);

// Get users available for task assignment (admin and manager only)
router.get("/assignable", authMiddleware, roleMiddleware("ADMIN", "MANAGER"), getUsersForAssignment);

// Add a new user (admin and manager can add)
router.post("/", authMiddleware, roleMiddleware("SUPER_ADMIN", "ADMIN", "MANAGER"), addUser);

// Delete a user by id (admin only)
router.delete("/:id", authMiddleware, roleMiddleware("ADMIN"), deleteUser);

module.exports = router;
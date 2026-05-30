const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const roleMiddleware = require("../middleware/roleMiddleware");

const {
  addComment,
  getComments,
} = require("../controllers/commentController");

router.post(
  "/:id/comments",
  authMiddleware,
  addComment
);

router.get(
  "/:id/comments",
  authMiddleware,
  getComments
);

module.exports = router;
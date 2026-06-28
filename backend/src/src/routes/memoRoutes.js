const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getMemos,
  createMemo,
  toggleMemo,
  deleteMemo,
} = require("../controllers/memoController");

router.get("/", authMiddleware, getMemos);
router.post("/", authMiddleware, createMemo);
router.put("/:id/toggle", authMiddleware, toggleMemo);
router.delete("/:id", authMiddleware, deleteMemo);

module.exports = router;

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Get memos for logged in user
exports.getMemos = async (req, res) => {
  try {
    const memos = await prisma.memo.findMany({
      where: {
        userId: req.user.id,
        tenantId: req.user.tenantId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.json(memos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new memo
exports.createMemo = async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ message: "Memo content cannot be empty" });
  }

  try {
    const newMemo = await prisma.memo.create({
      data: {
        text: text.trim(),
        userId: req.user.id,
        tenantId: req.user.tenantId,
      },
    });
    res.status(201).json(newMemo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle completed status
exports.toggleMemo = async (req, res) => {
  const { id } = req.params;

  try {
    const memo = await prisma.memo.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!memo) {
      return res.status(404).json({ message: "Memo not found" });
    }

    if (memo.userId !== req.user.id || memo.tenantId !== req.user.tenantId) {
      return res.status(403).json({ message: "Unauthorized access to memo" });
    }

    const updatedMemo = await prisma.memo.update({
      where: { id: parseInt(id, 10) },
      data: { completed: !memo.completed },
    });

    res.json(updatedMemo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete memo
exports.deleteMemo = async (req, res) => {
  const { id } = req.params;

  try {
    const memo = await prisma.memo.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!memo) {
      return res.status(404).json({ message: "Memo not found" });
    }

    if (memo.userId !== req.user.id || memo.tenantId !== req.user.tenantId) {
      return res.status(403).json({ message: "Unauthorized access to memo" });
    }

    await prisma.memo.delete({
      where: { id: parseInt(id, 10) },
    });

    res.json({ message: "Memo deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

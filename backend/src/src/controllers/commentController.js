const prisma = require("../utils/prisma");

const addComment = async (req, res) => {
  try {
    const taskId = parseInt(req.params.id, 10);

    if (Number.isNaN(taskId)) {
      return res.status(400).json({ message: "Invalid taskId" });
    }

    // Ensure the task exists in the same tenant before adding comment
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        tenantId: req.user.tenantId,
      },
      select: { id: true },
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const comment = await prisma.comment.create({
      data: {
        message: req.body.message,

        taskId,

        createdById: req.user.id,

        tenantId: req.user.tenantId,
      },
      select: {
        id: true,
        message: true,
        taskId: true,
        createdById: true,
        createdAt: true,
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getComments = async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({
      where: {
        taskId: parseInt(req.params.id),

        tenantId: req.user.tenantId,
      },
      select: {
        id: true,
        message: true,
        taskId: true,
        createdById: true,
        createdAt: true,
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  addComment,
  getComments,
};
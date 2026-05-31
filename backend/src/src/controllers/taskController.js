const prisma = require("../utils/prisma");

const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      dueDate,
      assignedToId,
    } = req.body;

    // Validate assignedToId based on user role
    if (assignedToId !== undefined && assignedToId !== null && assignedToId !== "") {
      const assignedIdNum = Number(assignedToId);

      // Prisma expects Int for `where.id`
      if (!Number.isInteger(assignedIdNum)) {
        return res
          .status(400)
          .json({ message: "assignedToId must be an integer" });
      }

      const assignedUser = await prisma.user.findUnique({
        where: { id: assignedIdNum },
        select: { id: true, role: true, tenantId: true },
      });

      if (!assignedUser) {
        return res.status(404).json({ message: "Assigned user not found" });
      }

      if (assignedUser.tenantId !== req.user.tenantId) {
        return res.status(403).json({ message: "Cannot assign tasks to users from another tenant" });
      }

      // Manager can only assign tasks to MEMBERs
      if (req.user.role === "MANAGER" && assignedUser.role !== "MEMBER") {
        return res.status(403).json({ message: "Managers can only assign tasks to team members (MEMBER role)" });
      }

        // Admin can assign to any user in the tenant (no additional restriction needed)
    }

    const assignedToIdNum =
      assignedToId !== undefined && assignedToId !== null && assignedToId !== ""
        ? Number(assignedToId)
        : null;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority,
        dueDate: new Date(dueDate),

        createdById: req.user.id,

        assignedToId: assignedToIdNum,

        tenantId: req.user.tenantId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        priority: true,
        status: true,
        dueDate: true,
        createdById: true,
        assignedToId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getTasks = async (req, res) => {
  try {
    let tasks;

    if (req.user.role === "MEMBER") {
      tasks = await prisma.task.findMany({
        where: {
          assignedToId: req.user.id,
          tenantId: req.user.tenantId,
        },
        select: {
          id: true,
          title: true,
          description: true,
          priority: true,
          status: true,
          dueDate: true,
          createdById: true,
          assignedToId: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } else {
      tasks = await prisma.task.findMany({
        where: {
          tenantId: req.user.tenantId,
        },
        select: {
          id: true,
          title: true,
          description: true,
          priority: true,
          status: true,
          dueDate: true,
          createdById: true,
          assignedToId: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    }

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await prisma.task.findFirst({
      where: {
        id: parseInt(req.params.id),
        tenantId: req.user.tenantId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        priority: true,
        status: true,
        dueDate: true,
        createdById: true,
        assignedToId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateTask = async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        tenantId: req.user.tenantId,
      },
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    let updatedData = {};

    if (req.user.role === "MEMBER") {
      updatedData.status = req.body.status;
    } else {
      updatedData = req.body;
    }

    const updatedTask = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: updatedData,
      select: {
        id: true,
        title: true,
        description: true,
        priority: true,
        status: true,
        dueDate: true,
        createdById: true,
        assignedToId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);

    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        tenantId: req.user.tenantId,
      },
    });

    if (!existingTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if task has comments
    const commentCount = await prisma.comment.count({
      where: { taskId: taskId }
    });

    if (commentCount > 0) {
      // Delete comments first
      await prisma.comment.deleteMany({
        where: { taskId: taskId }
      });
    }

    await prisma.task.delete({
      where: {
        id: taskId,
      },
    });

    res.status(200).json({
      message: "Task deleted",
    });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
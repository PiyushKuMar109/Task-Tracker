const prisma = require("../utils/prisma");
const { logActivity } = require("../utils/activityLogger");

const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      dueDate,
      assignedToId,
      tags,
    } = req.body;

    // Validate assignedToId based on user role
    if (assignedToId !== undefined && assignedToId !== null && assignedToId !== "") {
      const assignedIdNum = Number(assignedToId);

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

      // Manager can only assign tasks to team members (DEVELOPER, QA, DESIGNER, MEMBER)
      if (req.user.role === "MANAGER" && !["DEVELOPER", "QA", "DESIGNER", "MEMBER"].includes(assignedUser.role)) {
        return res.status(403).json({ message: "Managers can only assign tasks to team members (DEVELOPER, QA, DESIGNER, MEMBER roles)" });
      }
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
        tags: {
          create: (tags || []).map((t) => ({
            name: t.name,
            color: t.color || "#4f46e5",
            tenantId: req.user.tenantId,
          })),
        },
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
        timeSpent: true,
        createdAt: true,
        updatedAt: true,
        tags: true,
      },
    });

    if (task.assignedToId) {
      await prisma.notification.create({
        data: {
          message: `New task assigned to you: "${task.title}"`,
          userId: task.assignedToId,
          tenantId: req.user.tenantId,
        },
      }).catch(console.error);
    }

    await logActivity({
      userId: req.user.id,
      tenantId: req.user.tenantId,
      type: "TASK_CREATED",
      description: `created task "${task.title}"`,
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

    if (["DEVELOPER", "QA", "DESIGNER", "MEMBER"].includes(req.user.role)) {
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
          timeSpent: true,
          createdAt: true,
          updatedAt: true,
          tags: true,
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
          timeSpent: true,
          createdAt: true,
          updatedAt: true,
          tags: true,
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
        timeSpent: true,
        createdAt: true,
        updatedAt: true,
        tags: true,
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

    if (["DEVELOPER", "QA", "DESIGNER", "MEMBER"].includes(req.user.role)) {
      updatedData.status = req.body.status;
    } else {
      const { tags, ...rest } = req.body;
      updatedData = rest;

      if (tags !== undefined) {
        await prisma.tag.deleteMany({ where: { taskId } });
        updatedData.tags = {
          create: (tags || []).map((t) => ({
            name: t.name,
            color: t.color || "#4f46e5",
            tenantId: req.user.tenantId,
          })),
        };
      }
    }

    // Parse dueDate correctly if updated
    if (updatedData.dueDate) {
      updatedData.dueDate = new Date(updatedData.dueDate);
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
        timeSpent: true,
        createdAt: true,
        updatedAt: true,
        tags: true,
      },
    });

    if (updatedTask.assignedToId) {
      await prisma.notification.create({
        data: {
          message: `Task updated: "${updatedTask.title}" has status ${updatedTask.status}`,
          userId: updatedTask.assignedToId,
          tenantId: req.user.tenantId,
        },
      }).catch(console.error);
    }

    await logActivity({
      userId: req.user.id,
      tenantId: req.user.tenantId,
      type: "TASK_UPDATED",
      description: `updated task "${updatedTask.title}"`,
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

    // Delete related entities first
    await prisma.comment.deleteMany({ where: { taskId } });
    await prisma.tag.deleteMany({ where: { taskId } });
    await prisma.subTask.deleteMany({ where: { taskId } });
    await prisma.attachment.deleteMany({ where: { taskId } });

    await prisma.task.delete({
      where: {
        id: taskId,
      },
    });

    await logActivity({
      userId: req.user.id,
      tenantId: req.user.tenantId,
      type: "TASK_DELETED",
      description: `deleted task "${existingTask.title}"`,
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

const updateTimeSpent = async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const { timeSpent } = req.body;

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        tenantId: req.user.tenantId,
      },
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { timeSpent: parseInt(timeSpent, 10) },
      select: {
        id: true,
        title: true,
        timeSpent: true,
      },
    });

    await logActivity({
      userId: req.user.id,
      tenantId: req.user.tenantId,
      type: "TASK_UPDATED",
      description: `tracked ${Math.round(timeSpent / 60)}m spent on task "${task.title}"`,
    });

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateTimeSpent,
};
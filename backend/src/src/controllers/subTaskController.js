const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Get sub-tasks for a task
exports.getSubtasks = async (req, res) => {
  const taskId = parseInt(req.params.id, 10);
  try {
    const subTasks = await prisma.subTask.findMany({
      where: {
        taskId: taskId,
        tenantId: req.user.tenantId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    res.json(subTasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new sub-task
exports.createSubTask = async (req, res) => {
  const taskId = parseInt(req.params.id, 10);
  const { title } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ message: "Sub-task title cannot be empty" });
  }

  try {
    // Verify task exists in tenant
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        tenantId: req.user.tenantId,
      },
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const newSubTask = await prisma.subTask.create({
      data: {
        title: title.trim(),
        taskId,
        tenantId: req.user.tenantId,
      },
    });

    res.status(201).json(newSubTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle sub-task completed status
exports.toggleSubTask = async (req, res) => {
  const { id } = req.params;

  try {
    const subTask = await prisma.subTask.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!subTask) {
      return res.status(404).json({ message: "Sub-task not found" });
    }

    if (subTask.tenantId !== req.user.tenantId) {
      return res.status(403).json({ message: "Unauthorized access to sub-task" });
    }

    const updated = await prisma.subTask.update({
      where: { id: parseInt(id, 10) },
      data: { completed: !subTask.completed },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a sub-task
exports.deleteSubTask = async (req, res) => {
  const { id } = req.params;

  try {
    const subTask = await prisma.subTask.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!subTask) {
      return res.status(404).json({ message: "Sub-task not found" });
    }

    if (subTask.tenantId !== req.user.tenantId) {
      return res.status(403).json({ message: "Unauthorized access to sub-task" });
    }

    await prisma.subTask.delete({
      where: { id: parseInt(id, 10) },
    });

    res.json({ message: "Sub-task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

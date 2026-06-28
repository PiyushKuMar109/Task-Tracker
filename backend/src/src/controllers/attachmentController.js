const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Get attachments for a specific task
exports.getAttachments = async (req, res) => {
  const taskId = parseInt(req.params.id, 10);

  try {
    const attachments = await prisma.attachment.findMany({
      where: {
        taskId: taskId,
        tenantId: req.user.tenantId,
      },
      select: {
        id: true,
        fileName: true,
        fileType: true,
        createdAt: true,
        // Exclude large base64 fileData from the initial listing for performance
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.json(attachments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Download / Get specific attachment with data
exports.getAttachmentData = async (req, res) => {
  const { attachmentId } = req.params;

  try {
    const attachment = await prisma.attachment.findUnique({
      where: {
        id: parseInt(attachmentId, 10),
      },
    });

    if (!attachment) {
      return res.status(404).json({ message: "Attachment not found" });
    }

    if (attachment.tenantId !== req.user.tenantId) {
      return res.status(403).json({ message: "Unauthorized access to attachment" });
    }

    res.json(attachment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload attachment (base64 payload)
exports.uploadAttachment = async (req, res) => {
  const taskId = parseInt(req.params.id, 10);
  const { fileName, fileType, fileData } = req.body;

  if (!fileName || !fileType || !fileData) {
    return res.status(400).json({ message: "File name, type, and base64 data are required" });
  }

  try {
    // Verify task exists and belongs to tenant
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        tenantId: req.user.tenantId,
      },
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const newAttachment = await prisma.attachment.create({
      data: {
        fileName,
        fileType,
        fileData,
        taskId,
        tenantId: req.user.tenantId,
      },
      select: {
        id: true,
        fileName: true,
        fileType: true,
        createdAt: true,
      },
    });

    res.status(201).json(newAttachment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

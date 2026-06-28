const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Get recent messages for tenant
exports.getMessages = async (req, res) => {
  try {
    const messages = await prisma.chatMessage.findMany({
      where: {
        tenantId: req.user.tenantId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 50, // Limit to last 50 messages
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Post a new message
exports.postMessage = async (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ message: "Message content cannot be empty" });
  }

  try {
    const newMessage = await prisma.chatMessage.create({
      data: {
        message: message.trim(),
        userId: req.user.id,
        tenantId: req.user.tenantId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

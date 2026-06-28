const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Get notifications for logged user
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: req.user.id,
        tenantId: req.user.tenantId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  const { id } = req.params;
  try {
    const notif = await prisma.notification.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!notif) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (notif.userId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const updated = await prisma.notification.update({
      where: { id: parseInt(id, 10) },
      data: { isRead: true },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark all as read
exports.markAllAsRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: {
        userId: req.user.id,
        isRead: false,
      },
      data: { isRead: true },
    });
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

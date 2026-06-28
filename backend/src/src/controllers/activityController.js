const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getActivities = async (req, res) => {
  try {
    const activities = await prisma.activity.findMany({
      where: {
        tenantId: req.user.tenantId,
      },
      include: {
        user: {
          select: {
            name: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 15,
    });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

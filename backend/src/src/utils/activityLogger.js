const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function logActivity({ userId, tenantId, type, description }) {
  try {
    if (!userId || !tenantId || !type || !description) {
      console.warn("Skipping activity log: missing required fields", { userId, tenantId, type, description });
      return;
    }
    
    await prisma.activity.create({
      data: {
        description,
        type,
        tenantId,
        userId: parseInt(userId, 10),
      },
    });
  } catch (err) {
    console.error("Failed to write activity log:", err);
  }
}

module.exports = {
  logActivity,
};

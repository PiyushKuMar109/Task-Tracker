const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Get tenant settings (auto-creates if missing)
exports.getTenantSettings = async (req, res) => {
  try {
    let settings = await prisma.tenantSetting.findUnique({
      where: { tenantId: req.user.tenantId },
    });

    if (!settings) {
      settings = await prisma.tenantSetting.create({
        data: {
          tenantId: req.user.tenantId,
          companyName: "Task Tracker Workspace",
          maxLeavesPerYear: 30,
          standardHoursPerWeek: 40,
        },
      });
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update tenant settings
exports.updateTenantSettings = async (req, res) => {
  const { companyName, maxLeavesPerYear, standardHoursPerWeek } = req.body;
  try {
    const updated = await prisma.tenantSetting.upsert({
      where: { tenantId: req.user.tenantId },
      update: {
        companyName,
        maxLeavesPerYear: parseInt(maxLeavesPerYear, 10) || 30,
        standardHoursPerWeek: parseInt(standardHoursPerWeek, 10) || 40,
      },
      create: {
        tenantId: req.user.tenantId,
        companyName: companyName || "Task Tracker Workspace",
        maxLeavesPerYear: parseInt(maxLeavesPerYear, 10) || 30,
        standardHoursPerWeek: parseInt(standardHoursPerWeek, 10) || 40,
      },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

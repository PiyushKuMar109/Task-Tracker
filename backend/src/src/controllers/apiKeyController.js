const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const crypto = require("crypto");

// Get active API keys
exports.getApiKeys = async (req, res) => {
  try {
    const keys = await prisma.apiKey.findMany({
      where: { tenantId: req.user.tenantId },
      orderBy: { createdAt: "desc" },
    });
    res.json(keys);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new API key
exports.createApiKey = async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ message: "API Key name is required" });
  }

  try {
    const generatedKey = `tt_key_${crypto.randomBytes(16).toString("hex")}`;
    const newKey = await prisma.apiKey.create({
      data: {
        key: generatedKey,
        name: name.trim(),
        userId: req.user.id,
        tenantId: req.user.tenantId,
      },
    });
    res.status(201).json(newKey);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Revoke / Delete API key
exports.deleteApiKey = async (req, res) => {
  const { id } = req.params;
  try {
    const keyRecord = await prisma.apiKey.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!keyRecord) {
      return res.status(404).json({ message: "API Key not found" });
    }

    if (keyRecord.tenantId !== req.user.tenantId) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    await prisma.apiKey.delete({
      where: { id: parseInt(id, 10) },
    });

    res.json({ message: "API Key revoked successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

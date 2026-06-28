const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const prisma = require("../utils/prisma");
const { generateTenantId } = require("../utils/tenantGenerator");

const signup = async (req, res) => {
  try {
    const { name, email, password, role, tenantId } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Prisma enum(Role) expects: SUPER_ADMIN | ADMIN | MANAGER | HR | DEVELOPER | QA | DESIGNER | MEMBER
    const allowedRoles = ["SUPER_ADMIN", "ADMIN", "MANAGER", "HR", "DEVELOPER", "QA", "DESIGNER", "MEMBER"];
    const normalizedRole =
      typeof role === "string" ? role.toUpperCase() : undefined;

    // Optional: if frontend sends USER, map it to MEMBER
    const finalRole = normalizedRole === "USER" ? "MEMBER" : normalizedRole;

    if (!finalRole || !allowedRoles.includes(finalRole)) {
      return res.status(400).json({
        message: `Invalid role. Expected one of: ${allowedRoles.join(", ")}`,
      });
    }

    // Auto-generate tenantId if not provided
    const finalTenantId = tenantId || generateTenantId();

    // Ensure tenant exists before creating user
    await prisma.tenant.upsert({
      where: { tenantId: finalTenantId },
      update: {},
      create: {
        tenantId: finalTenantId,
        name: `${name}'s Workspace`,
      },
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: finalRole,
        tenantId: finalTenantId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return res.status(201).json({
      message: "Signup successful",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        tenantId: user.tenantId,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  signup,
  login,
};
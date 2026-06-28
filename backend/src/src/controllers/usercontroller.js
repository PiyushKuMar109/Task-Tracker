const prisma = require("../utils/prisma");

const getUsers = async (req, res) => {
  try {
    let users;
    
    if (req.user.role === "SUPER_ADMIN") {
      // SUPER_ADMIN can see all users across all tenants
      users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });
    } else if (req.user.role === "ADMIN" || req.user.role === "HR") {
      // ADMIN can see all users in their tenant only with manager info
      users = await prisma.user.findMany({
        where: {
          tenantId: req.user.tenantId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          managerId: true,
          manager: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    } else if (req.user.role === "MANAGER") {
      // Manager can only see users they added (their team members)
      users = await prisma.user.findMany({
        where: {
          tenantId: req.user.tenantId,
          managerId: req.user.id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          managerId: true,
        },
      });
    } else {
      // Members can only see themselves
      users = await prisma.user.findMany({
        where: {
          id: req.user.id,
          tenantId: req.user.tenantId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });
    }
    
    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const addUser = async (req, res) => {
  try {
    const { name, email, password, role, tenantId } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      if (existingUser.tenantId === req.user.tenantId) {
        return res.status(400).json({ message: "User already exists in this tenant" });
      } else {
        return res.status(400).json({ message: "User with this email already exists in a different tenant. Please use a different email." });
      }
    }
    
    // Managers can create team members (DEVELOPER, QA, DESIGNER, MEMBER), ADMIN/HR can create anyone
    let allowedRoles;
    if (req.user.role === "MANAGER") {
      allowedRoles = ["DEVELOPER", "QA", "DESIGNER", "MEMBER"];
    } else if (req.user.role === "ADMIN" || req.user.role === "SUPER_ADMIN" || req.user.role === "HR") {
      allowedRoles = ["ADMIN", "MANAGER", "HR", "DEVELOPER", "QA", "DESIGNER", "MEMBER"];
    } else {
      return res.status(403).json({ message: "You do not have permission to add users" });
    }
    
    const normalizedRole = typeof role === "string" ? role.toUpperCase() : undefined;
    if (!allowedRoles.includes(normalizedRole)) {
      return res.status(400).json({ message: `Invalid role. For ${req.user.role}, allowed roles are: ${allowedRoles.join(", ")}` });
    }
    
    // Use provided tenantId or default to creator's tenantId
    const finalTenantId = tenantId || req.user.tenantId;
    
    const bcrypt = require("bcrypt");
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Set managerId if the creator is a manager
    const managerId = req.user.role === "MANAGER" ? req.user.id : null;
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: normalizedRole,
        tenantId: finalTenantId,
        managerId,
      },
      select: { id: true, name: true, email: true, role: true, managerId: true },
    });
    res.status(201).json({ message: "User created", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const user = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // SUPER_ADMIN can delete any user across all tenants, ADMIN can delete within their tenant
    if (req.user.role !== "SUPER_ADMIN" && user.tenantId !== req.user.tenantId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Check if user has tasks or comments
    const taskCount = await prisma.task.count({
      where: {
        OR: [
          { createdById: Number(id) },
          { assignedToId: Number(id) }
        ]
      }
    });

    const commentCount = await prisma.comment.count({
      where: { createdById: Number(id) }
    });

    if (taskCount > 0 || commentCount > 0) {
      return res.status(400).json({ 
        message: "Cannot delete user with associated tasks or comments. Please reassign or delete their tasks first." 
      });
    }

    await prisma.user.delete({ where: { id: Number(id) } });
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUsersForAssignment = async (req, res) => {
  try {
    let users;
    
    if (req.user.role === "SUPER_ADMIN") {
      // SUPER_ADMIN can assign tasks to any user across all tenants
      users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });
    } else if (req.user.role === "ADMIN" || req.user.role === "HR") {
      // ADMIN and HR can assign tasks to any user in their tenant
      users = await prisma.user.findMany({
        where: {
          tenantId: req.user.tenantId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });
    } else if (req.user.role === "MANAGER") {
      // Manager can assign tasks to team members of type DEVELOPER, QA, DESIGNER, or MEMBER in their tenant
      users = await prisma.user.findMany({
        where: {
          tenantId: req.user.tenantId,
          role: {
            in: ["DEVELOPER", "QA", "DESIGNER", "MEMBER"],
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });
    } else {
      // Members cannot assign tasks
      return res.status(403).json({ 
        message: "You do not have permission to assign tasks" 
      });
    }
    
    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getUsers,
  addUser,
  deleteUser,
  getUsersForAssignment,
};
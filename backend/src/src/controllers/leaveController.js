const prisma = require("../utils/prisma");

const createLeave = async (req, res) => {
  try {
    const { startDate, endDate, reason } = req.body;

    if (!startDate || !endDate || !reason) {
      return res.status(400).json({ message: "All fields (startDate, endDate, reason) are required" });
    }

    const leave = await prisma.leaveRequest.create({
      data: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        userId: req.user.id,
        tenantId: req.user.tenantId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return res.status(201).json(leave);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getLeaves = async (req, res) => {
  try {
    let leaves;

    if (req.user.role === "SUPER_ADMIN") {
      // SUPER_ADMIN can see all leaves across all tenants
      leaves = await prisma.leaveRequest.findMany({
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
          approvedBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (req.user.role === "ADMIN" || req.user.role === "HR") {
      // ADMIN and HR can see all leaves in their tenant
      leaves = await prisma.leaveRequest.findMany({
        where: {
          tenantId: req.user.tenantId,
        },
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
          approvedBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (req.user.role === "MANAGER") {
      // MANAGER can see their own leaves and leaves of team members reporting directly to them
      leaves = await prisma.leaveRequest.findMany({
        where: {
          tenantId: req.user.tenantId,
          OR: [
            { userId: req.user.id },
            {
              user: {
                managerId: req.user.id,
              },
            },
          ],
        },
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
          approvedBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      // Regular employees (DEVELOPER, QA, DESIGNER, MEMBER) can only see their own leaves
      leaves = await prisma.leaveRequest.findMany({
        where: {
          userId: req.user.id,
          tenantId: req.user.tenantId,
        },
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
          approvedBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return res.status(200).json(leaves);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateLeaveStatus = async (req, res) => {
  try {
    const leaveId = parseInt(req.params.id);
    const { status } = req.body;

    if (!status || !["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be APPROVED or REJECTED." });
    }

    // Find the leave request and check its tenant boundaries
    const leave = await prisma.leaveRequest.findUnique({
      where: { id: leaveId },
      include: {
        user: true,
      },
    });

    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    // Check multi-tenant boundary
    if (req.user.role !== "SUPER_ADMIN" && leave.tenantId !== req.user.tenantId) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    // Role validation to approve/reject
    if (req.user.role === "MANAGER") {
      // Manager can only approve leaves for their team members
      if (leave.user.managerId !== req.user.id) {
        return res.status(403).json({ message: "Managers can only update leave status for team members reporting to them" });
      }
    } else if (req.user.role !== "SUPER_ADMIN" && req.user.role !== "ADMIN" && req.user.role !== "HR") {
      // Developer, QA, Designer, Member cannot update leaves
      return res.status(403).json({ message: "You do not have permission to approve/reject leave requests" });
    }

    // Update leave request status
    const updatedLeave = await prisma.leaveRequest.update({
      where: { id: leaveId },
      data: {
        status,
        approvedById: req.user.id,
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        approvedBy: { select: { id: true, name: true } },
      },
    });

    // Notify the applicant
    await prisma.notification.create({
      data: {
        message: `Your leave request has been ${status.toLowerCase()} by ${req.user.name}`,
        userId: updatedLeave.user.id,
        tenantId: req.user.tenantId,
      },
    }).catch(console.error);

    return res.status(200).json(updatedLeave);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createLeave,
  getLeaves,
  updateLeaveStatus,
};

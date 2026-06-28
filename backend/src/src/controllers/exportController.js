const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Helper to escape CSV cell contents
function escapeCSV(val) {
  if (val === null || val === undefined) return "";
  let str = String(val).replace(/"/g, '""'); // Escape quotes
  if (str.includes(",") || str.includes("\n") || str.includes('"')) {
    str = `"${str}"`;
  }
  return str;
}

// Export Tasks to CSV
exports.exportTasks = async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        tenantId: req.user.tenantId,
      },
      include: {
        assignedTo: {
          select: { name: true },
        },
        createdBy: {
          select: { name: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const headers = [
      "Task ID",
      "Title",
      "Description",
      "Priority",
      "Status",
      "Due Date",
      "Assigned To",
      "Created By",
      "Time Spent (Seconds)",
      "Time Spent (Minutes)",
      "Created At"
    ];

    const rows = tasks.map((t) => [
      t.id,
      t.title,
      t.description,
      t.priority,
      t.status,
      new Date(t.dueDate).toLocaleDateString(),
      t.assignedTo?.name || "Unassigned",
      t.createdBy?.name || "System",
      t.timeSpent,
      Math.round(t.timeSpent / 60),
      new Date(t.createdAt).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map(escapeCSV).join(","))
    ].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=workspace_tasks.csv");
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export Leaves to CSV
exports.exportLeaves = async (req, res) => {
  try {
    const leaves = await prisma.leaveRequest.findMany({
      where: {
        tenantId: req.user.tenantId,
      },
      include: {
        user: {
          select: { name: true, role: true },
        },
        approvedBy: {
          select: { name: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const headers = [
      "Leave ID",
      "Employee",
      "Role",
      "Start Date",
      "End Date",
      "Reason",
      "Status",
      "Approved By",
      "Created At"
    ];

    const rows = leaves.map((l) => [
      l.id,
      l.user?.name || "Unknown",
      l.user?.role || "N/A",
      new Date(l.startDate).toLocaleDateString(),
      new Date(l.endDate).toLocaleDateString(),
      l.reason,
      l.status,
      l.approvedBy?.name || "N/A",
      new Date(l.createdAt).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map(escapeCSV).join(","))
    ].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=workspace_leaves.csv");
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

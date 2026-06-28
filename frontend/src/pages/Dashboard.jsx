import { useEffect, useState, useContext } from "react";
import API from "../api/axios";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import TaskAnalytics from "../components/TaskAnalytics";
import ProgressChart from "../components/ProgressChart";
import { CheckSquare, Activity, Trash, Plus, ChevronLeft, ChevronRight, ClipboardList, LogOut, Download, Clock } from "lucide-react";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [memos, setMemos] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardView, setDashboardView] = useState("overview"); // "overview" or "calendar"

  // Memo input state
  const [memoText, setMemoText] = useState("");

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchData = async () => {
    try {
      const endpoints = [
        API.get("/tasks"),
        API.get("/activities"),
        API.get("/memos"),
        API.get("/leaves"),
      ];

      const isPrivileged = ["ADMIN", "SUPER_ADMIN", "HR", "MANAGER"].includes(user?.role);
      if (isPrivileged) {
        endpoints.push(API.get("/users"));
      }

      const results = await Promise.all(endpoints);
      
      setTasks(results[0].data);
      setActivities(results[1].data);
      setMemos(results[2].data);
      setLeaves(results[3].data.filter((l) => l.status === "APPROVED"));
      
      if (isPrivileged && results[4]) {
        setUsers(results[4].data);
      }
    } catch (error) {
      console.log("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const completedTasks = tasks.filter((task) => task.status === "DONE").length;
  const pendingTasks = tasks.filter((task) => task.status !== "DONE").length;

  // Memo actions
  const handleAddMemo = async (e) => {
    e.preventDefault();
    if (!memoText.trim()) return;

    try {
      const res = await API.post("/memos", { text: memoText });
      setMemos([res.data, ...memos]);
      setMemoText("");
      toast.success("Memo added!");
    } catch (err) {
      toast.error("Failed to add memo");
    }
  };

  const handleToggleMemo = async (id) => {
    try {
      const res = await API.put(`/memos/${id}/toggle`);
      setMemos(memos.map((m) => (m.id === id ? res.data : m)));
    } catch (err) {
      toast.error("Failed to toggle memo");
    }
  };

  const handleDeleteMemo = async (id) => {
    try {
      await API.delete(`/memos/${id}`);
      setMemos(memos.filter((m) => m.id !== id));
      toast.success("Memo deleted");
    } catch (err) {
      toast.error("Failed to delete memo");
    }
  };

  // Exporters
  const handleExportTasks = async () => {
    try {
      const res = await API.get("/export/tasks", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "workspace_tasks.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Tasks report exported!");
    } catch (err) {
      toast.error("Failed to export tasks report");
    }
  };

  const handleExportLeaves = async () => {
    try {
      const res = await API.get("/export/leaves", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "workspace_leaves.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Leaves report exported!");
    } catch (err) {
      toast.error("Failed to export leaves report");
    }
  };

  // Calendar math
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const daysArray = [];

  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    daysArray.push({
      day: prevMonthDays - i,
      month: month === 0 ? 11 : month - 1,
      year: month === 0 ? year - 1 : year,
      isCurrentMonth: false,
    });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push({
      day: i,
      month: month,
      year: year,
      isCurrentMonth: true,
    });
  }

  const remainingCells = 42 - daysArray.length;
  for (let i = 1; i <= remainingCells; i++) {
    daysArray.push({
      day: i,
      month: month === 11 ? 0 : month + 1,
      year: month === 11 ? year + 1 : year,
      isCurrentMonth: false,
    });
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-slate-655 text-xs animate-pulse font-mono-data">Loading Dashboard Analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-y-auto bg-white">
        <Navbar setSidebarOpen={setSidebarOpen} />

        <div className="content-padding">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="section-label">Overview Eyebrow</span>
              <h1 className="text-[20px] font-semibold text-[#1e1b4b] mt-1">
                {dashboardView === "calendar" ? "Visual Schedule" : "Dashboard Overview"}
              </h1>
              <p className="text-[#6b7280] text-[12px] mt-0.5">
                {dashboardView === "calendar" 
                  ? "Deadlines and approved leaves mapped collectively." 
                  : "Track tasks, progress and team performance."}
              </p>
            </div>

            {/* View switcher & Exporters */}
            <div className="flex flex-wrap items-center gap-3">
              {["ADMIN", "SUPER_ADMIN", "HR", "MANAGER"].includes(user?.role) && (
                <div className="flex gap-2">
                  <button
                    onClick={handleExportTasks}
                    className="secondary-btn flex items-center gap-1.5"
                    title="Export Tasks report to CSV"
                  >
                    <Download size={13} />
                    Export Tasks
                  </button>
                  <button
                    onClick={handleExportLeaves}
                    className="secondary-btn flex items-center gap-1.5"
                    title="Export Leaves report to CSV"
                  >
                    <Download size={13} />
                    Export Leaves
                  </button>
                </div>
              )}

              {dashboardView === "calendar" && (
                <div className="flex items-center gap-1.5 bg-[#f3f4f6] p-[2px] rounded-lg border-hairline">
                  <button onClick={prevMonth} className="p-1 hover:bg-white rounded text-[#6b7280]">
                    <ChevronLeft size={13} />
                  </button>
                  <span className="font-mono-data text-[10px] uppercase font-bold text-[#1e1b4b] w-20 text-center select-none">
                    {monthNames[month].slice(0, 3)} {year}
                  </span>
                  <button onClick={nextMonth} className="p-1 hover:bg-white rounded text-[#6b7280]">
                    <ChevronRight size={13} />
                  </button>
                </div>
              )}

              {/* Tab Toggle */}
              <div className="tab-toggle-container">
                <button
                  onClick={() => setDashboardView("overview")}
                  className={`tab-toggle-item ${dashboardView === "overview" ? "active" : ""}`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setDashboardView("calendar")}
                  className={`tab-toggle-item ${dashboardView === "calendar" ? "active" : ""}`}
                >
                  Calendar View
                </button>
              </div>
            </div>
          </div>

          {/* Overdue Alerts Banner */}
          {dashboardView === "overview" && (() => {
            const overdueTasksCount = tasks.filter((t) => {
              const isAssignedToMe = t.assignedToId === user?.id;
              const isOverdue = new Date(t.dueDate) < new Date() && t.status !== "DONE";
              return isAssignedToMe && isOverdue;
            }).length;

            return overdueTasksCount > 0 ? (
              <div className="bg-[#fee2e2] border-hairline border-l-[3px] border-l-[#ef4444] rounded-[12px] p-4 mb-6 flex items-center justify-between animate-slide-down">
                <div className="flex items-center gap-3">
                  <span className="text-xl">⚠️</span>
                  <div>
                    <h4 className="text-[13px] font-semibold text-[#991b1b]">Attention Required</h4>
                    <p className="text-[11px] text-[#991b1b]/80 mt-0.5 font-mono-data font-medium">
                      You have {overdueTasksCount} overdue task{overdueTasksCount > 1 ? 's' : ''} assigned to you. Please review and update their schedule.
                    </p>
                  </div>
                </div>
              </div>
            ) : null;
          })()}

          {dashboardView === "calendar" ? (
            /* CALENDAR VIEW */
            <div className="bg-white border-hairline rounded-[12px] overflow-hidden animate-fade-in">
              <div className="grid grid-cols-7 border-b-hairline bg-[#f8f8fb] text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider text-center py-2.5 font-mono-data">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>

              <div className="grid grid-cols-7 divide-x divide-y divide-[#e8e8f0] border-l-hairline border-t-hairline">
                {daysArray.map((cell, idx) => {
                  const cellDateString = new Date(cell.year, cell.month, cell.day).toDateString();
                  
                  const dayTasks = tasks.filter((t) => {
                    return new Date(t.dueDate).toDateString() === cellDateString;
                  });

                  const dayLeaves = leaves.filter((l) => {
                    const start = new Date(l.startDate);
                    const end = new Date(l.endDate);
                    const current = new Date(cell.year, cell.month, cell.day);
                    
                    start.setHours(0,0,0,0);
                    end.setHours(0,0,0,0);
                    current.setHours(0,0,0,0);
                    
                    return current >= start && current <= end;
                  });

                  const todayString = new Date().toDateString();
                  const isToday = cellDateString === todayString;

                  return (
                    <div
                      key={idx}
                      className={`min-h-[95px] p-2 flex flex-col justify-between transition-colors ${
                        cell.isCurrentMonth
                          ? isToday
                            ? "bg-[#ede9fe]/10"
                            : "bg-white"
                          : "bg-[#fafafa] text-[#9ca3af]"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span
                          className={`text-[10px] font-bold font-mono-data w-[18px] h-[18px] rounded-full flex items-center justify-center ${
                            isToday
                              ? "bg-[#4f46e5] text-white"
                              : cell.isCurrentMonth
                              ? "text-[#1e1b4b]"
                              : "text-[#9ca3af]"
                          }`}
                        >
                          {cell.day}
                        </span>
                      </div>

                      <div className="flex-1 space-y-1 overflow-y-auto max-h-[65px] mt-1 pr-0.5">
                        {dayTasks.map((t) => (
                          <div
                            key={t.id}
                            className="flex items-center gap-1 text-[9px] font-mono-data font-bold px-1 py-0.5 rounded-sm bg-[#ede9fe] text-[#4338ca] border-none truncate"
                            title={`Task: ${t.title}`}
                          >
                            <ClipboardList size={10} className="shrink-0" />
                            <span className="truncate">{t.title}</span>
                          </div>
                        ))}

                        {dayLeaves.map((l) => (
                          <div
                            key={l.id}
                            className="flex items-center gap-1 text-[9px] font-mono-data font-bold px-1 py-0.5 rounded-sm bg-[#d1fae5] text-[#065f46] border-none truncate"
                            title={`Leave: ${l.user?.name} - ${l.reason}`}
                          >
                            <LogOut size={10} className="shrink-0" />
                            <span className="truncate">{l.user?.name} Off</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* OVERVIEW VIEW */
            <>
              {/* Stats Grid - 3 Columns, 14px gap */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-[14px]">
                {/* Total Tasks Card */}
                <div className="bg-white border-hairline rounded-[12px] p-4 flex justify-between items-center stripe-indigo shadow-none relative overflow-hidden">
                  <div>
                    <span className="section-label mb-1 block">Total Tasks</span>
                    <h2 className="font-mono-data text-[32px] font-bold text-[#4f46e5] leading-none">
                      {tasks.length}
                    </h2>
                  </div>
                  <div className="w-[32px] h-[32px] rounded-lg bg-[#ede9fe] flex items-center justify-center text-[#4f46e5]">
                    <ClipboardList size={15} />
                  </div>
                </div>

                {/* Completed Tasks Card */}
                <div className="bg-white border-hairline rounded-[12px] p-4 flex justify-between items-center stripe-emerald shadow-none relative overflow-hidden">
                  <div>
                    <span className="section-label mb-1 block">Completed</span>
                    <h2 className="font-mono-data text-[32px] font-bold text-[#10b981] leading-none">
                      {completedTasks}
                    </h2>
                  </div>
                  <div className="w-[32px] h-[32px] rounded-lg bg-[#d1fae5] flex items-center justify-center text-[#10b981]">
                    <CheckSquare size={15} />
                  </div>
                </div>

                {/* Pending Tasks Card */}
                <div className="bg-white border-hairline rounded-[12px] p-4 flex justify-between items-center stripe-amber shadow-none relative overflow-hidden">
                  <div>
                    <span className="section-label mb-1 block">Pending</span>
                    <h2 className="font-mono-data text-[32px] font-bold text-[#f59e0b] leading-none">
                      {pendingTasks}
                    </h2>
                  </div>
                  <div className="w-[32px] h-[32px] rounded-lg bg-[#fef3c7] flex items-center justify-center text-[#f59e0b]">
                    <Clock size={15} />
                  </div>
                </div>
              </div>

              {/* Team Workload Balancer Widget */}
              {["ADMIN", "SUPER_ADMIN", "HR", "MANAGER"].includes(user?.role) && users.length > 0 && (
                <div className="bg-white border-hairline rounded-[12px] p-5 mt-[20px]">
                  <div className="mb-4">
                    <span className="section-label">Team Load Eyebrow</span>
                    <h2 className="text-[14px] font-semibold text-[#1e1b4b] mt-1">Resource Load Balancer</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {users.filter(u => u.role !== 'SUPER_ADMIN').map((teamUser) => {
                      const userTasks = tasks.filter(t => t.assignedToId === teamUser.id);
                      const completed = userTasks.filter(t => t.status === 'DONE').length;
                      const totalTasks = userTasks.length;
                      const loadPercent = totalTasks ? Math.round((completed / totalTasks) * 100) : 0;
                      
                      const totalSeconds = userTasks.reduce((sum, t) => sum + (t.timeSpent || 0), 0);
                      const totalHrs = Math.round((totalSeconds / 3600) * 10) / 10;

                      return (
                        <div key={teamUser.id} className="border-hairline rounded-[8px] p-3.5 bg-[#fafafa] flex flex-col justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-[28px] h-[28px] rounded-full bg-[#4f46e5] flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                              {teamUser.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-[12px] font-semibold text-[#1e1b4b] truncate">{teamUser.name}</p>
                              <p className="font-mono-data text-[8px] text-[#9ca3af] uppercase">{teamUser.role}</p>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px] font-mono-data text-[#6b7280]">
                              <span>TASKS: {totalTasks} ({completed} DONE)</span>
                              <span>{totalHrs} HRS</span>
                            </div>
                            
                            <div className="w-full bg-[#e8e8f0] rounded-full h-1">
                              <div
                                className="bg-[#10b981] h-1 rounded-full transition-all duration-300"
                                style={{ width: `${loadPercent}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Charts Grid */}
              <div className="grid lg:grid-cols-2 gap-6 mt-[20px]">
                <div className="bg-white border-hairline rounded-[12px] p-5">
                  <TaskAnalytics tasks={tasks} />
                </div>

                <div className="bg-white border-hairline rounded-[12px] p-5">
                  <ProgressChart tasks={tasks} />
                </div>
              </div>

              {/* Widgets Layout */}
              <div className="grid lg:grid-cols-3 gap-6 mt-[20px]">
                {/* Recent Tasks list */}
                <div className="bg-white border-hairline rounded-[12px] p-5 lg:col-span-2">
                  <div className="mb-4">
                    <span className="section-label">Tasks Tracker Eyebrow</span>
                    <h2 className="text-[14px] font-semibold text-[#1e1b4b] mt-1">Recent Tasks</h2>
                  </div>

                  {tasks.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-[#9ca3af] text-xs">No tasks logged.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {tasks.slice(0, 5).map((task) => (
                        <div
                          key={task.id}
                          className="flex justify-between items-center task-row-item"
                        >
                          <div>
                            <h3 className="text-[13px] font-medium text-[#1e1b4b]">
                              {task.title}
                            </h3>
                            <p className="font-mono-data text-[10px] text-[#9ca3af] mt-0.5">
                              PRIORITY: {task.priority}
                            </p>
                          </div>

                          <span
                            className={`badge ${
                              task.status === "DONE"
                                ? "badge-done"
                                : task.status === "IN_PROGRESS"
                                ? "badge-progress"
                                : "badge-todo"
                            }`}
                          >
                            {task.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Checklist (Private Memos) */}
                <div className="bg-white border-hairline rounded-[12px] p-5 flex flex-col justify-between">
                  <div>
                    <div className="mb-4 flex items-center gap-1.5">
                      <CheckSquare size={16} className="text-[#4f46e5]" />
                      <span className="section-label">Personal Checklist</span>
                    </div>

                    <form onSubmit={handleAddMemo} className="flex gap-1.5 mb-4">
                      <input
                        type="text"
                        placeholder="Add personal memo..."
                        value={memoText}
                        onChange={(e) => setMemoText(e.target.value)}
                        className="flex-1 text-[12px] py-1 border-hairline bg-[#f9fafb]"
                      />
                      <button type="submit" className="primary-btn px-2 rounded-lg flex items-center justify-center shrink-0">
                        <Plus size={14} />
                      </button>
                    </form>

                    <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
                      {memos.length === 0 ? (
                        <p className="text-[11px] text-[#9ca3af] text-center py-4">No checklist notes.</p>
                      ) : (
                        memos.map((memo) => (
                          <div key={memo.id} className="flex items-center justify-between gap-2.5 group py-1 border-b border-dashed border-[#e8e8f0]/40">
                            <label className="flex items-center gap-2 cursor-pointer flex-1 overflow-hidden">
                              <input
                                type="checkbox"
                                checked={memo.completed}
                                onChange={() => handleToggleMemo(memo.id)}
                                className="w-3.5 h-3.5 text-[#4f46e5] border-slate-350 rounded focus:ring-0 shrink-0"
                              />
                              <span className={`text-[12px] text-[#1e1b4b] truncate select-none ${memo.completed ? "line-through text-slate-400" : ""}`}>
                                {memo.text}
                              </span>
                            </label>

                            <button
                              onClick={() => handleDeleteMemo(memo.id)}
                              className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                            >
                              <Trash size={12} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="text-[9px] text-[#9ca3af] pt-2.5 border-t border-slate-100 font-mono-data uppercase">
                    Notes are private to you.
                  </div>
                </div>
              </div>

              {/* Activity Feed Widget */}
              <div className="bg-white border-hairline rounded-[12px] p-5 mt-[20px]">
                <div className="flex items-center gap-2 mb-4">
                  <Activity size={16} className="text-[#4f46e5]" />
                  <span className="section-label">Workspace Event Logs</span>
                </div>

                {activities.length === 0 ? (
                  <p className="text-[11px] text-[#9ca3af] text-center py-4">No events logged yet.</p>
                ) : (
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {activities.map((act) => (
                      <div key={act.id} className="flex items-start justify-between text-xs gap-3 py-1.5 border-b border-slate-50 last:border-none">
                        <div className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#4f46e5] mt-1.5 shrink-0" />
                          <div className="text-[12px]">
                            <span className="font-bold text-[#1e1b4b]">{act.user?.name}</span>{" "}
                            <span className="text-[#6b7280]">{act.description}</span>
                            <span className="font-mono-data text-[9px] text-[#4f46e5] ml-2 uppercase bg-[#ede9fe] px-1 rounded-sm">
                              {act.type.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                        <span className="font-mono-data text-[9px] text-[#9ca3af] whitespace-nowrap">
                          {new Date(act.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
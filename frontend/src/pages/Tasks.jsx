import { useEffect, useState, useContext } from "react";
import API from "../api/axios";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import TaskCard from "../components/TaskCard";

import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { Plus, Grid, List, ClipboardList } from "lucide-react";

export default function Tasks() {
  const { user } = useContext(AuthContext);

  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // "grid", "kanban", or "timeline"

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "",
    dueDate: "",
    assignedToId: "",
    tagsString: "",
  });

  useEffect(() => {
    fetchTasks();
    if (["ADMIN", "SUPER_ADMIN", "HR", "MANAGER"].includes(user?.role)) {
      fetchUsers();
    }
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await API.get("/tasks");
      setTasks(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get("/users");
      setUsers(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formattedTags = formData.tagsString
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((name) => ({ name, color: "#4f46e5" }));

    try {
      await API.post("/tasks", {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        dueDate: formData.dueDate,
        assignedToId: formData.assignedToId,
        tags: formattedTags,
      });
      toast.success("Task Created");
      fetchTasks();
      setFormData({
        title: "",
        description: "",
        priority: "",
        dueDate: "",
        assignedToId: "",
        tagsString: "",
      });
      setShowCreateForm(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create task");
    }
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    if (!taskId) return;
    try {
      await API.put(`/tasks/${taskId}`, { status: targetStatus });
      fetchTasks();
      toast.success("Task Moved to " + targetStatus.replace('_', ' '));
    } catch (error) {
      toast.error("Failed to move task");
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus = !statusFilter || task.status === statusFilter;
    const matchesPriority = !priorityFilter || task.priority === priorityFilter;
    const matchesTag =
      !tagFilter ||
      (task.tags && task.tags.some((t) => t.name.toLowerCase().includes(tagFilter.toLowerCase())));

    return matchesSearch && matchesStatus && matchesPriority && matchesTag;
  });

  // Timeline Days Calculation (14 days from today)
  const timelineDays = [];
  const startDay = new Date();
  startDay.setHours(0,0,0,0);
  for (let i = 0; i < 14; i++) {
    const date = new Date(startDay);
    date.setDate(startDay.getDate() + i);
    timelineDays.push(date);
  }

  return (
    <div className="min-h-screen flex bg-white text-[#1e1b4b]">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-y-auto bg-white">
        <Navbar setSidebarOpen={setSidebarOpen} />

        <div className="content-padding">
          {/* PAGE HEADER */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="section-label">Task Management Eyebrow</span>
              <h1 className="text-[20px] font-semibold text-[#1e1b4b] mt-1">Task Management</h1>
              <p className="text-[#6b7280] text-[12px] mt-0.5">
                Create, assign, and manage team tasks.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Tab Toggle - 3 Options: Grid, Kanban, Timeline */}
              <div className="tab-toggle-container">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`tab-toggle-item ${viewMode === "grid" ? "active" : ""}`}
                >
                  Grid View
                </button>
                <button
                  onClick={() => setViewMode("kanban")}
                  className={`tab-toggle-item ${viewMode === "kanban" ? "active" : ""}`}
                >
                  Kanban Board
                </button>
                <button
                  onClick={() => setViewMode("timeline")}
                  className={`tab-toggle-item ${viewMode === "timeline" ? "active" : ""}`}
                >
                  Timeline
                </button>
              </div>

              {["ADMIN", "SUPER_ADMIN", "HR", "MANAGER"].includes(user?.role) && (
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className={`${showCreateForm ? "secondary-btn danger-btn" : "primary-btn"} flex items-center gap-1.5`}
                >
                  {showCreateForm ? "Cancel" : "Create Task"}
                </button>
              )}
            </div>
          </div>

          {/* CREATE TASK FORM */}
          {["ADMIN", "SUPER_ADMIN", "HR", "MANAGER"].includes(user?.role) && showCreateForm && (
            <div className="bg-white border-hairline rounded-[12px] p-5 mb-6 animate-slide-down">
              <span className="section-label mb-3 block">Create Task</span>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="title"
                    placeholder="Task Title"
                    value={formData.title}
                    onChange={handleChange}
                    className="bg-[#f9fafb] border-hairline rounded-[7px] px-3 py-2 text-xs outline-none"
                    required
                  />

                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="bg-[#f9fafb] border-hairline rounded-[7px] px-3 py-2 text-xs"
                    required
                  >
                    <option value="">Select Priority</option>
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>

                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="bg-[#f9fafb] border-hairline rounded-[7px] px-3 py-2 text-xs"
                    required
                  />

                  <select
                    name="assignedToId"
                    value={formData.assignedToId}
                    onChange={handleChange}
                    className="bg-[#f9fafb] border-hairline rounded-[7px] px-3 py-2 text-xs"
                    required
                  >
                    <option value="">Select User to Assign</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    name="tagsString"
                    placeholder="Tags (comma-separated, e.g. FE, Design)"
                    value={formData.tagsString}
                    onChange={handleChange}
                    className="bg-[#f9fafb] border-hairline rounded-[7px] px-3 py-2 text-xs outline-none"
                  />
                </div>

                <textarea
                  rows="3"
                  name="description"
                  placeholder="Task Description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full bg-[#f9fafb] border-hairline rounded-[7px] px-3 py-2 text-xs"
                  required
                />

                <button type="submit" className="primary-btn">
                  Create Task
                </button>
              </form>
            </div>
          )}

          {/* FILTERS */}
          <div className="bg-white border-hairline rounded-[12px] p-5 mb-6">
            <span className="section-label mb-3.5 block">Filters & Search</span>

            <div className="grid md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-[#f9fafb] border-hairline rounded-[7px] px-3 py-2 text-xs"
              />

              <input
                type="text"
                placeholder="Filter by tag..."
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="bg-[#f9fafb] border-hairline rounded-[7px] px-3 py-2 text-xs"
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#f9fafb] border-hairline rounded-[7px] px-3 py-2 text-xs"
              >
                <option value="">All Statuses</option>
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="DONE">DONE</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-[#f9fafb] border-hairline rounded-[7px] px-3 py-2 text-xs"
              >
                <option value="">All Priorities</option>
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
            </div>
          </div>

          {/* TASKS VIEW CONTAINER */}
          {filteredTasks.length === 0 ? (
            <div className="bg-white border-hairline rounded-[12px] p-12 text-center">
              <div className="text-4xl mb-3">📋</div>
              <h3 className="text-[14px] font-semibold text-[#1e1b4b] mb-1">No Tasks Found</h3>
              <p className="text-[#6b7280] text-xs">
                Try changing filters or create a new task.
              </p>
            </div>
          ) : viewMode === "kanban" ? (
            <div className="grid lg:grid-cols-3 gap-6 items-start animate-fade-in">
              {["TODO", "IN_PROGRESS", "DONE"].map((columnStatus) => {
                const columnTasks = filteredTasks.filter((t) => t.status === columnStatus);
                return (
                  <div
                    key={columnStatus}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, columnStatus)}
                    className="bg-[#fafafa] rounded-[12px] p-4 border border-dashed border-[#e8e8f0] min-h-[520px] flex flex-col gap-4"
                  >
                    <div className="flex justify-between items-center px-1">
                      <span className="font-mono-data text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">
                        {columnStatus.replace("_", " ")}
                      </span>
                      <span className="font-mono-data text-[10px] font-bold px-2 py-0.5 bg-[#ede9fe] text-[#4f46e5] rounded-full">
                        {columnTasks.length}
                      </span>
                    </div>

                    <div className="space-y-4 flex-1 overflow-y-auto max-h-[700px] pr-1">
                      {columnTasks.map((task) => (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData("text/plain", task.id.toString())}
                          className="cursor-grab active:cursor-grabbing transition-transform hover:scale-[1.01]"
                        >
                          <TaskCard task={task} fetchTasks={fetchTasks} />
                        </div>
                      ))}
                      {columnTasks.length === 0 && (
                        <div className="border border-dashed border-[#e8e8f0] rounded-[12px] py-16 text-center text-[#9ca3af] font-mono-data text-[10px] uppercase tracking-wider bg-white select-none">
                          Drag tasks here
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : viewMode === "timeline" ? (
            /* TIMELINE VIEW (GANTT) */
            <div className="bg-white border-hairline rounded-[12px] overflow-hidden animate-fade-in">
              <div className="p-4 border-b-hairline bg-[#fafafa]">
                <span className="section-label">Workspace Gantt Chart (14 Days)</span>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  {/* Timeline Dates Header */}
                  <div className="flex border-b-hairline bg-[#f8f8fb]">
                    <div className="w-1/4 px-4 py-3 text-[10px] font-bold text-[#9ca3af] uppercase font-mono-data">Task Details</div>
                    <div className="w-3/4 flex divide-x divide-[#e8e8f0]">
                      {timelineDays.map((date, idx) => (
                        <div key={idx} className="flex-1 text-center py-2.5 flex flex-col justify-center">
                          <span className="font-mono-data text-[9px] uppercase font-bold text-[#9ca3af]">
                            {date.toLocaleDateString([], { weekday: 'short' }).slice(0, 1)}
                          </span>
                          <span className="font-mono-data text-[10px] text-[#1e1b4b] font-bold mt-0.5">
                            {date.getDate()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Task Timeline Rows */}
                  <div className="divide-y divide-[#e8e8f0]/60">
                    {filteredTasks.map((t) => {
                      const dueDate = new Date(t.dueDate);
                      dueDate.setHours(0,0,0,0);

                      return (
                        <div key={t.id} className="flex items-center hover:bg-[#fafafa]/50 transition-colors">
                          {/* Task details */}
                          <div className="w-1/4 px-4 py-3.5 overflow-hidden">
                            <p className="text-[12px] font-semibold text-[#1e1b4b] truncate">{t.title}</p>
                            <p className="font-mono-data text-[9px] text-[#9ca3af] uppercase mt-0.5">
                              DUE: {dueDate.toLocaleDateString()}
                            </p>
                          </div>

                          {/* Gantt Grid */}
                          <div className="w-3/4 flex h-14 items-center relative divide-x divide-[#e8e8f0]/40">
                            {timelineDays.map((day, dIdx) => {
                              const dayTime = day.getTime();
                              const isSpan = dayTime >= new Date().setHours(0,0,0,0) && dayTime <= dueDate.getTime();
                              const isDue = dayTime === dueDate.getTime();

                              return (
                                <div key={dIdx} className="flex-1 h-full flex items-center justify-center relative p-0.5">
                                  {isSpan && (
                                    <div
                                      style={{
                                        backgroundColor: isDue ? "#4f46e5" : "#ede9fe"
                                      }}
                                      className={`w-full h-5 flex items-center justify-center text-[8px] font-bold font-mono-data ${
                                        isDue 
                                          ? "text-white rounded-[4px]" 
                                          : "text-[#4338ca] rounded-none opacity-90 border-y border-[#c7d2fe]/30"
                                      }`}
                                    >
                                      {isDue ? "DUE" : ""}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-5 animate-fade-in">
              {filteredTasks.map((task) => (
                <TaskCard key={task.id} task={task} fetchTasks={fetchTasks} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
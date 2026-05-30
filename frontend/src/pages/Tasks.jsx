import { useEffect, useState, useContext } from "react";
import API from "../api/axios";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import TaskCard from "../components/TaskCard";

import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";

export default function Tasks() {
  const { user } = useContext(AuthContext);

  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "",
    dueDate: "",
    assignedToId: "",
  });

  useEffect(() => {
    fetchTasks();
    if (user?.role === "ADMIN" || user?.role === "MANAGER") {
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

    try {
      await API.post("/tasks", formData);

      toast.success("Task Created");

      fetchTasks();

      setFormData({
        title: "",
        description: "",
        priority: "",
        dueDate: "",
        assignedToId: "",
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to create task"
      );
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus =
      !statusFilter ||
      task.status === statusFilter;

    const matchesPriority =
      !priorityFilter ||
      task.priority === priorityFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority
    );
  });

  return (
    <div className="min-h-screen flex bg-[#f9fafb] text-[#1a1a1a]">

      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="flex-1 flex flex-col">

        <Navbar
          setSidebarOpen={setSidebarOpen}
        />

        <div className="p-6">

          {/* PAGE HEADER */}

          <div className="mb-6">

            <p className="text-[10px] uppercase tracking-[1.2px] text-[#555] mb-2">
              Workspace
            </p>

            <h1 className="text-2xl font-semibold">
              Task Management
            </h1>

            <p className="text-[#666] text-sm mt-1">
              Create, assign and manage team tasks.
            </p>

          </div>

          {/* CREATE TASK */}

          {(user?.role === "ADMIN" ||
            user?.role === "MANAGER") && (

            <div className="bg-white border border-[#e5e7eb] rounded-[10px] p-5 mb-6">

              <p className="text-[10px] uppercase tracking-[1.2px] text-[#555] mb-4">
                Create Task
              </p>

              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >

                <div className="grid md:grid-cols-2 gap-4">

                  <input
                    type="text"
                    name="title"
                    placeholder="Task Title"
                    value={formData.title}
                    onChange={handleChange}
                    className="bg-white border border-[#e5e7eb] rounded-md px-3 py-2 text-sm outline-none"
                    required
                  />

                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="bg-white border border-[#e5e7eb] rounded-md px-3 py-2 text-sm"
                    required
                  >
                    <option value="">
                      Select Priority
                    </option>

                    <option value="LOW">
                      LOW
                    </option>

                    <option value="MEDIUM">
                      MEDIUM
                    </option>

                    <option value="HIGH">
                      HIGH
                    </option>
                  </select>

                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="bg-white border border-[#e5e7eb] rounded-md px-3 py-2 text-sm"
                    required
                  />

                  <select
                    name="assignedToId"
                    value={formData.assignedToId}
                    onChange={handleChange}
                    className="bg-white border border-[#e5e7eb] rounded-md px-3 py-2 text-sm"
                    required
                  >
                    <option value="">
                      Select User to Assign
                    </option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>

                </div>

                <textarea
                  rows="4"
                  name="description"
                  placeholder="Task Description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full bg-white border border-[#e5e7eb] rounded-md px-3 py-2 text-sm"
                  required
                />

                <button
                  type="submit"
                  className="bg-[#5a4bcc] hover:bg-[#6b5ce7] px-5 py-2 rounded-md text-sm font-medium transition"
                >
                  Create Task
                </button>

              </form>

            </div>

          )}

          {/* FILTERS */}

          <div className="bg-white border border-[#e5e7eb] rounded-[10px] p-5 mb-6">

            <p className="text-[10px] uppercase tracking-[1.2px] text-[#555] mb-4">
              Filters
            </p>

            <div className="grid md:grid-cols-3 gap-4">

              <input
                type="text"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="bg-white border border-[#e5e7eb] rounded-md px-3 py-2 text-sm"
              />

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                className="bg-white border border-[#e5e7eb] rounded-md px-3 py-2 text-sm"
              >
                <option value="">
                  All Status
                </option>

                <option value="TODO">
                  TODO
                </option>

                <option value="IN_PROGRESS">
                  IN PROGRESS
                </option>

                <option value="DONE">
                  DONE
                </option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) =>
                  setPriorityFilter(e.target.value)
                }
                className="bg-white border border-[#e5e7eb] rounded-md px-3 py-2 text-sm"
              >
                <option value="">
                  All Priority
                </option>

                <option value="LOW">
                  LOW
                </option>

                <option value="MEDIUM">
                  MEDIUM
                </option>

                <option value="HIGH">
                  HIGH
                </option>
              </select>

            </div>

          </div>

          {/* TASKS */}

          {filteredTasks.length === 0 ? (

            <div className="bg-white border border-[#e5e7eb] rounded-[10px] p-10 text-center">

              <div className="text-5xl mb-3">
                📋
              </div>

              <h3 className="text-lg font-medium mb-2">
                No Tasks Found
              </h3>

              <p className="text-[#666] text-sm">
                Try changing filters or create a
                new task.
              </p>

            </div>

          ) : (

            <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-5">

              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  fetchTasks={fetchTasks}
                />
              ))}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}
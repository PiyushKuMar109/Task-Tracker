import { useEffect, useState } from "react";

import API from "../api/axios";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import TaskAnalytics from "../components/TaskAnalytics";
import ProgressChart from "../components/ProgressChart";

export default function Dashboard() {

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {

      const res = await API.get("/tasks");

      setTasks(res.data);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }
  };

  const completedTasks =
    tasks.filter(
      (task) =>
        task.status === "DONE"
    ).length;

  const pendingTasks =
    tasks.filter(
      (task) =>
        task.status !== "DONE"
    ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center">

        <div className="text-[#1a1a1a] text-sm">
          Loading Dashboard...
        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fafb] flex">

      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="flex-1 flex flex-col">

        <Navbar
          setSidebarOpen={setSidebarOpen}
        />

        <div className="p-6">

          {/* Header */}

          <div className="mb-8">

            <p className="text-[10px] uppercase tracking-[1.5px] text-[#555] font-semibold">

              Productivity Workspace

            </p>

            <h1 className="text-[28px] font-semibold text-[#1a1a1a] mt-2">

              Dashboard Overview

            </h1>

            <p className="text-[#666] text-sm mt-1">

              Track tasks, progress and team performance.

            </p>

          </div>

          {/* Stats */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            <div className="bg-white border border-[#e5e7eb] rounded-[10px] p-5">

              <p className="text-[10px] uppercase tracking-wider text-[#555]">

                Total Tasks

              </p>

              <h2 className="text-4xl font-semibold text-[#1a1a1a] mt-3">

                {tasks.length}

              </h2>

            </div>

            <div className="bg-white border border-[#e5e7eb] rounded-[10px] p-5">

              <p className="text-[10px] uppercase tracking-wider text-[#555]">

                Completed

              </p>

              <h2 className="text-4xl font-semibold text-green-400 mt-3">

                {completedTasks}

              </h2>

            </div>

            <div className="bg-white border border-[#e5e7eb] rounded-[10px] p-5">

              <p className="text-[10px] uppercase tracking-wider text-[#555]">

                Pending

              </p>

              <h2 className="text-4xl font-semibold text-yellow-400 mt-3">

                {pendingTasks}

              </h2>

            </div>

          </div>

          {/* Charts */}

          <div className="grid lg:grid-cols-2 gap-6 mt-6">

            <div className="bg-white border border-[#e5e7eb] rounded-[10px] p-5">

              <TaskAnalytics
                tasks={tasks}
              />

            </div>

            <div className="bg-white border border-[#e5e7eb] rounded-[10px] p-5">

              <ProgressChart
                tasks={tasks}
              />

            </div>

          </div>

          {/* Recent Tasks */}

          <div className="bg-white border border-[#e5e7eb] rounded-[10px] p-5 mt-6">

            <div className="flex justify-between items-center mb-5">

              <div>

                <p className="text-[10px] uppercase tracking-wider text-[#555]">

                  Activity

                </p>

                <h2 className="text-lg font-semibold text-[#1a1a1a]">

                  Recent Tasks

                </h2>

              </div>

            </div>

            {tasks.length === 0 ? (

              <div className="text-center py-10">

                <p className="text-[#666]">

                  No tasks found

                </p>

              </div>

            ) : (

              <div className="space-y-3">

                {tasks
                  .slice(0, 5)
                  .map((task) => (

                    <div
                      key={task.id}
                      className="flex justify-between items-center p-4 rounded-lg border border-[#e5e7eb] bg-white"
                    >

                      <div>

                        <h3 className="text-[#1a1a1a] text-sm font-medium">

                          {task.title}

                        </h3>

                        <p className="text-[#555] text-xs mt-1">

                          {task.priority}

                        </p>

                      </div>

                      <span
                        className={`text-[10px] font-mono px-3 py-1 rounded border
                        
                        ${
                          task.status === "DONE"
                            ? "bg-[#e8f5e9] text-[#2e7d32] border-[#a5d6a7]"
                            : task.status === "IN_PROGRESS"
                            ? "bg-[#fff8e1] text-[#b8860b] border-[#e6d5a0]"
                            : "bg-[#f0f0f5] text-[#555] border-[#d0d0d5]"
                        }`}
                      >

                        {task.status}

                      </span>

                    </div>

                  ))}

              </div>

            )}

          </div>

        </div>

      </div>

    </div>
  );
}
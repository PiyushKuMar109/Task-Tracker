import { useState, useEffect, useContext } from "react";
import API from "../api/axios";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ClipboardList, LogOut } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

export default function CalendarPage() {
  const { user } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchTasksAndLeaves();
  }, []);

  const fetchTasksAndLeaves = async () => {
    try {
      const [tasksRes, leavesRes] = await Promise.all([
        API.get("/tasks"),
        API.get("/leaves"),
      ]);
      setTasks(tasksRes.data);
      setLeaves(leavesRes.data.filter((l) => l.status === "APPROVED"));
    } catch (err) {
      console.log("Failed to fetch calendar data:", err);
    }
  };

  // Calendar math
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonthDays = new Date(year, month, 0).getDate();

  const daysArray = [];

  // Previous month padding days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    daysArray.push({
      day: prevMonthDays - i,
      month: month === 0 ? 11 : month - 1,
      year: month === 0 ? year - 1 : year,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push({
      day: i,
      month: month,
      year: year,
      isCurrentMonth: true,
    });
  }

  // Next month padding days to fill 42 cells grid (6 rows of 7 days)
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

  return (
    <div className="min-h-screen flex bg-[#f8fafc] text-slate-900">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-y-auto">
        <Navbar setSidebarOpen={setSidebarOpen} />

        <div className="p-6">
          {/* HEADER */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[1.2px] text-slate-500 mb-2">
                Calendar Workspace
              </p>
              <h1 className="text-2xl font-bold text-slate-900">Visual Schedule</h1>
              <p className="text-slate-500 text-sm mt-1">
                Deadlines and approved leaves mapped collectively.
              </p>
            </div>

            {/* Month Navigators */}
            <div className="flex items-center gap-3 bg-white border border-slate-200 p-1.5 rounded-xl shadow-sm self-start">
              <button
                onClick={prevMonth}
                className="p-1.5 hover:bg-slate-100 rounded-md transition text-slate-600"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold text-slate-800 w-28 text-center">
                {monthNames[month]} {year}
              </span>
              <button
                onClick={nextMonth}
                className="p-1.5 hover:bg-slate-100 rounded-md transition text-slate-600"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* CALENDAR CONTAINER */}
          <div className="bg-white border border-slate-200 rounded-[16px] overflow-hidden shadow-sm">
            {/* Weekdays Labels */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center py-3">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {/* Grid days */}
            <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 border-l border-t border-slate-100">
              {daysArray.map((cell, idx) => {
                const cellDateString = new Date(cell.year, cell.month, cell.day).toDateString();
                
                // Tasks matching this day
                const dayTasks = tasks.filter((t) => {
                  return new Date(t.dueDate).toDateString() === cellDateString;
                });

                // Leaves active on this day
                const dayLeaves = leaves.filter((l) => {
                  const start = new Date(l.startDate);
                  const end = new Date(l.endDate);
                  const current = new Date(cell.year, cell.month, cell.day);
                  
                  // Set hours to 0 to compare purely calendar dates
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
                    className={`min-h-[110px] p-2 flex flex-col justify-between transition-colors ${
                      cell.isCurrentMonth
                        ? isToday
                          ? "bg-indigo-50/20"
                          : "bg-white"
                        : "bg-slate-50/60 text-slate-400"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span
                        className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center ${
                          isToday
                            ? "bg-indigo-600 text-white font-bold"
                            : cell.isCurrentMonth
                            ? "text-slate-800"
                            : "text-slate-400"
                        }`}
                      >
                        {cell.day}
                      </span>
                    </div>

                    {/* Day Content Badges */}
                    <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[80px] custom-mini-scroll mt-1">
                      {dayTasks.map((t) => (
                        <div
                          key={t.id}
                          className="flex items-center gap-1.5 text-[9px] font-semibold px-1.5 py-0.5 rounded border bg-indigo-50 text-indigo-700 border-indigo-200 truncate"
                          title={`Task: ${t.title}`}
                        >
                          <ClipboardList size={10} className="shrink-0" />
                          <span className="truncate">{t.title}</span>
                        </div>
                      ))}

                      {dayLeaves.map((l) => (
                        <div
                          key={l.id}
                          className="flex items-center gap-1.5 text-[9px] font-semibold px-1.5 py-0.5 rounded border bg-emerald-50 text-emerald-700 border-emerald-250 truncate"
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
        </div>
      </div>
    </div>
  );
}

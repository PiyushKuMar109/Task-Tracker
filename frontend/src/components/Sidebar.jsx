import { Link, useLocation } from "react-router-dom";
import { useContext } from "react";

import { AuthContext } from "../context/AuthContext";

import {
  LayoutDashboard,
  ClipboardList,
  Users,
  BriefcaseBusiness,
} from "lucide-react";

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
}) {
  const { user } = useContext(AuthContext);

  const location = useLocation();

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed lg:static top-0 left-0 z-50
        w-[220px] h-screen
        bg-white
        border-r border-[#e5e7eb]
        flex flex-col justify-between
        transition-transform duration-300

        ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }
      `}
      >
        {/* Top Branding */}
        <div>
          <div className="px-5 py-5 border-b border-[#e5e7eb]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#5a4bcc] flex items-center justify-center">
                <BriefcaseBusiness
                  size={18}
                  className="text-white"
                />
              </div>

              <div>
                <h1 className="font-mono text-[14px] font-semibold tracking-wider text-[#1a1a1a]">
                  TASK TRACKER
                </h1>

                <p className="text-[10px] text-[#555] uppercase tracking-widest">
                  Productivity
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-3 flex flex-col gap-1 mt-2">
            <Link
              to="/dashboard"
              className={`flex items-center gap-3 px-3 py-3 text-[13px] rounded-lg border-l-[3px] transition-all duration-200 ${
                location.pathname === "/dashboard"
                  ? "border-[#5a4bcc] bg-[rgba(90,75,204,0.08)] text-[#1a1a1a]"
                  : "border-transparent text-[#666] hover:text-[#1a1a1a] hover:bg-[#f3f4f6]"
              }`}
            >
              <LayoutDashboard size={18} />
              Dashboard
            </Link>

            <Link
              to="/tasks"
              className={`flex items-center gap-3 px-3 py-3 text-[13px] rounded-lg border-l-[3px] transition-all duration-200 ${
                location.pathname === "/tasks"
                  ? "border-[#5a4bcc] bg-[rgba(90,75,204,0.08)] text-[#1a1a1a]"
                  : "border-transparent text-[#666] hover:text-[#1a1a1a] hover:bg-[#f3f4f6]"
              }`}
            >
              <ClipboardList size={18} />
              Tasks
            </Link>

            {(user?.role === "ADMIN" || user?.role === "MANAGER") && (
              <Link
                to="/users"
                className={`flex items-center gap-3 px-3 py-3 text-[13px] rounded-lg border-l-[3px] transition-all duration-200 ${
                  location.pathname === "/users"
                    ? "border-[#5a4bcc] bg-[rgba(90,75,204,0.08)] text-[#1a1a1a]"
                    : "border-transparent text-[#666] hover:text-[#1a1a1a] hover:bg-[#f3f4f6]"
                }`}
              >
                <Users size={18} />
                {user?.role === "MANAGER" ? "My Team" : "Users"}
              </Link>
            )}
          </nav>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-[#e5e7eb]">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-[#a082ff] to-[#6b4eff] flex items-center justify-center text-white text-[12px] font-semibold">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>

            <div>
              <p className="text-[13px] text-[#1a1a1a] font-medium">
                {user?.name}
              </p>

              <p className="font-mono text-[10px] text-[#666] uppercase">
                {user?.role}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
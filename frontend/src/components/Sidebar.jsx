import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";

import { AuthContext } from "../context/AuthContext";

import {
  LayoutDashboard,
  ClipboardList,
  Users,
  BriefcaseBusiness,
  Calendar,
  LogOut,
  Settings,
} from "lucide-react";

import Pomodoro from "./Pomodoro";
import WorkspaceChat from "./WorkspaceChat";

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
}) {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getNavLinkClass = (path) => {
    const isActive = location.pathname === path;
    return `flex items-center gap-3 px-[10px] py-[8px] text-[12px] rounded-lg font-medium transition-colors ${
      isActive
        ? "bg-[#ede9fe] text-[#4f46e5]"
        : "text-[#6b7280] hover:bg-[#ede9fe]/50 hover:text-[#4f46e5]"
    }`;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed lg:static top-0 left-0 z-50
        w-[200px] min-w-[200px] h-screen
        bg-[#f8f8fb]
        border-r-hairline
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
          <div className="px-4 py-[13px] border-b-hairline bg-[#f8f8fb]">
            <div className="flex items-center gap-2">
              <div className="w-[28px] h-[28px] rounded-lg bg-[#4f46e5] flex items-center justify-center text-white shrink-0">
                <BriefcaseBusiness size={14} />
              </div>

              <div className="overflow-hidden">
                <h1 className="text-[12px] font-semibold text-[#1e1b4b] leading-tight truncate">
                  Task Tracker
                </h1>

                <p className="font-mono-data text-[9px] uppercase text-[#4338ca] leading-none mt-0.5">
                  Workspace
                </p>

              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-3 flex flex-col gap-1">
            <span className="section-label px-2.5 mb-1.5 block mt-2">
              Workspace
            </span>

            <Link to="/dashboard" className={getNavLinkClass("/dashboard")}>
              <LayoutDashboard size={15} />
              Dashboard
            </Link>

            <Link to="/tasks" className={getNavLinkClass("/tasks")}>
              <ClipboardList size={15} />
              Tasks
            </Link>

            <Link to="/leaves" className={getNavLinkClass("/leaves")}>
              <Calendar size={15} />
              Leaves
            </Link>

            {(user?.role === "ADMIN" || user?.role === "SUPER_ADMIN" || user?.role === "MANAGER" || user?.role === "HR") && (
              <>
                <span className="section-label px-2.5 mb-1.5 block mt-4">
                  Management
                </span>
                
                <Link to="/users" className={getNavLinkClass("/users")}>
                  <Users size={15} />
                  {user?.role === "MANAGER" ? "My Team" : "Users"}
                </Link>

                <Link to="/settings" className={getNavLinkClass("/settings")}>
                  <Settings size={15} />
                  Settings
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* User Block */}
        <div className="p-3 border-t-hairline bg-[#f8f8fb] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-hidden">
            {/* Avatar Circle */}
            <div className="w-[28px] h-[28px] rounded-full bg-[#4f46e5] flex items-center justify-center text-white text-[11px] font-semibold shrink-0">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>

            <div className="overflow-hidden">
              <p className="text-[11px] text-[#1e1b4b] font-medium truncate leading-tight">
                {user?.name}
              </p>

              <p className="font-mono-data text-[8px] text-[#4338ca] uppercase truncate mt-0.5">
                {user?.role}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="text-[#6b7280] hover:text-red-500 transition shrink-0"
            title="Sign Out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </aside>

      <Pomodoro />
      <WorkspaceChat />
    </>
  );
}
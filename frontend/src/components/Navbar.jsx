import { useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/axios";
import { Menu, Sun, Moon, Bell, CheckCheck } from "lucide-react";
import { toast } from "react-toastify";

export default function Navbar({ setSidebarOpen }) {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [isDark, setIsDark] = useState(false);

  // Notification States
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const notifDropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await API.get("/notifications");
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n) => !n.isRead).length);
    } catch (err) {
      console.log("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }

    // Click outside handler for dropdown
    const handleClickOutside = (event) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((c) => Math.max(c - 1, 0));
    } catch (err) {
      console.log("Failed to mark notification as read", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await API.put("/notifications/read-all");
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (err) {
      toast.error("Failed to mark all as read");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="h-[54px] min-h-[54px] bg-white border-b-hairline flex items-center justify-between px-6 transition-colors relative">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen?.(true)}
          className="lg:hidden p-2 hover:bg-slate-100 text-slate-600 rounded-md transition"
        >
          <Menu size={18} />
        </button>

        <div>
          <h1 className="text-[13px] font-semibold text-[#1e1b4b]">
            Workspace Console
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <div className="relative" ref={notifDropdownRef}>
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="p-1.5 text-slate-500 hover:text-slate-850 hover:bg-slate-100 rounded-md transition relative"
            title="Notifications"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#ef4444] text-white text-[8px] font-mono-data font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown Menu */}
          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white border-hairline rounded-xl shadow-lg z-50 animate-slide-down">
              <div className="flex justify-between items-center p-3 border-b-hairline bg-[#f8f8fb] rounded-t-xl">
                <span className="font-mono-data text-[9px] uppercase font-bold text-[#9ca3af]">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[#4f46e5] hover:text-[#4338ca] text-[9px] font-bold flex items-center gap-1 transition"
                  >
                    <CheckCheck size={10} />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-56 overflow-y-auto divide-y divide-[#e8e8f0]/40">
                {notifications.length === 0 ? (
                  <p className="text-center text-[10px] text-[#9ca3af] py-6 uppercase font-mono-data">No alerts.</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => !n.isRead && handleMarkRead(n.id)}
                      className={`p-3 text-[11px] cursor-pointer transition ${
                        n.isRead ? "bg-white text-[#6b7280]" : "bg-[#ede9fe]/10 text-[#1e1b4b] font-semibold"
                      }`}
                    >
                      <div>{n.message}</div>
                      <div className="text-[8px] text-[#9ca3af] font-mono-data mt-1 uppercase">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme toggle switcher */}
        <button
          onClick={toggleTheme}
          className="p-1.5 text-slate-500 hover:text-slate-850 hover:bg-slate-100 rounded-md transition"
          title={isDark ? "Light Mode" : "Dark Mode"}
        >
          {isDark ? <Sun size={16} className="text-amber-500" /> : <Moon size={16} />}
        </button>

        <button
          onClick={handleLogout}
          className="secondary-btn danger-btn text-[11px] px-3 py-1 font-medium transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
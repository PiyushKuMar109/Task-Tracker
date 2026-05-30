import { useContext } from "react";

import { useNavigate } from "react-router-dom";

import { AuthContext } from "../context/AuthContext";

import { Menu } from "lucide-react";

export default function Navbar({ setSidebarOpen }) {

  const navigate = useNavigate();

  const { logout } =
    useContext(AuthContext);

  const handleLogout = () => {

    logout();

    navigate("/");

  };

  return (
    <div className="h-[60px] bg-white border-b border-[#e5e7eb] flex items-center justify-between px-6">

      <div className="flex items-center gap-4">

        <button
          onClick={() => setSidebarOpen?.(true)}
          className="lg:hidden p-2 hover:bg-[#f3f4f6] rounded-md"
        >
          <Menu size={20} />
        </button>

        <div>

          <p className="section-label">
            Productivity Workspace
          </p>

          <h1 className="text-[16px] font-semibold mt-1">
            Task Tracker
          </h1>

        </div>

      </div>

      <button
        onClick={handleLogout}
        className="secondary-btn danger-btn"
      >
        Logout
      </button>

    </div>
  );
}
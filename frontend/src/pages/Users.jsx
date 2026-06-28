import { useEffect, useState, useContext } from "react";
import API from "../api/axios";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import { Users as UsersIcon, Shield, Briefcase, UserCheck } from "lucide-react";

export default function Users() {
  const { user } = useContext(AuthContext);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "MEMBER" });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // "all", "managers", "members"

  const fetchUsers = async () => {
    try {
      const res = await API.get("/users");
      setUsers(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (["ADMIN", "SUPER_ADMIN", "HR", "MANAGER"].includes(user?.role)) {
      fetchUsers();
    }
  }, []);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAdding(true);
    setError("");
    try {
      await API.post("/users", form);
      setForm({ name: "", email: "", password: "", role: "MEMBER" });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add user");
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await API.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user");
    }
  };

  const filteredUsers = users.filter((u) => {
    if (["ADMIN", "SUPER_ADMIN", "HR"].includes(user?.role)) {
      if (activeTab === "managers") return u.role === "MANAGER";
      if (activeTab === "members") return !["ADMIN", "MANAGER", "SUPER_ADMIN", "HR"].includes(u.role);
      return true; // all
    }
    return true; // for managers, show their team members
  });

  if (!["ADMIN", "SUPER_ADMIN", "HR", "MANAGER"].includes(user?.role)) {
    return <Navigate to="/dashboard" />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-slate-650 text-xs font-mono-data animate-pulse">
        Loading Users Directory...
      </div>
    );
  }

  const admins = users.filter((u) => u.role === "ADMIN" || u.role === "SUPER_ADMIN").length;
  const managers = users.filter((u) => u.role === "MANAGER").length;
  const members = users.filter((u) => !["ADMIN", "MANAGER", "SUPER_ADMIN", "HR"].includes(u.role)).length;

  return (
    <div className="min-h-screen flex bg-white text-[#1e1b4b]">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-y-auto bg-white">
        <Navbar setSidebarOpen={setSidebarOpen} />

        <div className="content-padding">
          {/* HEADER */}
          <div className="mb-8">
            <span className="section-label">
              {["ADMIN", "SUPER_ADMIN", "HR"].includes(user?.role) ? "Administration Eyebrow" : "Team Eyebrow"}
            </span>

            <h1 className="text-[20px] font-semibold text-[#1e1b4b] mt-1">
              {["ADMIN", "SUPER_ADMIN", "HR"].includes(user?.role) ? "User Management" : "My Team"}
            </h1>

            <p className="text-[#6b7280] text-[12px] mt-0.5">
              {["ADMIN", "SUPER_ADMIN", "HR"].includes(user?.role) ? "Manage users and workspace roles." : "View your team members."}
            </p>
          </div>

          {/* STATS - 4 columns, left border signature stripe, DM Mono numbers */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-[14px] mb-8">
            <div className="bg-white border-hairline rounded-[12px] p-4 flex justify-between items-center stripe-indigo shadow-none relative overflow-hidden">
              <div>
                <span className="section-label mb-1 block">Total Users</span>
                <h2 className="font-mono-data text-[32px] font-bold text-[#4f46e5] leading-none">{users.length}</h2>
              </div>
              <div className="w-[32px] h-[32px] rounded-lg bg-[#ede9fe] flex items-center justify-center text-[#4f46e5]">
                <UsersIcon size={15} />
              </div>
            </div>

            <div className="bg-white border-hairline rounded-[12px] p-4 flex justify-between items-center stripe-amber shadow-none relative overflow-hidden">
              <div>
                <span className="section-label mb-1 block">Admins</span>
                <h2 className="font-mono-data text-[32px] font-bold text-[#f59e0b] leading-none">{admins}</h2>
              </div>
              <div className="w-[32px] h-[32px] rounded-lg bg-[#fef3c7] flex items-center justify-center text-[#f59e0b]">
                <Shield size={15} />
              </div>
            </div>

            <div className="bg-white border-hairline rounded-[12px] p-4 flex justify-between items-center stripe-indigo shadow-none relative overflow-hidden">
              <div>
                <span className="section-label mb-1 block">Managers</span>
                <h2 className="font-mono-data text-[32px] font-bold text-[#4f46e5] leading-none">{managers}</h2>
              </div>
              <div className="w-[32px] h-[32px] rounded-lg bg-[#ede9fe] flex items-center justify-center text-[#4f46e5]">
                <Briefcase size={15} />
              </div>
            </div>

            <div className="bg-white border-hairline rounded-[12px] p-4 flex justify-between items-center stripe-emerald shadow-none relative overflow-hidden">
              <div>
                <span className="section-label mb-1 block">Members</span>
                <h2 className="font-mono-data text-[32px] font-bold text-[#10b981] leading-none">{members}</h2>
              </div>
              <div className="w-[32px] h-[32px] rounded-lg bg-[#d1fae5] flex items-center justify-center text-[#10b981]">
                <UserCheck size={15} />
              </div>
            </div>
          </div>

          {/* TABS FOR ADMIN */}
          {["ADMIN", "SUPER_ADMIN", "HR"].includes(user?.role) && (
            <div className="mb-6">
              <div className="tab-toggle-container">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`tab-toggle-item ${activeTab === "all" ? "active" : ""}`}
                >
                  All Users
                </button>
                <button
                  onClick={() => setActiveTab("managers")}
                  className={`tab-toggle-item ${activeTab === "managers" ? "active" : ""}`}
                >
                  Managers
                </button>
                <button
                  onClick={() => setActiveTab("members")}
                  className={`tab-toggle-item ${activeTab === "members" ? "active" : ""}`}
                >
                  Members & Staff
                </button>
              </div>
            </div>
          )}

          {/* ADD USER FORM */}
          {["ADMIN", "SUPER_ADMIN", "HR", "MANAGER"].includes(user?.role) && (
            <div className="bg-white border-hairline rounded-[12px] p-5 mb-6">
              <span className="section-label mb-4 block">Add New User</span>
              
              <form onSubmit={handleAddUser} className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px] flex flex-col gap-1.5">
                  <label className="text-[11px] text-[#6b7280] font-semibold">Name</label>
                  <input 
                    name="name" 
                    placeholder="Full name"
                    value={form.name} 
                    onChange={handleInputChange} 
                    required 
                    className="w-full bg-[#f9fafb] border-hairline rounded-[7px] px-3 py-2 text-xs" 
                  />
                </div>

                <div className="flex-1 min-w-[200px] flex flex-col gap-1.5">
                  <label className="text-[11px] text-[#6b7280] font-semibold">Email</label>
                  <input 
                    name="email" 
                    placeholder="email@company.com"
                    value={form.email} 
                    onChange={handleInputChange} 
                    type="email" 
                    required 
                    className="w-full bg-[#f9fafb] border-hairline rounded-[7px] px-3 py-2 text-xs" 
                  />
                </div>

                <div className="flex-1 min-w-[150px] flex flex-col gap-1.5">
                  <label className="text-[11px] text-[#6b7280] font-semibold">Password</label>
                  <input 
                    name="password" 
                    placeholder="••••••••"
                    value={form.password} 
                    onChange={handleInputChange} 
                    type="password" 
                    required 
                    className="w-full bg-[#f9fafb] border-hairline rounded-[7px] px-3 py-2 text-xs" 
                  />
                </div>

                <div className="w-[150px] flex flex-col gap-1.5">
                  <label className="text-[11px] text-[#6b7280] font-semibold">Role</label>
                  <select 
                    name="role" 
                    value={form.role} 
                    onChange={handleInputChange} 
                    className="w-full bg-[#f9fafb] border-hairline rounded-[7px] px-3 py-2 text-xs"
                  >
                    {["ADMIN", "SUPER_ADMIN", "HR"].includes(user?.role) ? (
                      <>
                        <option value="MEMBER">MEMBER</option>
                        <option value="DEVELOPER">DEVELOPER</option>
                        <option value="QA">QA</option>
                        <option value="DESIGNER">DESIGNER</option>
                        <option value="HR">HR</option>
                        <option value="MANAGER">MANAGER</option>
                        <option value="ADMIN">ADMIN</option>
                      </>
                    ) : (
                      <>
                        <option value="MEMBER">MEMBER</option>
                        <option value="DEVELOPER">DEVELOPER</option>
                        <option value="QA">QA</option>
                        <option value="DESIGNER">DESIGNER</option>
                      </>
                    )}
                  </select>
                </div>

                <button 
                  type="submit" 
                  disabled={adding} 
                  className="primary-btn px-6 py-2 transition"
                >
                  {adding ? "Adding..." : "Add User"}
                </button>

                {error && <span className="text-red-500 text-xs w-full mt-2 font-mono-data">{error}</span>}
              </form>
            </div>
          )}

          {/* USERS TABLE */}
          <div className="bg-white border-hairline rounded-[12px] overflow-hidden">
            {users.length === 0 ? (
              <div className="p-12 text-center text-[#9ca3af] text-xs font-mono-data">
                No users registered.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-hairline bg-[#f8f8fb] text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider font-mono-data">
                      <th className="text-left px-5 py-3 font-medium">User</th>
                      <th className="text-left px-5 py-3 font-medium">Email</th>
                      <th className="text-left px-5 py-3 font-medium">Role</th>
                      <th className="text-left px-5 py-3 font-medium">ID</th>
                      {["ADMIN", "SUPER_ADMIN", "HR"].includes(user?.role) && (
                        <th className="text-left px-5 py-3 font-medium">Manager</th>
                      )}
                      {user?.role === "MANAGER" && (
                        <th className="text-left px-5 py-3 font-medium">Manager ID</th>
                      )}
                      <th className="text-right px-5 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#e8e8f0] text-[12px]">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-[#fafafa] transition-colors">
                        {/* User */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-[26px] h-[26px] rounded-full bg-[#4f46e5] flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                              {u.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div className="font-semibold text-[#1e1b4b] truncate">{u.name}</div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-5 py-3.5 text-[#6b7280]">{u.email}</td>

                        {/* Role Badge */}
                        <td className="px-5 py-3.5">
                          <span
                            className={`badge ${
                              u.role === "ADMIN" || u.role === "SUPER_ADMIN"
                                ? "badge-high"
                                : u.role === "MANAGER"
                                ? "badge-progress"
                                : "badge-done"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>

                        {/* ID */}
                        <td className="px-5 py-3.5 text-[#9ca3af] font-mono-data">#{u.id}</td>

                        {/* Manager */}
                        {["ADMIN", "SUPER_ADMIN", "HR"].includes(user?.role) && (
                          <td className="px-5 py-3.5 text-[#6b7280]">{u.manager?.name || "N/A"}</td>
                        )}
                        {user?.role === "MANAGER" && (
                          <td className="px-5 py-3.5 text-[#9ca3af] font-mono-data">#{u.managerId || "N/A"}</td>
                        )}

                        {/* Actions */}
                        <td className="px-5 py-3.5 text-right">
                          {["ADMIN", "SUPER_ADMIN", "HR"].includes(user?.role) && user.id !== u.id && (
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="secondary-btn danger-btn text-[10px] py-1 px-3 transition"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
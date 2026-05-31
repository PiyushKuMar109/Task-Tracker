
import React, { useEffect, useState, useContext } from "react";


import API from "../api/axios";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function Users() {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "MEMBER" });
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
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
    if (user?.role === "ADMIN" || user?.role === "MANAGER") {
      fetchUsers();
    }
    // eslint-disable-next-line
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
    if (user?.role === "ADMIN") {
      if (activeTab === "managers") return u.role === "MANAGER";
      if (activeTab === "members") return u.role === "MEMBER";
      return true; // all
    }
    return true; // for managers, show their team members
  });

  if (user?.role !== "ADMIN" && user?.role !== "MANAGER") {
    return <Navigate to="/dashboard" />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center text-[#1a1a1a]">
        Loading Users...
      </div>
    );
  }

  const admins = users.filter((u) => u.role === "ADMIN").length;
  const managers = users.filter((u) => u.role === "MANAGER").length;
  const members = users.filter((u) => u.role === "MEMBER").length;

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

          {/* HEADER */}

          <div className="mb-6">

            <p className="text-[10px] uppercase tracking-[1.2px] text-[#555] mb-2">
              {user?.role === "ADMIN" ? "Administration" : "Team"}
            </p>

            <h1 className="text-2xl font-semibold">
              {user?.role === "ADMIN" ? "User Management" : "My Team"}
            </h1>

            <p className="text-[#666] text-sm mt-1">
              {user?.role === "ADMIN" ? "Manage users and workspace roles." : "View your team members."}
            </p>

          </div>

          {/* STATS */}

          <div className="grid md:grid-cols-4 gap-4 mb-6">

            <div className="bg-white border border-[#e5e7eb] rounded-[10px] p-4">
              <p className="text-[#666] text-xs">
                TOTAL USERS
              </p>

              <h2 className="text-2xl font-semibold mt-2">
                {users.length}
              </h2>
            </div>

            <div className="bg-white border border-[#e5e7eb] rounded-[10px] p-4">
              <p className="text-[#666] text-xs">
                ADMINS
              </p>

              <h2 className="text-2xl font-semibold mt-2 text-red-400">
                {admins}
              </h2>
            </div>

            <div className="bg-white border border-[#e5e7eb] rounded-[10px] p-4">
              <p className="text-[#666] text-xs">
                MANAGERS
              </p>

              <h2 className="text-2xl font-semibold mt-2 text-yellow-400">
                {managers}
              </h2>
            </div>

            <div className="bg-white border border-[#e5e7eb] rounded-[10px] p-4">
              <p className="text-[#666] text-xs">
                MEMBERS
              </p>

              <h2 className="text-2xl font-semibold mt-2 text-green-400">
                {members}
              </h2>
            </div>

          </div>

          {/* TABS FOR ADMIN TO SEPARATE MANAGERS AND MEMBERS */}
          {user?.role === "ADMIN" && (
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  activeTab === "all"
                    ? "bg-[#5a4bcc] text-white"
                    : "bg-white border border-[#e5e7eb] text-[#666] hover:bg-[#f3f4f6]"
                }`}
              >
                All Users
              </button>
              <button
                onClick={() => setActiveTab("managers")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  activeTab === "managers"
                    ? "bg-[#5a4bcc] text-white"
                    : "bg-white border border-[#e5e7eb] text-[#666] hover:bg-[#f3f4f6]"
                }`}
              >
                Managers
              </button>
              <button
                onClick={() => setActiveTab("members")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  activeTab === "members"
                    ? "bg-[#5a4bcc] text-white"
                    : "bg-white border border-[#e5e7eb] text-[#666] hover:bg-[#f3f4f6]"
                }`}
              >
                Members
              </button>
            </div>
          )}

          {/* ADD USER FORM (ADMIN AND MANAGER) */}
          {(user?.role === "ADMIN" || user?.role === "MANAGER") && (
          <div className="bg-white border border-[#e5e7eb] rounded-[10px] p-5 mb-6">
            <p className="text-[10px] uppercase tracking-[1.2px] text-[#555] mb-4">
              Add New User
            </p>
            <form onSubmit={handleAddUser} className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs text-[#666] mb-1">Name</label>
                <input 
                  name="name" 
                  value={form.name} 
                  onChange={handleInputChange} 
                  required 
                  className="w-full bg-white border border-[#e5e7eb] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#5a4bcc]" 
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs text-[#666] mb-1">Email</label>
                <input 
                  name="email" 
                  value={form.email} 
                  onChange={handleInputChange} 
                  type="email" 
                  required 
                  className="w-full bg-white border border-[#e5e7eb] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#5a4bcc]" 
                />
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="block text-xs text-[#666] mb-1">Password</label>
                <input 
                  name="password" 
                  value={form.password} 
                  onChange={handleInputChange} 
                  type="password" 
                  required 
                  className="w-full bg-white border border-[#e5e7eb] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#5a4bcc]" 
                />
              </div>
              <div className="w-[150px]">
                <label className="block text-xs text-[#666] mb-1">Role</label>
                <select 
                  name="role" 
                  value={form.role} 
                  onChange={handleInputChange} 
                  className="w-full bg-white border border-[#e5e7eb] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#5a4bcc]"
                >
                  {user?.role === "ADMIN" ? (
                    <>
                      <option value="ADMIN">ADMIN</option>
                      <option value="MANAGER">MANAGER</option>
                      <option value="MEMBER">MEMBER</option>
                    </>
                  ) : (
                    <option value="MEMBER">MEMBER</option>
                  )}
                </select>
              </div>
              <button 
                type="submit" 
                disabled={adding} 
                className="bg-[#5a4bcc] hover:bg-[#6b5ce7] text-white px-6 py-2 rounded-md text-sm font-medium transition disabled:opacity-60"
              >
                {adding ? "Adding..." : "Add User"}
              </button>
              {error && <span className="text-red-500 text-xs">{error}</span>}
            </form>
          </div>
          )}

          {/* USERS TABLE */}

          <div className="bg-white border border-[#e5e7eb] rounded-[10px] overflow-hidden">

            {users.length === 0 ? (

              <div className="p-12 text-center">

                <div className="text-5xl mb-4">
                  👥
                </div>

                <h2 className="text-lg font-medium">
                  No Users Found
                </h2>

                <p className="text-[#666] text-sm mt-2">
                  Registered users will appear here.
                </p>

              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead className="border-b border-[#e5e7eb]">

                    <tr>

                      <th className="text-left px-5 py-4 text-xs text-[#666]">
                        USER
                      </th>

                      <th className="text-left px-5 py-4 text-xs text-[#666]">
                        EMAIL
                      </th>

                      <th className="text-left px-5 py-4 text-xs text-[#666]">
                        ROLE
                      </th>

                      <th className="text-left px-5 py-4 text-xs text-[#666]">
                        ID
                      </th>


                      {user?.role === "ADMIN" && (
                        <th className="text-left px-5 py-4 text-xs text-[#666]">
                          MANAGER
                        </th>
                      )}

                      {user?.role === "MANAGER" && (
                        <th className="text-left px-5 py-4 text-xs text-[#666]">
                          MANAGER ID
                        </th>
                      )}

                      <th className="text-left px-5 py-4 text-xs text-[#666]">
                        ACTIONS
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredUsers.map((u) => (
                      <tr
                        key={u.id}
                        className="border-b border-[#e5e7eb] hover:bg-[#f3f4f6]"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full bg-gradient-to-br from-[#a082ff] to-[#6b4eff] flex items-center justify-center text-white text-xs font-semibold"
                            >
                              {u.name?.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm">{u.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-[#666]">{u.email}</td>
                        <td className="px-5 py-4">
                          <span
                            className={`px-2 py-1 rounded text-[10px] font-semibold border ${
                              u.role === "ADMIN"
                                ? "bg-[#ffebee] text-red-600 border-[#ef9a9a]"
                                : u.role === "MANAGER"
                                ? "bg-[#fff8e1] text-yellow-600 border-[#e6d5a0]"
                                : "bg-[#e8f5e9] text-green-600 border-[#a5d6a7]"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-[#666] text-sm">#{u.id}</td>
                        {user?.role === "ADMIN" && (
                          <td className="px-5 py-4 text-[#666] text-sm">{u.manager?.name || "N/A"}</td>
                        )}
                        {user?.role === "MANAGER" && (
                          <td className="px-5 py-4 text-[#666] text-sm">#{u.managerId || "N/A"}</td>
                        )}
                        <td className="px-5 py-4">
                          {user?.role === "ADMIN" && user.id !== u.id && (
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium transition"
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
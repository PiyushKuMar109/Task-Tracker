import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import API from "../api/axios";
import { toast } from "react-toastify";
import { BriefcaseBusiness } from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "MEMBER",
    tenantName: "", // for multi-tenant structure
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/auth/register", formData);
      toast.success("Registration Successful! Please Sign In.");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration Failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4 relative overflow-hidden py-10">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-indigo-200/30 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-violet-200/30 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#4f46e5] to-[#6366f1] text-white mb-4 shadow-lg shadow-indigo-500/20">
            <BriefcaseBusiness size={26} />
          </div>

          <h1 className="text-[22px] font-bold text-slate-800 tracking-wider">
            TASK TRACKER
          </h1>

          <p className="text-slate-500 text-xs font-medium tracking-wide mt-2">
            Multi-Tenant Task & Workspace Administration
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-[16px] p-8 shadow-xl shadow-slate-100">
          <div className="mb-6">
            <p className="text-[10px] uppercase tracking-[1.5px] text-slate-500 font-bold mb-2">
              Registration
            </p>
            <h2 className="text-slate-800 text-xl font-bold">
              Create Workspace Account
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="flex flex-col gap-1">
              <label className="block text-[11px] text-slate-600 font-semibold uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-100"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="block text-[11px] text-slate-600 font-semibold uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="name@company.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-100"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="block text-[11px] text-slate-600 font-semibold uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-100"
              />
            </div>

            {/* Tenant Name */}
            <div className="flex flex-col gap-1">
              <label className="block text-[11px] text-slate-600 font-semibold uppercase tracking-wider">
                Tenant / Workspace Name
              </label>
              <input
                type="text"
                name="tenantName"
                placeholder="Google Inc"
                value={formData.tenantName}
                onChange={handleChange}
                required
                className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-100"
              />
            </div>

            {/* Role selection list */}
            <div className="flex flex-col gap-1">
              <label className="block text-[11px] text-slate-600 font-semibold uppercase tracking-wider">
                Initial Role Selection
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-100"
              >
                <option value="MEMBER">MEMBER</option>
                <option value="DEVELOPER">DEVELOPER</option>
                <option value="QA">QA</option>
                <option value="DESIGNER">DESIGNER</option>
                <option value="HR">HR</option>
                <option value="MANAGER">MANAGER</option>
                <option value="ADMIN">ADMIN</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              </select>
            </div>

            {/* Button */}
            <button
              type="submit"
              className="primary-btn w-full mt-2 py-2.5 font-bold"
            >
              Sign Up
            </button>
          </form>

          {/* Divider */}
          <div className="border-t border-slate-100 my-6" />

          {/* Redirect to login */}
          <p className="text-center text-slate-500 text-xs">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-bold transition">
              Sign In
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-400 text-[10px] mt-6 font-mono tracking-widest uppercase">
          TASK TRACKER v1.0
        </p>
      </div>
    </div>
  );
}
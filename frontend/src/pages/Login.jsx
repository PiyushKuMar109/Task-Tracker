import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";

import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { BriefcaseBusiness } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
      const res = await API.post("/auth/login", formData);
      login(res.data.token);
      toast.success("Login Successful");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login Failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative Glow elements for modern look */}
      <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-indigo-200/30 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-violet-200/30 blur-[100px] pointer-events-none" />

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
            Productivity Management System
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-[16px] p-8 shadow-xl shadow-slate-100">
          <div className="mb-6">
            <p className="text-[10px] uppercase tracking-[1.5px] text-slate-500 font-bold mb-2">
              Authentication
            </p>
            <h2 className="text-slate-800 text-xl font-bold">
              Sign In
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
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
            <div className="flex flex-col gap-1.5">
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

            {/* Submit Button */}
            <button
              type="submit"
              className="primary-btn w-full mt-2 py-2.5 font-bold"
            >
              Sign In
            </button>
          </form>

          {/* Divider */}
          <div className="border-t border-slate-100 my-6" />

          {/* Register Redirect link */}
          <p className="text-center text-slate-500 text-xs mt-4">
            New to the platform?{" "}
            <Link to="/signup" className="text-indigo-600 hover:text-indigo-700 font-bold transition">
              Create an account
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
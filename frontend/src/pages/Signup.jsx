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
    tenantId: "", // Optional - will be auto-generated if empty
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
      await API.post(
        "/auth/signup",
        formData
      );

      toast.success(
        "Registration Successful"
      );

      navigate("/login");

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Registration Failed"
      );

    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center px-4 py-10">

      <div className="w-full max-w-md">

        {/* Logo */}

        <div className="text-center mb-8">

          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#5a4bcc] text-white mb-4">

            <BriefcaseBusiness size={24} />

          </div>

          <h1 className="mono text-[20px] tracking-widest text-[#a082ff]">
            TASK TRACKER
          </h1>

          <p className="text-[#666] text-sm mt-2">
            Create your workspace account
          </p>

        </div>

        {/* Card */}

        <div className="bg-white border border-[#e5e7eb] rounded-[10px] p-6">

          <div className="mb-6">

            <p className="text-[10px] uppercase tracking-[1.2px] text-[#555] mb-2">

              Registration

            </p>

            <h2 className="text-[#1a1a1a] text-xl font-semibold">
              Create Account
            </h2>

          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            {/* Name */}

            <div>

              <label className="block text-[11px] text-[#666] mb-2 uppercase tracking-wider">
                Full Name
              </label>

              <input
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-white border border-[#e5e7eb] rounded-md px-3 py-2 text-[#1a1a1a] text-sm placeholder-[#999] focus:outline-none focus:border-[#5a4bcc]"
              />

            </div>

            {/* Email */}

            <div>

              <label className="block text-[11px] text-[#666] mb-2 uppercase tracking-wider">
                Email
              </label>

              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-white border border-[#e5e7eb] rounded-md px-3 py-2 text-[#1a1a1a] text-sm placeholder-[#999] focus:outline-none focus:border-[#5a4bcc]"
              />

            </div>

            {/* Password */}

            <div>

              <label className="block text-[11px] text-[#666] mb-2 uppercase tracking-wider">
                Password
              </label>

              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full bg-white border border-[#e5e7eb] rounded-md px-3 py-2 text-[#1a1a1a] text-sm placeholder-[#999] focus:outline-none focus:border-[#5a4bcc]"
              />

            </div>

            {/* Tenant ID (Optional) */}

            <div>

              <label className="block text-[11px] text-[#666] mb-2 uppercase tracking-wider">
                Workspace ID (Optional)
              </label>

              <input
                type="text"
                name="tenantId"
                placeholder="Auto-generated if empty"
                value={formData.tenantId}
                onChange={handleChange}
                className="w-full bg-white border border-[#e5e7eb] rounded-md px-3 py-2 text-[#1a1a1a] text-sm placeholder-[#999] focus:outline-none focus:border-[#5a4bcc]"
              />

            </div>

            {/* Role */}

            <div>

              <label className="block text-[11px] text-[#666] mb-2 uppercase tracking-wider">
                Role
              </label>

              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full bg-white border border-[#e5e7eb] rounded-md px-3 py-2 text-[#1a1a1a] text-sm focus:outline-none focus:border-[#5a4bcc]"
              >

                <option
                  value="MEMBER"
                  className="bg-white"
                >
                  MEMBER
                </option>

                <option
                  value="MANAGER"
                  className="bg-white"
                >
                  MANAGER
                </option>

              </select>

            </div>

            {/* Button */}

            <button
              type="submit"
              className="w-full bg-[#5a4bcc] hover:bg-[#6b5ce7] text-white rounded-md py-2.5 text-sm font-medium transition"
            >
              Create Account
            </button>

          </form>

          <div className="border-t border-[#e5e7eb] my-6" />

          <p className="text-center text-sm text-[#666]">

            Already have an account?{" "}

            <Link
              to="/login"
              className="text-[#5a4bcc] hover:text-[#6b5ce7] transition"
            >
              Sign In
            </Link>

          </p>

        </div>

        <p className="text-center text-[#444] text-xs mt-6 mono">
          TASK TRACKER v1.0
        </p>

      </div>

    </div>
  );
}
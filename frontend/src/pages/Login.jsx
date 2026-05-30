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
      const res = await API.post(
        "/auth/login",
        formData
      );

      login(res.data.token);

      toast.success("Login Successful");

      navigate("/dashboard");

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Login Failed"
      );

    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center px-4">

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

            Productivity Management System

          </p>

        </div>

        {/* Card */}

        <div className="bg-white border border-[#e5e7eb] rounded-[10px] p-6">

          <div className="mb-6">

            <p className="text-[10px] uppercase tracking-[1.2px] text-[#555] mb-2">

              Authentication

            </p>

            <h2 className="text-[#1a1a1a] text-xl font-semibold">

              Sign In
            </h2>

          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

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

            {/* Button */}

            <button
              type="submit"
              className="w-full bg-[#5a4bcc] hover:bg-[#6b5ce7] text-white rounded-md py-2.5 text-sm font-medium transition"
            >
              Sign In
            </button>

          </form>

          {/* Divider */}

          <div className="border-t border-[#e5e7eb] my-6" />

        </div>

        {/* Footer */}

        <p className="text-center text-[#444] text-xs mt-6 mono">

          TASK TRACKER v1.0

        </p>

      </div>

    </div>
  );
}
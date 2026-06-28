import { useEffect, useState, useContext } from "react";
import API from "../api/axios";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { LogOut } from "lucide-react";

export default function Leaves() {
  const { user } = useContext(AuthContext);

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);

  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    reason: "",
  });

  const fetchLeaves = async () => {
    try {
      const res = await API.get("/leaves");
      setLeaves(res.data);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load leaves list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await API.post("/leaves", formData);
      toast.success("Leave Request Submitted");
      setFormData({ startDate: "", endDate: "", reason: "" });
      setShowRequestForm(false);
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await API.put(`/leaves/${id}/status`, { status });
      toast.success(`Leave request ${status.toLowerCase()} successfully`);
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update leave status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-slate-650 text-xs font-mono-data animate-pulse">
        Loading Leave Workspace...
      </div>
    );
  }

  const isHrOrAdmin = ["ADMIN", "SUPER_ADMIN", "HR"].includes(user?.role);
  const isManager = user?.role === "MANAGER";
  const canApprove = isHrOrAdmin || isManager;

  return (
    <div className="min-h-screen flex bg-white text-[#1e1b4b]">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-y-auto bg-white">
        <Navbar setSidebarOpen={setSidebarOpen} />

        <div className="content-padding">
          {/* HEADER */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="section-label">Time Off Eyebrow</span>
              <h1 className="text-[20px] font-semibold text-[#1e1b4b] mt-1">Leave Management</h1>
              <p className="text-[#6b7280] text-[12px] mt-0.5">
                Submit, review and track leave applications.
              </p>
            </div>

            {user?.role !== "SUPER_ADMIN" && (
              <button
                onClick={() => setShowRequestForm(!showRequestForm)}
                className={`${showRequestForm ? "secondary-btn danger-btn" : "primary-btn"} flex items-center gap-1.5`}
              >
                {showRequestForm ? "Cancel" : "Request Leave"}
              </button>
            )}
          </div>

          {/* REQUEST FORM */}
          {user?.role !== "SUPER_ADMIN" && showRequestForm && (
            <div className="bg-white border-hairline rounded-[12px] p-5 mb-6 animate-slide-down">
              <span className="section-label mb-4 block">Ask For Leave</span>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-[#6b7280] font-semibold">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      required
                      className="bg-[#f9fafb] border-hairline rounded-[7px] px-3 py-2 text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-[#6b7280] font-semibold">End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      required
                      className="bg-[#f9fafb] border-hairline rounded-[7px] px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-[#6b7280] font-semibold">Reason / Remarks</label>
                  <textarea
                    name="reason"
                    rows="2"
                    placeholder="Provide details about your leave request..."
                    value={formData.reason}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#f9fafb] border-hairline rounded-[7px] px-3 py-2 text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="primary-btn px-6 py-2"
                >
                  {submitting ? "Submitting..." : "Submit Request"}
                </button>
              </form>
            </div>
          )}

          {/* LEAVES LIST TABLE */}
          <div className="bg-white border-hairline rounded-[12px] overflow-hidden">
            <div className="p-4 border-b-hairline bg-[#fafafa]">
              <span className="section-label">
                {canApprove ? "Received Applications" : "My Applications"}
              </span>
            </div>

            {leaves.length === 0 ? (
              <div className="p-12 text-center text-[#9ca3af] text-xs font-mono-data">
                No leave requests found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-hairline bg-[#f8f8fb] text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider font-mono-data">
                      <th className="text-left px-5 py-3 font-medium">Employee</th>
                      <th className="text-left px-5 py-3 font-medium">Start Date</th>
                      <th className="text-left px-5 py-3 font-medium">End Date</th>
                      <th className="text-left px-5 py-3 font-medium">Reason</th>
                      <th className="text-left px-5 py-3 font-medium">Status</th>
                      {canApprove && <th className="text-right px-5 py-3 font-medium">Actions</th>}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#e8e8f0] text-[12px]">
                    {leaves.map((leave) => (
                      <tr key={leave.id} className="hover:bg-[#fafafa] transition-colors">
                        {/* Employee */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-[26px] h-[26px] rounded-full bg-[#4f46e5] flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                              {leave.user?.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                              <div className="font-semibold text-[#1e1b4b] truncate">{leave.user?.name}</div>
                              <div className="text-[9px] text-[#6b7280] font-mono-data mt-0.5 uppercase tracking-wider">{leave.user?.role}</div>
                            </div>
                          </div>
                        </td>

                        {/* Start Date */}
                        <td className="px-5 py-3.5 text-[#6b7280] font-mono-data">
                          {new Date(leave.startDate).toLocaleDateString()}
                        </td>

                        {/* End Date */}
                        <td className="px-5 py-3.5 text-[#6b7280] font-mono-data">
                          {new Date(leave.endDate).toLocaleDateString()}
                        </td>

                        {/* Reason */}
                        <td className="px-5 py-3.5 text-[#6b7280] max-w-[200px] truncate" title={leave.reason}>
                          {leave.reason}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5">
                          <span
                            className={`badge ${
                              leave.status === "APPROVED"
                                ? "badge-done"
                                : leave.status === "REJECTED"
                                ? "badge-high"
                                : "badge-progress"
                            }`}
                          >
                            {leave.status}
                          </span>
                        </td>

                        {/* Actions */}
                        {canApprove && (
                          <td className="px-5 py-3.5 text-right">
                            {leave.status === "PENDING" ? (
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => handleStatusUpdate(leave.id, "APPROVED")}
                                  className="primary-btn bg-[#10b981] hover:bg-[#059669] border-[#065f46] text-[10px] py-1 px-2.5 font-medium transition"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(leave.id, "REJECTED")}
                                  className="primary-btn bg-[#ef4444] hover:bg-[#dc2626] border-[#991b1b] text-[10px] py-1 px-2.5 font-medium transition"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] font-mono-data text-[#9ca3af] uppercase">
                                Checked by: {leave.approvedBy?.name || "System"}
                              </span>
                            )}
                          </td>
                        )}
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

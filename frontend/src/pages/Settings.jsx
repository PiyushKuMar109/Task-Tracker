import { useEffect, useState, useContext } from "react";
import API from "../api/axios";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { Copy, Key, Settings as SettingsIcon, Trash2, Plus } from "lucide-react";

export default function Settings() {
  const { user } = useContext(AuthContext);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Policy Settings States
  const [settings, setSettings] = useState({
    companyName: "",
    maxLeavesPerYear: 30,
    standardHoursPerWeek: 40,
  });

  // API Key States
  const [apiKeys, setApiKeys] = useState([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [creatingKey, setCreatingKey] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await API.get("/tenant-settings");
      setSettings(res.data);
    } catch (err) {
      console.log("Failed to load settings:", err);
    }
  };

  const fetchApiKeys = async () => {
    try {
      const res = await API.get("/api-keys");
      setApiKeys(res.data);
    } catch (err) {
      console.log("Failed to load API keys:", err);
    }
  };

  const initData = async () => {
    try {
      await Promise.all([fetchSettings(), fetchApiKeys()]);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initData();
  }, []);

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await API.put("/tenant-settings", settings);
      setSettings(res.data);
      toast.success("Workspace policy settings updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update settings");
    }
  };

  const handleCreateKey = async (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    setCreatingKey(true);
    try {
      const res = await API.post("/api-keys", { name: newKeyName });
      setApiKeys([res.data, ...apiKeys]);
      setNewKeyName("");
      toast.success("API Key generated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate API Key");
    } finally {
      setCreatingKey(false);
    }
  };

  const handleDeleteKey = async (id) => {
    if (!window.confirm("Are you sure you want to revoke this API key?")) return;

    try {
      await API.delete(`/api-keys/${id}`);
      setApiKeys(apiKeys.filter((k) => k.id !== id));
      toast.success("API Key revoked");
    } catch (err) {
      toast.error("Failed to revoke API Key");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-slate-655 text-xs font-mono-data animate-pulse">
        Loading System Settings...
      </div>
    );
  }

  const isPolicyAdmin = ["ADMIN", "SUPER_ADMIN", "HR"].includes(user?.role);

  return (
    <div className="min-h-screen flex bg-white text-[#1e1b4b]">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-y-auto bg-white">
        <Navbar setSidebarOpen={setSidebarOpen} />

        <div className="content-padding">
          {/* HEADER */}
          <div className="mb-8">
            <span className="section-label">System Prefs Eyebrow</span>
            <h1 className="text-[20px] font-semibold text-[#1e1b4b] mt-1">Workspace Settings</h1>
            <p className="text-[#6b7280] text-[12px] mt-0.5">
              Configure system policy settings and generate developer access tokens.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 items-start">
            {/* POLICY CONFIG */}
            <div className="bg-white border-hairline rounded-[12px] p-5">
              <div className="flex items-center gap-2 mb-4">
                <SettingsIcon size={16} className="text-[#4f46e5]" />
                <span className="section-label">Workspace Policies</span>
              </div>

              <form onSubmit={handleUpdateSettings} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] text-[#6b7280] font-semibold">Workspace Name</label>
                  <input
                    type="text"
                    value={settings.companyName}
                    onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                    disabled={!isPolicyAdmin}
                    className="bg-[#f9fafb] border-hairline rounded-[7px] px-3 py-2 text-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] text-[#6b7280] font-semibold">Max Leaves / Year</label>
                    <input
                      type="number"
                      value={settings.maxLeavesPerYear}
                      onChange={(e) => setSettings({ ...settings, maxLeavesPerYear: e.target.value })}
                      disabled={!isPolicyAdmin}
                      className="bg-[#f9fafb] border-hairline rounded-[7px] px-3 py-2 text-xs"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] text-[#6b7280] font-semibold">Hours Threshold / Week</label>
                    <input
                      type="number"
                      value={settings.standardHoursPerWeek}
                      onChange={(e) => setSettings({ ...settings, standardHoursPerWeek: e.target.value })}
                      disabled={!isPolicyAdmin}
                      className="bg-[#f9fafb] border-hairline rounded-[7px] px-3 py-2 text-xs"
                      required
                    />
                  </div>
                </div>

                {isPolicyAdmin && (
                  <button type="submit" className="primary-btn px-6 py-2">
                    Save Policies
                  </button>
                )}
              </form>
            </div>

            {/* DEVELOPER KEYS */}
            <div className="bg-white border-hairline rounded-[12px] p-5">
              <div className="flex items-center gap-2 mb-4">
                <Key size={16} className="text-[#4f46e5]" />
                <span className="section-label">Developer Access Keys</span>
              </div>

              <form onSubmit={handleCreateKey} className="flex gap-1.5 mb-6">
                <input
                  type="text"
                  placeholder="Key Label (e.g. CI/CD Bot)"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="flex-1 text-[12px] py-1 border-hairline bg-[#f9fafb]"
                  required
                />
                <button
                  type="submit"
                  disabled={creatingKey}
                  className="primary-btn px-4 py-1.5 flex items-center justify-center shrink-0"
                >
                  <Plus size={14} className="mr-1" />
                  Generate
                </button>
              </form>

              <div className="space-y-3">
                {apiKeys.length === 0 ? (
                  <p className="text-[11px] text-[#9ca3af] text-center py-6 font-mono-data uppercase">No active developer keys.</p>
                ) : (
                  apiKeys.map((keyRec) => (
                    <div
                      key={keyRec.id}
                      className="bg-[#fafafa] border-hairline rounded-lg p-3 flex flex-col gap-2 relative group"
                    >
                      <div className="flex justify-between items-center pr-8">
                        <span className="text-[12px] font-bold text-[#1e1b4b]">{keyRec.name}</span>
                        <span className="font-mono-data text-[8px] text-[#9ca3af] uppercase">
                          {new Date(keyRec.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between bg-white border-hairline rounded px-2 py-1 text-[10px] text-[#4f46e5] font-mono-data select-all">
                        <span className="truncate pr-2">{keyRec.key}</span>
                        <button
                          onClick={() => copyToClipboard(keyRec.key)}
                          className="text-slate-450 hover:text-[#4f46e5] transition"
                          title="Copy Key to clipboard"
                        >
                          <Copy size={11} />
                        </button>
                      </div>

                      <button
                        onClick={() => handleDeleteKey(keyRec.id)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-red-500 transition"
                        title="Revoke Key"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

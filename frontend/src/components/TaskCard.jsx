import API from "../api/axios";

import {
  CalendarDays,
  MessageSquare,
  Trash2,
  Edit2,
  X,
  Play,
  Pause,
  Clock,
  CheckSquare,
  Paperclip,
  Plus,
  Download,
} from "lucide-react";

import { useEffect, useState, useRef, useContext } from "react";

import { AuthContext } from "../context/AuthContext";

import { toast } from "react-toastify";

export default function TaskCard({
  task,
  fetchTasks,
}) {
  const { user } = useContext(AuthContext);

  const [comments, setComments] = useState([]);
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    priority: "",
    dueDate: "",
    assignedToId: "",
    tagsString: "",
  });

  const [users, setUsers] = useState([]);

  // Time tracking states
  const [localTimeSpent, setLocalTimeSpent] = useState(task.timeSpent || 0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerIntervalRef = useRef(null);

  // Sub-tasks states
  const [subTasks, setSubTasks] = useState([]);
  const [newSubTaskTitle, setNewSubTaskTitle] = useState("");

  // Attachments states
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Dynamic Options chooser tab state
  const [activeTab, setActiveTab] = useState(null); // null, 'checklist', 'attachments', 'tracker', 'comments'

  // Sync task.timeSpent if it updates from parents
  useEffect(() => {
    setLocalTimeSpent(task.timeSpent || 0);
  }, [task.timeSpent]);

  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setLocalTimeSpent((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerIntervalRef.current);
    }

    return () => clearInterval(timerIntervalRef.current);
  }, [isTimerRunning]);

  // Sync on unmount if running
  useEffect(() => {
    return () => {
      if (isTimerRunning) {
        API.put(`/tasks/${task.id}/time`, { timeSpent: localTimeSpent }).catch(console.error);
      }
    };
  }, [isTimerRunning, localTimeSpent]);

  const handleToggleTimer = async () => {
    if (isTimerRunning) {
      setIsTimerRunning(false);
      try {
        await API.put(`/tasks/${task.id}/time`, { timeSpent: localTimeSpent });
        toast.success("Tracked time synced successfully!");
        fetchTasks();
      } catch (err) {
        toast.error("Failed to sync tracked time");
      }
    } else {
      setIsTimerRunning(true);
    }
  };

  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const fetchComments = async () => {
    try {
      const res = await API.get(`/tasks/${task.id}/comments`);
      setComments(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get("/users");
      setUsers(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Sub-tasks API calls
  const fetchSubTasks = async () => {
    try {
      const res = await API.get(`/tasks/${task.id}/subtasks`);
      setSubTasks(res.data);
    } catch (err) {
      console.log("Failed to fetch sub-tasks:", err);
    }
  };

  const handleAddSubTask = async (e) => {
    e.preventDefault();
    if (!newSubTaskTitle.trim()) return;

    try {
      const res = await API.post(`/tasks/${task.id}/subtasks`, { title: newSubTaskTitle });
      setSubTasks([...subTasks, res.data]);
      setNewSubTaskTitle("");
      toast.success("Sub-task added!");
    } catch (err) {
      toast.error("Failed to add sub-task");
    }
  };

  const handleToggleSubTask = async (id) => {
    try {
      const res = await API.put(`/tasks/subtasks/${id}/toggle`);
      setSubTasks(subTasks.map((s) => (s.id === id ? res.data : s)));
    } catch (err) {
      toast.error("Failed to toggle sub-task");
    }
  };

  const handleDeleteSubTask = async (id) => {
    try {
      await API.delete(`/tasks/subtasks/${id}`);
      setSubTasks(subTasks.filter((s) => s.id !== id));
      toast.success("Sub-task deleted");
    } catch (err) {
      toast.error("Failed to delete sub-task");
    }
  };

  // Attachments API calls
  const fetchAttachments = async () => {
    try {
      const res = await API.get(`/tasks/${task.id}/attachments`);
      setAttachments(res.data);
    } catch (err) {
      console.log("Failed to fetch attachments:", err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Data = reader.result;
      try {
        const res = await API.post(`/tasks/${task.id}/attachments`, {
          fileName: file.name,
          fileType: file.type || "application/octet-stream",
          fileData: base64Data,
        });
        setAttachments([res.data, ...attachments]);
        toast.success("File uploaded successfully!");
      } catch (err) {
        toast.error("Failed to upload file");
      } finally {
        setUploading(false);
      }
    };

    reader.onerror = () => {
      toast.error("Failed to read file");
      setUploading(false);
    };
  };

  const handleDownloadAttachment = async (id, fileName) => {
    try {
      const res = await API.get(`/tasks/attachments/${id}`);
      const link = document.createElement("a");
      link.href = res.data.fileData;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      toast.error("Failed to download attachment");
    }
  };

  useEffect(() => {
    fetchComments();
    fetchSubTasks();
    fetchAttachments();
    if (["ADMIN", "SUPER_ADMIN", "HR", "MANAGER"].includes(user?.role)) {
      fetchUsers();
    }
  }, []);

  const addComment = async () => {
    if (!message.trim()) return;

    try {
      await API.post(`/tasks/${task.id}/comments`, { message });
      toast.success("Comment Added");
      setMessage("");
      fetchComments();
    } catch (error) {
      console.log(error);
      toast.error("Failed to post comment");
    }
  };

  const updateStatus = async (status) => {
    try {
      await API.put(`/tasks/${task.id}`, { status });
      toast.success("Task Status Updated");
      fetchTasks();
    } catch (error) {
      console.log(error);
      toast.error("Failed to update status");
    }
  };

  const deleteTask = async () => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await API.delete(`/tasks/${task.id}`);
      toast.success("Task Deleted");
      fetchTasks();
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete task");
    }
  };

  const startEdit = () => {
    setEditForm({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate.split('T')[0],
      assignedToId: task.assignedToId || "",
      tagsString: (task.tags || []).map((t) => t.name).join(", "),
    });
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      title: "",
      description: "",
      priority: "",
      dueDate: "",
      assignedToId: "",
      tagsString: "",
    });
  };

  const handleUpdateTask = async () => {
    const formattedTags = editForm.tagsString
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((name) => ({ name, color: "#4f46e5" }));

    try {
      await API.put(`/tasks/${task.id}`, {
        title: editForm.title,
        description: editForm.description,
        priority: editForm.priority,
        dueDate: editForm.dueDate,
        assignedToId: editForm.assignedToId,
        tags: formattedTags,
      });
      toast.success("Task Updated");
      setIsEditing(false);
      fetchTasks();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update task");
    }
  };

  // Border accents
  const statusBorder = {
    TODO: "border-l-[#4f46e5]",
    IN_PROGRESS: "border-l-[#f59e0b]",
    DONE: "border-l-[#10b981]",
  };

  // Sub-task progress
  const completedSubTasks = subTasks.filter((s) => s.completed).length;
  const subTaskProgress = subTasks.length
    ? Math.round((completedSubTasks / subTasks.length) * 100)
    : 0;

  const toggleTab = (tabName) => {
    setActiveTab(activeTab === tabName ? null : tabName);
  };

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "DONE";

  return (
    <div className={`bg-white border-hairline border-l-[3px] ${statusBorder[task.status]} p-4 rounded-[12px] shadow-none flex flex-col justify-between gap-4 transition-all duration-200`}>
      {/* Core Task Info */}
      <div>
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 overflow-hidden">
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full bg-[#f9fafb] border-hairline rounded-[7px] px-3 py-1.5 text-xs text-[#1e1b4b]"
                  placeholder="Task Title"
                />
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full bg-[#f9fafb] border-hairline rounded-[7px] px-3 py-1.5 text-xs text-[#1e1b4b]"
                  rows="2"
                  placeholder="Task Description"
                />
                <input
                  type="text"
                  value={editForm.tagsString}
                  onChange={(e) => setEditForm({ ...editForm, tagsString: e.target.value })}
                  className="w-full bg-[#f9fafb] border-hairline rounded-[7px] px-3 py-1.5 text-xs text-[#1e1b4b]"
                  placeholder="Tags (comma separated, e.g. FE, QA)"
                />
              </div>
            ) : (
              <>
                <span className="section-pill-tag mb-1.5">Task Segment</span>
                
                <h2 className="text-[14px] font-semibold text-[#1e1b4b] truncate">
                  {task.title}
                </h2>

                <p className="text-[12px] text-[#6b7280] mt-1.5 leading-relaxed">
                  {task.description}
                </p>

                {/* Task Tags list */}
                {task.tags && task.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {task.tags.map((t) => (
                      <span
                        key={t.id}
                        style={{ backgroundColor: `${t.color}15`, color: t.color, borderColor: `${t.color}30` }}
                        className="text-[9px] font-mono-data font-bold px-1.5 py-0.5 rounded border border-solid select-none uppercase tracking-wider"
                      >
                        {t.name}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Priority Badge */}
          {isEditing ? (
            <select
              value={editForm.priority}
              onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
              className="bg-[#f9fafb] border-hairline rounded-[7px] px-3 py-1 text-xs"
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>
          ) : (
            <div
              className={`badge ${
                task.priority === "HIGH"
                  ? "badge-high"
                  : task.priority === "MEDIUM"
                  ? "badge-medium"
                  : "badge-low"
              }`}
            >
              {task.priority}
            </div>
          )}
        </div>

        {/* Status & Due Date */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-1.5">
            <div
              className={`badge ${
                task.status === "DONE"
                  ? "badge-done"
                  : task.status === "IN_PROGRESS"
                  ? "badge-progress"
                  : "badge-todo"
              }`}
            >
              {task.status.replace("_", " ")}
            </div>

            {isOverdue && (
              <span className="badge badge-high shrink-0 font-bold animate-pulse">
                Overdue
              </span>
            )}
          </div>

          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={editForm.dueDate}
                onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                className="bg-[#f9fafb] border-hairline rounded-[7px] px-2 py-1 text-xs"
              />
              <select
                value={editForm.assignedToId}
                onChange={(e) => setEditForm({ ...editForm, assignedToId: e.target.value })}
                className="bg-[#f9fafb] border-hairline rounded-[7px] px-2 py-1 text-xs"
              >
                <option value="">Assign to...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 font-mono-data text-[10px] text-[#9ca3af] uppercase">
              <CalendarDays size={13} />
              {new Date(task.dueDate).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Options Chooser Grid Buttons */}
      <div className="grid grid-cols-4 gap-1.5 border-t-hairline pt-3">
        <button
          onClick={() => toggleTab("checklist")}
          className={`flex flex-col items-center justify-center py-2 rounded-lg text-[9px] font-mono-data font-medium transition ${
            activeTab === "checklist"
              ? "bg-[#ede9fe] text-[#4f46e5] border-hairline"
              : "bg-[#fafafa] text-[#6b7280] hover:bg-[#ede9fe]/50 border-hairline"
          }`}
          title="Checklist Sub-tasks"
        >
          <CheckSquare size={13} className="mb-0.5" />
          <span>LIST ({subTasks.length})</span>
        </button>

        <button
          onClick={() => toggleTab("attachments")}
          className={`flex flex-col items-center justify-center py-2 rounded-lg text-[9px] font-mono-data font-medium transition ${
            activeTab === "attachments"
              ? "bg-[#ede9fe] text-[#4f46e5] border-hairline"
              : "bg-[#fafafa] text-[#6b7280] hover:bg-[#ede9fe]/50 border-hairline"
          }`}
          title="File Attachments"
        >
          <Paperclip size={13} className="mb-0.5" />
          <span>FILES ({attachments.length})</span>
        </button>

        <button
          onClick={() => toggleTab("tracker")}
          className={`flex flex-col items-center justify-center py-2 rounded-lg text-[9px] font-mono-data font-medium transition ${
            activeTab === "tracker"
              ? "bg-[#ede9fe] text-[#4f46e5] border-hairline"
              : "bg-[#fafafa] text-[#6b7280] hover:bg-[#ede9fe]/50 border-hairline"
          }`}
          title="Work Hours Stopwatch"
        >
          <Clock size={13} className="mb-0.5" />
          <span>TIME</span>
        </button>

        <button
          onClick={() => toggleTab("comments")}
          className={`flex flex-col items-center justify-center py-2 rounded-lg text-[9px] font-mono-data font-medium transition ${
            activeTab === "comments"
              ? "bg-[#ede9fe] text-[#4f46e5] border-hairline"
              : "bg-[#fafafa] text-[#6b7280] hover:bg-[#ede9fe]/50 border-hairline"
          }`}
          title="Task Discussions"
        >
          <MessageSquare size={13} className="mb-0.5" />
          <span>CHAT ({comments.length})</span>
        </button>
      </div>

      {/* Inline Expanded panels based on option choice */}
      {activeTab === "checklist" && (
        <div className="bg-[#fafafa] border-hairline rounded-[8px] p-3 animate-slide-down">
          <div className="flex justify-between items-center mb-2">
            <span className="font-mono-data text-[9px] uppercase text-[#9ca3af]">Checklist</span>
            <span className="font-mono-data text-[9px] text-[#1e1b4b] font-bold">{subTaskProgress}%</span>
          </div>

          <div className="w-full bg-[#e8e8f0] rounded-full h-1.5 mb-3">
            <div
              className="bg-[#4f46e5] h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${subTaskProgress}%` }}
            />
          </div>

          <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
            {subTasks.length === 0 ? (
              <p className="font-mono-data text-[10px] text-[#9ca3af] py-1">No items.</p>
            ) : (
              subTasks.map((s) => (
                <div key={s.id} className="flex items-center justify-between group">
                  <label className="flex items-center gap-2 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={s.completed}
                      onChange={() => handleToggleSubTask(s.id)}
                      className="w-3.5 h-3.5 text-[#4f46e5] border-slate-350 rounded focus:ring-0"
                    />
                    <span className={`text-[12px] text-[#1e1b4b] ${s.completed ? "line-through text-slate-450" : ""}`}>
                      {s.title}
                    </span>
                  </label>
                  <button
                    onClick={() => handleDeleteSubTask(s.id)}
                    className="text-slate-450 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleAddSubTask} className="flex gap-1.5 mt-3">
            <input
              type="text"
              placeholder="Add sub-task..."
              value={newSubTaskTitle}
              onChange={(e) => setNewSubTaskTitle(e.target.value)}
              className="flex-1 text-[11px] py-1 px-2 border-hairline bg-[#f9fafb]"
            />
            <button type="submit" className="primary-btn py-1 px-2 flex items-center justify-center shrink-0">
              <Plus size={10} />
            </button>
          </form>
        </div>
      )}

      {activeTab === "attachments" && (
        <div className="bg-[#fafafa] border-hairline rounded-[8px] p-3 animate-slide-down">
          <div className="flex justify-between items-center mb-2">
            <span className="font-mono-data text-[9px] uppercase text-[#9ca3af]">Attachments</span>
            <label className="cursor-pointer font-mono-data text-[9px] font-bold text-[#4f46e5] hover:text-[#4338ca] transition">
              {uploading ? "UPLOADING..." : "UPLOAD"}
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>

          <div className="space-y-1.5 max-h-[100px] overflow-y-auto pr-1">
            {attachments.length === 0 ? (
              <p className="font-mono-data text-[10px] text-[#9ca3af] py-1">No uploads.</p>
            ) : (
              attachments.map((file) => (
                <div key={file.id} className="flex items-center justify-between bg-white border-hairline rounded p-1.5 text-[11px] text-[#1e1b4b] shadow-none">
                  <span className="truncate flex-1 pr-2">{file.fileName}</span>
                  <button
                    onClick={() => handleDownloadAttachment(file.id, file.fileName)}
                    className="text-[#4f46e5] hover:text-[#4338ca] transition shrink-0"
                  >
                    <Download size={11} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === "tracker" && (
        <div className="bg-[#fafafa] border-hairline rounded-[8px] p-3 flex items-center justify-between animate-slide-down">
          <div className="flex items-center gap-2">
            <Clock size={13} className="text-[#6b7280]" />
            <span className="font-mono-data text-[12px] font-bold text-[#1e1b4b]">
              {formatTime(localTimeSpent)}
            </span>
          </div>

          <button
            onClick={handleToggleTimer}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-mono-data font-bold uppercase transition ${
              isTimerRunning
                ? "bg-[#fee2e2] text-[#991b1b] hover:bg-red-100"
                : "bg-[#ede9fe] text-[#4f46e5] hover:bg-violet-100"
            }`}
          >
            {isTimerRunning ? <Pause size={10} /> : <Play size={10} />}
            {isTimerRunning ? "Pause" : "Start"}
          </button>
        </div>
      )}

      {activeTab === "comments" && (
        <div className="bg-[#fafafa] border-hairline rounded-[8px] p-3 animate-slide-down">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="font-mono-data text-[9px] uppercase text-[#9ca3af]">Comments</span>
          </div>

          <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="bg-white border-hairline rounded-lg p-2 shadow-none">
                  <div className="text-[11px] text-[#1e1b4b] leading-normal">{comment.message}</div>
                  <div className="flex items-center justify-between mt-1.5 text-[8px] font-mono-data text-[#9ca3af] uppercase">
                    <span>{comment.createdBy?.name || "User"}</span>
                    <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="font-mono-data text-[10px] text-[#9ca3af] py-1">No comments.</p>
            )}
          </div>

          <div className="flex gap-1.5 mt-3">
            <input
              type="text"
              placeholder="Add comment..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 text-[11px] py-1 border-hairline bg-[#f9fafb]"
            />
            <button onClick={addComment} className="primary-btn text-[11px] py-1 px-3">
              Send
            </button>
          </div>
        </div>
      )}

      {/* Core Action Operations Footer */}
      <div className="pt-2 border-t border-slate-50">
        <div className="flex flex-wrap gap-1.5">
          {isEditing ? (
            <>
              <button onClick={handleUpdateTask} className="primary-btn text-[11px] py-1 px-3">
                Save
              </button>
              <button onClick={cancelEdit} className="secondary-btn text-[11px] py-1 px-3 flex items-center gap-1">
                <X size={11} />
                Cancel
              </button>
            </>
          ) : (
            <>
              <button onClick={() => updateStatus("TODO")} className="secondary-btn text-[11px] py-1 px-2.5">
                TODO
              </button>
              <button onClick={() => updateStatus("IN_PROGRESS")} className="secondary-btn text-[11px] py-1 px-2.5">
                Progress
              </button>
              <button onClick={() => updateStatus("DONE")} className="secondary-btn text-[11px] py-1 px-2.5">
                Done
              </button>

              {["ADMIN", "SUPER_ADMIN", "MANAGER"].includes(user?.role) && (
                <button onClick={startEdit} className="secondary-btn text-[11px] py-1 px-2.5 flex items-center gap-1">
                  <Edit2 size={11} />
                  Edit
                </button>
              )}

              {["ADMIN", "SUPER_ADMIN"].includes(user?.role) && (
                <button onClick={deleteTask} className="secondary-btn danger-btn text-[11px] py-1 px-2.5 flex items-center gap-1">
                  <Trash2 size={11} />
                  Delete
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
import API from "../api/axios";

import {
  CalendarDays,
  MessageSquare,
  Trash2,
  Edit2,
  X,
} from "lucide-react";

import { useEffect, useState, useContext } from "react";

import { AuthContext } from "../context/AuthContext";

import { toast } from "react-toastify";

export default function TaskCard({
  task,
  fetchTasks,
}) {

  const { user } =
    useContext(AuthContext);

  const [comments, setComments] =
    useState([]);

  const [message, setMessage] =
    useState("");

  const [isEditing, setIsEditing] =
    useState(false);

  const [editForm, setEditForm] =
    useState({
      title: "",
      description: "",
      priority: "",
      dueDate: "",
      assignedToId: "",
    });

  const [users, setUsers] =
    useState([]);

  const fetchComments = async () => {

    try {

      const res = await API.get(
        `/tasks/${task.id}/comments`
      );

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

  useEffect(() => {

    fetchComments();
    if (user?.role === "ADMIN" || user?.role === "MANAGER") {
      fetchUsers();
    }

  }, []);

  const addComment = async () => {

    if (!message.trim()) return;

    try {

      await API.post(`/tasks/${task.id}/comments`, {
        message,
      });

      toast.success("Comment Added");

      setMessage("");

      fetchComments();

    } catch (error) {

      console.log(error);

    }
  };

  const updateStatus = async (
    status
  ) => {

    try {

      await API.put(
        `/tasks/${task.id}`,
        { status }
      );

      toast.success(
        "Task Updated"
      );

      fetchTasks();

    } catch (error) {

      console.log(error);

    }
  };

  const deleteTask = async () => {

    try {

      await API.delete(
        `/tasks/${task.id}`
      );

      toast.success(
        "Task Deleted"
      );

      fetchTasks();

    } catch (error) {

      console.log(error);

    }
  };

  const startEdit = () => {
    setEditForm({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate.split('T')[0],
      assignedToId: task.assignedToId,
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
    });
  };

  const updateTask = async () => {
    try {
      await API.put(`/tasks/${task.id}`, editForm);
      toast.success("Task Updated");
      setIsEditing(false);
      fetchTasks();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update task");
    }
  };

  const statusBorder = {
    TODO: "border-l-[#7b7e99]",
    IN_PROGRESS:
      "border-l-[#c99a2e]",
    DONE: "border-l-[#4a9e6a]",
  };

  return (
    <div
      className={`dark-card border-l-[3px] ${statusBorder[task.status]} p-5`}
    >

      {/* Header */}
      <div className="flex justify-between items-start gap-3">

        <div className="flex-1">

          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full bg-white border border-[#e5e7eb] rounded-md px-3 py-2 text-sm"
                placeholder="Task Title"
              />
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="w-full bg-white border border-[#e5e7eb] rounded-md px-3 py-2 text-sm"
                rows="2"
                placeholder="Task Description"
              />
            </div>
          ) : (
            <>
              <h2 className="text-[15px] font-semibold text-[#1a1a1a]">
                {task.title}
              </h2>

              <p className="text-[12px] text-[#666] mt-2 leading-5">
                {task.description}
              </p>
            </>
          )}

        </div>

        {/* Priority Badge */}
        {isEditing ? (
          <select
            value={editForm.priority}
            onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
            className="bg-white border border-[#e5e7eb] rounded-md px-3 py-2 text-sm"
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
                ? "badge-progress"
                : "badge-todo"
            }`}
          >
            {task.priority}
          </div>
        )}

      </div>

      {/* Meta */}
      <div className="flex items-center justify-between mt-5">

        <div
          className={`badge ${
            task.status === "DONE"
              ? "badge-done"
              : task.status ===
                "IN_PROGRESS"
              ? "badge-progress"
              : "badge-todo"
          }`}
        >
          {task.status}
        </div>

        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={editForm.dueDate}
              onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
              className="bg-white border border-[#e5e7eb] rounded-md px-3 py-2 text-sm"
            />
            <select
              value={editForm.assignedToId}
              onChange={(e) => setEditForm({ ...editForm, assignedToId: e.target.value })}
              className="bg-white border border-[#e5e7eb] rounded-md px-3 py-2 text-sm"
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
          <div className="flex items-center gap-2 text-[11px] text-[#555] mono">

            <CalendarDays size={14} />

            {new Date(
              task.dueDate
            ).toLocaleDateString()}

          </div>
        )}

      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mt-5">

        {isEditing ? (
          <>
            <button
              onClick={updateTask}
              className="primary-btn"
            >
              Save
            </button>

            <button
              onClick={cancelEdit}
              className="secondary-btn flex items-center gap-2"
            >
              <X size={14} />
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() =>
                updateStatus("TODO")
              }
              className="secondary-btn"
            >
              TODO
            </button>

            <button
              onClick={() =>
                updateStatus(
                  "IN_PROGRESS"
                )
              }
              className="secondary-btn"
            >
              Progress
            </button>

            <button
              onClick={() =>
                updateStatus("DONE")
              }
              className="secondary-btn"
            >
              Done
            </button>

            {(user?.role === "ADMIN" || user?.role === "MANAGER") && (
              <button
                onClick={startEdit}
                className="secondary-btn flex items-center gap-2"
              >
                <Edit2 size={14} />
                Edit
              </button>
            )}

            {user?.role === "ADMIN" && (

              <button
                onClick={deleteTask}
                className="secondary-btn danger-btn flex items-center gap-2"
              >
                <Trash2 size={14} />
                Delete
              </button>

            )}
          </>
        )}

      </div>

      {/* Comments */}
      <div className="mt-6 border-t border-[#e5e7eb] pt-5">

        <div className="flex items-center gap-2 mb-4">

          <MessageSquare size={15} />

          <p className="section-label">
            Comments
          </p>

        </div>

        <div className="space-y-2 max-h-[150px] overflow-auto pr-1">

          {comments.length > 0 ? (

            comments.map((comment) => (

              <div
                key={comment.id}
                className="bg-[#f9fafb] border border-[#e5e7eb] rounded-md p-3"
              >
                <div className="text-[12px] text-[#666] mb-1">
                  {comment.message}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-[#888] font-medium">
                    {comment.createdBy?.name || 'Unknown'}
                  </span>
                  <span className="text-[10px] text-[#888]">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

            ))

          ) : (

            <p className="text-[11px] text-[#555]">
              No comments yet.
            </p>

          )}

        </div>

        {/* Add Comment */}
        <div className="flex gap-2 mt-4">

          <input
            type="text"
            placeholder="Write a comment..."
            value={message}
            onChange={(e) =>
              setMessage(
                e.target.value
              )
            }
            className="flex-1"
          />

          <button
            onClick={addComment}
            className="primary-btn"
          >
            Send
          </button>

        </div>

      </div>

    </div>
  );
}
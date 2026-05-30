import API from "../api/axios";

import {
  CalendarDays,
  MessageSquare,
  Trash2,
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

  useEffect(() => {

    fetchComments();

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

        <div>

          <h2 className="text-[15px] font-semibold text-[#1a1a1a]">
            {task.title}
          </h2>

          <p className="text-[12px] text-[#666] mt-2 leading-5">
            {task.description}
          </p>

        </div>

        {/* Priority Badge */}
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

        <div className="flex items-center gap-2 text-[11px] text-[#555] mono">

          <CalendarDays size={14} />

          {new Date(
            task.dueDate
          ).toLocaleDateString()}

        </div>

      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mt-5">

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

        {user?.role ===
          "ADMIN" && (

          <button
            onClick={deleteTask}
            className="secondary-btn danger-btn flex items-center gap-2"
          >
            <Trash2 size={14} />
            Delete
          </button>

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
                className="bg-[#f9fafb] border border-[#e5e7eb] rounded-md p-3 text-[12px] text-[#666]"
              >
                {comment.message}
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
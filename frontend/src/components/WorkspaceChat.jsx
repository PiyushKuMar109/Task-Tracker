import { useState, useEffect, useRef, useContext } from "react";
import API from "../api/axios";
import { MessageSquare, Send, X } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

export default function WorkspaceChat() {
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const res = await API.get("/chat");
      setMessages(res.data);
    } catch (err) {
      console.log("Failed to load chat messages:", err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      // Poll for new messages every 3 seconds
      pollIntervalRef.current = setInterval(fetchMessages, 3000);
    } else {
      clearInterval(pollIntervalRef.current);
    }
    return () => clearInterval(pollIntervalRef.current);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    try {
      const res = await API.post("/chat", { message: inputText });
      setMessages((prev) => [...prev, res.data]);
      setInputText("");
    } catch (err) {
      console.log("Failed to send message:", err);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-24 bg-indigo-600 text-white p-3.5 rounded-full shadow-lg shadow-indigo-500/20 flex items-center justify-center hover:scale-105 active:scale-95 transition z-40"
        title="Workspace Chat Room"
      >
        <MessageSquare size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-24 w-80 h-96 bg-white border border-slate-200 rounded-2xl shadow-xl flex flex-col z-50 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center p-3.5 border-b border-slate-100 bg-slate-50/80 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-indigo-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Workspace Chat</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-slate-400 hover:text-slate-650 transition"
        >
          <X size={16} />
        </button>
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
        {messages.length === 0 ? (
          <p className="text-center text-xs text-slate-400 py-10">Start the conversation!</p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.userId === user?.id;
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <span className="text-[9px] text-slate-400 font-semibold mb-0.5 px-1 uppercase tracking-wider">
                  {msg.user?.name} ({msg.user?.role})
                </span>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                    isMe
                      ? "bg-indigo-600 text-white rounded-tr-none shadow-sm shadow-indigo-500/10"
                      : "bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/60"
                  }`}
                >
                  {msg.message}
                </div>
                <span className="text-[8px] text-slate-400 mt-0.5 px-1 font-mono">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-100 flex gap-2">
        <input
          type="text"
          placeholder="Message workspace..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 text-xs py-2 px-3 border-slate-200"
        />
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-lg flex items-center justify-center shrink-0 shadow-sm shadow-indigo-500/10 transition"
        >
          <Send size={12} />
        </button>
      </form>
    </div>
  );
}

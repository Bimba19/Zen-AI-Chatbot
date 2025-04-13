"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const botName = "ZenBot";
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");

    setMounted(true);
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode === "true") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, [router]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("darkMode", darkMode);
      if (darkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [darkMode, mounted]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/chat",
        { message: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const botReply = { role: "bot", text: res.data.reply };
      setMessages((prev) => [...prev, botReply]);
    } catch (err) {
      console.error("Chat error:", err);
      alert("Chat error. Try again or login again.");
      router.push("/login");
    }
  };

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/chat/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(res.data.history);
      setShowHistory(true);
    } catch (err) {
      console.error("History error:", err);
      alert("Failed to load history.");
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/chat/history/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchHistory();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete.");
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-100 text-black dark:bg-gray-900 dark:text-white flex flex-col">
      {/* Header */}
      <div className="w-full bg-white dark:bg-gray-800 px-4 py-3 flex justify-between items-center">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={fetchHistory}
            className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
          >
            🕘 View History
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="text-yellow-600 dark:text-yellow-400 text-sm hover:underline"
          >
            🔆 Toggle Mode
          </button>
        </div>

        {/* Center */}
        <h1 className="text-xl font-bold text-center">{botName}</h1>

        {/* Right */}
        <button
          className="text-red-500 hover:underline text-sm"
          onClick={() => {
            localStorage.removeItem("token");
            router.push("/login");
          }}
        >
          🔓 Logout
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-grow flex flex-col p-4 items-center">
        <div className="w-full max-w-3xl bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md overflow-y-auto flex-grow mb-4 space-y-3">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`${
                msg.role === "user" ? "text-right" : "text-left"
              }`}
            >
              <span
                className={`inline-block px-4 py-2 rounded-2xl ${
                  msg.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300 dark:bg-gray-700 dark:text-white"
                }`}
              >
                {msg.role === "bot" ? `${botName}: ${msg.text}` : msg.text}
              </span>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="w-full max-w-3xl flex">
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-l-lg bg-white dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={handleSend}
            className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-500"
          >
            Send
          </button>
        </div>
      </div>

      {/* History Section */}
      {showHistory && (
        <div className="w-full max-w-3xl bg-Cyan-200 dark:bg-gray-700 p-4 rounded-lg shadow mx-auto mb-6">
          <h2 className="font-semibold mb-2">Chat History</h2>
          {history.length === 0 ? (
            <p>No history found.</p>
          ) : (
            history.map((item, index) => (
              <div key={index} className="mb-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p>
                      <strong>You:</strong> {item.userMessage}
                    </p>
                    <p>
                      <strong>{botName}:</strong> {item.botReply}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="text-red-700 hover:text-red-700 text-sm"
                    title="Delete message"
                  >
                    Delete
                  </button>
                </div>
                <hr className="my-2" />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

'use client';
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

// Custom hook for handling dark mode
const useDarkMode = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved === "true") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return [darkMode, setDarkMode];
};

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [darkMode, setDarkMode] = useDarkMode();

  const botName = "ZenBot";

  // Define the predefined replies for quick buttons
  const predefinedReplies = {
    Health: "Health is wealth! Keep your body active and hydrated.",
    Diet: "A balanced diet is key to good health. Include a variety of fruits, vegetables, and proteins.",
    "Importance of Healthy Diet": "A healthy diet improves overall health, energy levels, and reduces disease risk.",
    "Diet Plan for Children": "For children, a diet with fruits, vegetables, protein, and healthy fats is essential for growth.",
    "Diet Plan for Teenagers": "Teenagers need a balanced diet with sufficient protein, vitamins, and minerals to support their development.",
    "Diet Plan for Adults": "Adults should focus on a diet rich in fiber, protein, and healthy fats, while avoiding processed foods.",
    "Diet Plan for Seniors": "For seniors, a diet rich in calcium, vitamin D, and fiber is important for bone health and digestion.",
    "Exercise Info": "Exercise is crucial for maintaining a healthy body. Aim for at least 30 minutes of physical activity daily.",
    "Mental Health Info": "Mental health is just as important as physical health. Practice mindfulness and seek support when needed."
  };

  // List of quick reply buttons
  const quickReplies = Object.keys(predefinedReplies);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
    setMounted(true);
  }, [router]);

  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Token not found. Redirecting to login...");
      router.push("/login");
      throw new Error("Token missing");
    }
    return token;
  };

  // Handle sending messages
  const handleSend = async (msg = input) => {
    if (!msg.trim()) return;

    const userMessage = { role: "user", text: msg };
    setMessages((prev) => [...prev, userMessage]);
    if (msg === input) setInput("");
    setLoading(true);

    // Check if the message matches a predefined response
    if (predefinedReplies[msg]) {
      const botReply = { role: "bot", text: predefinedReplies[msg] };
      setMessages((prev) => [...prev, botReply]);
      setLoading(false);
      return;
    }

    try {
      const token = getToken();
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL; // Use backend URL from env
      const res = await axios.post(
        `${backendUrl}/api/chat`,
        { message: msg },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const botReply = { role: "bot", text: res.data.reply };
      setMessages((prev) => [...prev, botReply]);
    } catch (err) {
      console.error(err);
      alert("Error: " + (err?.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Fetch chat history
  const fetchHistory = async () => {
    setShowHistory(true);
    try {
      const token = getToken();
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL; // Use backend URL from env
      const res = await axios.get(`${backendUrl}/api/chat/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(res.data.history);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch history.");
    }
  };

  // Delete a chat history entry
  const handleDelete = async (id) => {
    try {
      const token = getToken();
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL; // Use backend URL from env
      await axios.delete(`${backendUrl}/api/chat/history/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error(err);
      alert("Error deleting message.");
    }
  };

  // Handle logout
  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token");
      router.push("/login");
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-black dark:text-white">
      {/* Header */}
      <header className="w-full bg-white dark:bg-gray-800 px-4 py-3 flex justify-between items-center">
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
        <h1 className="text-xl font-bold text-center">{botName}</h1>
        <button
          onClick={handleLogout}
          className="text-red-500 hover:underline text-sm"
        >
          🔓 Logout
        </button>
      </header>

      {/* Chat Area */}
      <main className="flex-grow flex flex-col items-center p-4">
        {/* Quick Replies */}
        <div className="w-full max-w-3xl flex flex-wrap gap-2 mb-4">
          {quickReplies.map((text, i) => (
            <button
              key={i}
              onClick={() => handleSend(text)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-xl text-sm"
            >
              {text}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="w-full max-w-3xl flex-grow overflow-y-auto p-4 bg-white dark:bg-gray-800 rounded-xl shadow space-y-3 mb-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={msg.role === "user" ? "text-right" : "text-left"}
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

        {/* Input */}
        <div className="w-full max-w-3xl flex">
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="flex-1 px-4 py-2 border rounded-l-lg bg-white dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-500"
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      </main>

      {/* History */}
      {showHistory && (
        <section className="w-full max-w-3xl mx-auto bg-gray-200 dark:bg-gray-700 p-4 rounded-lg shadow mb-6">
          <h2 className="font-semibold mb-2">Chat History</h2>
          {history.length === 0 ? (
            <p>No history found.</p>
          ) : (
            history.map((item) => (
              <div key={item._id} className="mb-3">
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
                    className="text-red-600 text-sm hover:underline"
                  >
                    Delete
                  </button>
                </div>
                <hr className="my-2" />
              </div>
            ))
          )}
        </section>
      )}
    </div>
  );
}

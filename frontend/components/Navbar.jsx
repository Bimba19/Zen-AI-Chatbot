'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar({ onToggleHistory, onToggleDarkMode }) {
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark';
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newMode);
    onToggleDarkMode?.(newMode);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <nav className="flex items-center justify-between px-4 py-3 bg-gray-200 dark:bg-gray-800 shadow">
      <h1 className="text-xl font-bold dark:text-white">🧠 ChatBot</h1>
      <div className="flex gap-4">
        <button onClick={onToggleHistory} className="text-sm text-gray-700 dark:text-gray-300">
          🕓 History
        </button>
        <button onClick={toggleTheme} className="text-sm text-gray-700 dark:text-gray-300">
          {darkMode ? '🌞 Light' : '🌙 Dark'}
        </button>
        <button onClick={handleLogout} className="text-sm text-red-500">
          🔐 Logout
        </button>
      </div>
    </nav>
  );
}

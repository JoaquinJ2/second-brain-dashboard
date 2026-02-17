"use client";

import { useState, useEffect } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDark = localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDark(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggle = () => {
    const newDark = !dark;
    setDark(newDark);
    localStorage.setItem("theme", newDark ? "dark" : "light");
    if (newDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggle}
      className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium dark:border-zinc-700 dark:bg-zinc-800"
      aria-label="Toggle theme"
    >
      {dark ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}

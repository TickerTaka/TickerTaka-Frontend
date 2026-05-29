"use client";

import { useTheme } from "@/components/layout/ThemeProvider";

export default function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      title={isDark ? "라이트 모드" : "다크 모드"}
      className="p-1.5 rounded-full hover:bg-surface-variant text-on-surface-variant transition-colors"
    >
      <span className="material-symbols-outlined">{isDark ? "light_mode" : "dark_mode"}</span>
    </button>
  );
}

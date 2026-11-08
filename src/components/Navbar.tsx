"use client";

import React from "react";
import {
  GraduationCap,
  Flame,
  Moon,
  Sun,
  Volume2,
  Sparkles,
  BookMarked,
  BarChart3,
  LayoutDashboard,
  PlayCircle,
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

interface NavbarProps {
  currentTab: "dashboard" | "study" | "words" | "stats" | "notes";
  onTabChange: (tab: "dashboard" | "study" | "words" | "stats" | "notes") => void;
  streak: number;
  voiceAccent: "en-US" | "en-GB";
  onAccentToggle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  streak,
  voiceAccent,
  onAccentToggle,
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => onTabChange("dashboard")}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                LexiFlow
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium hidden sm:block">
              Görsel & Aralıklı Tekrar
            </p>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/60 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
          <button
            type="button"
            onClick={() => onTabChange("dashboard")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              currentTab === "dashboard"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Panel</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange("study")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              currentTab === "study"
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Çalış</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange("words")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              currentTab === "words"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>Kelime Havuzu</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange("notes")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              currentTab === "notes"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Konu</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange("stats")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              currentTab === "stats"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>İstatistikler</span>
          </button>
        </nav>

        {/* Right Tools (Streak, Accent, Theme) */}
        <div className="flex items-center gap-2">
          {/* Streak indicator */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold shadow-sm"
            title="Günlük Seri (Streak)"
          >
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-bounce" />
            <span>{streak} Gün</span>
          </div>

          {/* Accent Switcher Button */}
          <button
            type="button"
            onClick={onAccentToggle}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Telaffuz Aksanını Değiştir"
          >
            <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
            <span>{voiceAccent === "en-US" ? "US (Amerikan)" : "UK (İngiliz)"}</span>
          </button>

          {/* Theme Switcher Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-200/80 dark:border-slate-800/80 py-2 bg-white dark:bg-slate-900">
        <button
          type="button"
          onClick={() => onTabChange("dashboard")}
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold ${
            currentTab === "dashboard"
              ? "text-indigo-600 dark:text-indigo-400"
              : "text-slate-500"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Panel</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange("study")}
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold ${
            currentTab === "study"
              ? "text-indigo-600 dark:text-indigo-400 font-bold"
              : "text-slate-500"
          }`}
        >
          <PlayCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Çalış</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange("words")}
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold ${
            currentTab === "words"
              ? "text-indigo-600 dark:text-indigo-400"
              : "text-slate-500"
          }`}
        >
          <BookMarked className="w-4 h-4" />
          <span>Kelimeler</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange("notes")}
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold ${
            currentTab === "notes" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500"
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Konu</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange("stats")}
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold ${
            currentTab === "stats"
              ? "text-indigo-600 dark:text-indigo-400"
              : "text-slate-500"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>İstatistik</span>
        </button>
      </div>
    </header>
  );
};


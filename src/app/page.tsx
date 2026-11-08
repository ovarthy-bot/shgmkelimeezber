"use client";

import React, { useState, useEffect, useCallback } from "react";
import { initializeDatabase, getOverallStats, OverallStats } from "@/lib/db";
import { Navbar } from "@/components/Navbar";
import { Dashboard } from "@/components/Dashboard";
import { StudySession } from "@/components/StudySession";
import { WordManagement } from "@/components/WordManagement";
import { StatsView } from "@/components/StatsView";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "study" | "words" | "stats">("dashboard");
  const [voiceAccent, setVoiceAccent] = useState<"en-US" | "en-GB">("en-US");
  const [stats, setStats] = useState<OverallStats | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const refreshStats = useCallback(async () => {
    try {
      const data = await getOverallStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  }, []);

  useEffect(() => {
    async function init() {
      try {
        await initializeDatabase();
        await refreshStats();
      } catch (e) {
        console.error("Initialization error:", e);
      } finally {
        setIsInitializing(false);
      }
    }
    init();
  }, [refreshStats]);

  const handleStartSession = () => {
    setActiveTab("study");
  };

  const handleFinishSession = () => {
    refreshStats();
    setActiveTab("dashboard");
  };

  const handleToggleAccent = () => {
    setVoiceAccent((prev) => (prev === "en-US" ? "en-GB" : "en-US"));
  };

  if (isInitializing) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center p-6 bg-slate-900 text-white">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin mb-4" />
        <h2 className="text-xl font-bold">LexiFlow Hazırlanıyor...</h2>
        <p className="text-sm text-slate-400 mt-1">
          IndexedDB veritabanı ve yapay zeka kelime modelleri yükleniyor.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === "dashboard" || tab === "stats") {
            refreshStats();
          }
        }}
        streak={stats?.streak || 1}
        voiceAccent={voiceAccent}
        onAccentToggle={handleToggleAccent}
      />

      {/* Main Body */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        {activeTab === "dashboard" && (
          <Dashboard
            stats={stats}
            onStartSession={handleStartSession}
            onNavigateToWords={() => setActiveTab("words")}
            onNavigateToStats={() => setActiveTab("stats")}
          />
        )}

        {activeTab === "study" && (
          <StudySession
            onFinish={handleFinishSession}
            voiceAccent={voiceAccent}
          />
        )}

        {activeTab === "words" && <WordManagement />}

        {activeTab === "stats" && <StatsView />}

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800/80 py-6 text-center text-xs text-slate-400 dark:text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 LexiFlow. Açık Kaynaklı Görsel Kelime Ezberleme Platformu.</p>
          <div className="flex items-center gap-4">
            <span>SuperMemo 2 Algoritması</span>
            <span>•</span>
            <span>Web Speech API</span>
            <span>•</span>
            <span>IndexedDB Çevrimdışı</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

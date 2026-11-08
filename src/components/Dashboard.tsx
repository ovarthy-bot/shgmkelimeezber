"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Play,
  Sparkles,
  Flame,
  Clock,
  Award,
  Zap,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  Eye,
  BookOpen,
} from "lucide-react";
import { OverallStats } from "@/lib/db";

interface DashboardProps {
  stats: OverallStats | null;
  onStartSession: () => void;
  onNavigateToWords: () => void;
  onNavigateToStats: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  onStartSession,
  onNavigateToWords,
  onNavigateToStats,
}) => {
  const dailyGoal = stats?.dailyGoal || 10;
  const reviewedToday = stats?.reviewedTodayCount || 0;
  const progressPercent = Math.min(100, Math.round((reviewedToday / dailyGoal) * 100));

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 pb-12">
      {/* Hero / Daily Goal Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white p-6 sm:p-10 shadow-2xl border border-indigo-800/40">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-indigo-200 text-xs font-semibold mb-4 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Görsel + Tekrar + Hikaye Metodolojisi</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Kelimeleri Unutmaya Son Ver.{" "}
              <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                LexiFlow
              </span>{" "}
              ile Kalıcı Öğren.
            </h1>

            <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
              SuperMemo 2 aralıklı tekrar algoritması, unutma eğrini takip ederek kelimeleri tam unutmak üzereyken karşına çıkarır.
            </p>

            {/* Quick Action Button */}
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onStartSession}
                className="py-3.5 px-8 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-bold text-base shadow-lg shadow-indigo-500/30 flex items-center gap-3 transition-all cursor-pointer"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>Hemen Başla (Günün Seansı)</span>
              </motion.button>

              <button
                type="button"
                onClick={onNavigateToWords}
                className="py-3.5 px-6 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm backdrop-blur-sm border border-white/10 transition-colors flex items-center gap-2"
              >
                <span>Kelime Havuzu</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Daily Goal Card */}
          <div className="w-full lg:w-72 bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-wider font-bold text-indigo-200">
                Günlük Hedef
              </span>
              <div className="flex items-center gap-1 text-amber-300 font-extrabold text-xs">
                <Flame className="w-4 h-4 fill-amber-300" />
                <span>{stats?.streak || 1} Günlük Seri</span>
              </div>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-black text-white">{reviewedToday}</span>
              <span className="text-sm text-slate-300 font-medium">/ {dailyGoal} Kelime</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2.5 rounded-full bg-white/20 overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <p className="text-xs text-slate-300">
              {progressPercent >= 100
                ? "🎉 Harika! Bugünkü hedefini tamamladın!"
                : `Bugünkü hedefini tamamlamak için ${Math.max(0, dailyGoal - reviewedToday)} kelime kaldı.`}
            </p>
          </div>
        </div>
      </div>

      {/* Info band: all words are taught */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-sm text-indigo-700 dark:text-indigo-300">
        <Sparkles className="w-4 h-4 shrink-0" />
        <p>Veritabanındaki tüm kelimeler (SHGM dahil) karışık sırada öğretilir.</p>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Due Today */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-500 mb-3">
            <Clock className="w-5 h-5" />
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
              Bugün
            </span>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats?.dueTodayCount ?? 0}
            </span>
            <p className="text-xs text-slate-400 font-medium mt-1">Bekleyen Tekrarlar</p>
          </div>
        </div>

        {/* Mastered Words */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-500 mb-3">
            <Award className="w-5 h-5" />
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              Kalıcı
            </span>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats?.masteredWords ?? 0}
            </span>
            <p className="text-xs text-slate-400 font-medium mt-1">Öğrenilen Kelimeler</p>
          </div>
        </div>

        {/* Learning in progress */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-500 mb-3">
            <Zap className="w-5 h-5" />
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
              Hafızada
            </span>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats?.learningWords ?? 0}
            </span>
            <p className="text-xs text-slate-400 font-medium mt-1">Tekrar Döngüsünde</p>
          </div>
        </div>

        {/* Accuracy Rate */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-purple-500 mb-3">
            <TrendingUp className="w-5 h-5" />
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
              Doğruluk
            </span>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              %{stats?.averageAccuracy ?? 85}
            </span>
            <p className="text-xs text-slate-400 font-medium mt-1">Ortalama Başarı Oranı</p>
          </div>
        </div>
      </div>

      {/* Methodology Explainer Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-100 via-white to-slate-100 dark:from-slate-900/90 dark:via-slate-900 dark:to-slate-900/90 border border-slate-200 dark:border-slate-800">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>LexiFlow Metodolojisi Nasıl Çalışır?</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Eye className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">1. Görsel Çıpa</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Her kelime için yapay zeka tarafından kelimenin özünü yansıtan görsel oluşturulur. Beyin görselleri metinden 60.000 kat daha hızlı işler.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">2. Mikro Hikaye</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Kelimeler izole ezberlenmez; 2 cümlelik canlı bir mikro senaryo ve doğal örnek cümle içinde hafızaya kazınır.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">3. SM-2 Aralıklı Tekrar</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              SuperMemo 2 algoritması cevabına göre sonraki tekrarı (1 gün, 6 gün, 21 gün, 2 ay) matematiksel olarak optimize eder.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


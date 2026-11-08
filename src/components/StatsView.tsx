"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  Award,
  Zap,
  Clock,
  Sparkles,
  PieChart as PieIcon,
} from "lucide-react";
import { DailyActivity } from "@/types";
import { getWeeklyActivity, getOverallStats, OverallStats, db } from "@/lib/db";

export const StatsView: React.FC = () => {
  const [weeklyData, setWeeklyData] = useState<DailyActivity[]>([]);
  const [stats, setStats] = useState<OverallStats | null>(null);
  const [levelCounts, setLevelCounts] = useState<{ A1: number; "A2-B1": number; "B2-C1": number }>({
    A1: 0,
    "A2-B1": 0,
    "B2-C1": 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function loadData() {
      const weekly = await getWeeklyActivity();
      setWeeklyData(weekly);

      const overall = await getOverallStats();
      setStats(overall);

      const words = await db.words.toArray();
      const counts = {
        A1: words.filter((w) => w.level === "A1").length,
        "A2-B1": words.filter((w) => w.level === "A2-B1").length,
        "B2-C1": words.filter((w) => w.level === "B2-C1").length,
      };
      setLevelCounts(counts);
    }

    loadData();
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  // Distribution Data for Pie Chart
  const statusData = [
    { name: "Kalıcı (Mastered)", value: stats?.masteredWords || 0, color: "#10b981" },
    { name: "Öğreniliyor (Learning)", value: stats?.learningWords || 0, color: "#6366f1" },
    { name: "Yeni (New)", value: stats?.newWords || 0, color: "#94a3b8" },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
          <BarChart3 className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          <span>Öğrenme ve Hafıza İstatistikleri</span>
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          SuperMemo 2 aralıklı tekrar algoritması verilerine dayalı haftalık aktivite ve kalıcılık analizi.
        </p>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {stats?.totalReviewsLogged ?? 0}
            </span>
            <p className="text-xs text-slate-400 font-medium">Toplam Tekrar Seansı</p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              %{stats?.averageAccuracy ?? 85}
            </span>
            <p className="text-xs text-slate-400 font-medium">Ortalama Hatırlama Oranı</p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {stats?.streak ?? 1} Gün
            </span>
            <p className="text-xs text-slate-400 font-medium">Kesintisiz Çalışma Serisi</p>
          </div>
        </div>
      </div>

      {/* Main Weekly Activity Bar Chart */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Haftalık Tekrar & Öğrenme Hacmi
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Son 7 günde gözden geçirilen kelime sayıları</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="dayLabel" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "1rem",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="reviewedCount" name="Tekrar Edilen" fill="#6366f1" radius={[6, 6, 0, 0]} />
              <Bar dataKey="learnedCount" name="Başarılı (İyi/Kolay)" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Secondary Row: Retention Curve + Level Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Retention Trend */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
            Hafıza Tutma Eğrisi (Retention %)
          </h3>
          <p className="text-xs text-slate-400 mb-6">Başarılı hatırlanan kelimelerin yüzdesi</p>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="dayLabel" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "1rem",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="retentionRate"
                  name="Başarı Oranı"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#8b5cf6" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Kelime Durum Dağılımı
            </h3>
            <p className="text-xs text-slate-400 mb-4">Hafızadaki kalıcılık seviyelerine göre havuz</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "1rem",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Level Breakdown Cards */}
      <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Seviyelere Göre Kelime Dağılımı
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">A1 Seviyesi</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {levelCounts.A1} Kelime
            </div>
            <p className="text-xs text-slate-400 mt-1">Temel başlangıç dağarcığı</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400">A2-B1 Seviyesi</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {levelCounts["A2-B1"]} Kelime
            </div>
            <p className="text-xs text-slate-400 mt-1">Orta seviye & akıcı diyalog</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">B2-C1 Seviyesi</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {levelCounts["B2-C1"]} Kelime
            </div>
            <p className="text-xs text-slate-400 mt-1">İleri düzey & akademik nüans</p>
          </div>
        </div>
      </div>
    </div>
  );
};


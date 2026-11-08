"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Sparkles,
  Trophy,
  Volume2,
  RefreshCw,
  Zap,
} from "lucide-react";
import { DifficultyLevel, Rating, Word } from "@/types";
import { calculateNextReview, formatInterval, RATING_LABELS } from "@/lib/sm2";
import { getDueWords, getNewWords, recordReview } from "@/lib/db";
import { Flashcard } from "./Flashcard";

interface StudySessionProps {
  level: DifficultyLevel | "all";
  onFinish: () => void;
  voiceAccent?: "en-US" | "en-GB";
}

export const StudySession: React.FC<StudySessionProps> = ({
  level,
  onFinish,
  voiceAccent = "en-US",
}) => {
  const [queue, setQueue] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [stats, setStats] = useState({
    totalStudied: 0,
    againCount: 0,
    hardCount: 0,
    goodCount: 0,
    easyCount: 0,
  });

  // Load words to study
  useEffect(() => {
    async function loadSessionWords() {
      setLoading(true);
      // First get due words
      let words = await getDueWords(level);

      // If few due words, add unlearned new words up to 10
      if (words.length < 10) {
        const needed = 10 - words.length;
        const newWords = await getNewWords(needed, level);
        // Exclude words already in due list
        const existingIds = new Set(words.map((w) => w.id));
        const additional = newWords.filter((w) => !existingIds.has(w.id));
        words = [...words, ...additional];
      }

      setQueue(words);
      setLoading(false);
    }

    loadSessionWords();
  }, [level]);

  const currentWord = queue[currentIndex];

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleRate = useCallback(
    async (rating: Rating) => {
      if (!currentWord || !currentWord.id) return;

      // 1. Calculate new SM-2 intervals
      const result = calculateNextReview(
        rating,
        currentWord.interval,
        currentWord.easinessFactor,
        currentWord.repetition
      );

      // 2. Persist to IndexedDB
      await recordReview(currentWord.id, rating, result);

      // 3. Update session statistics
      setStats((prev) => ({
        ...prev,
        totalStudied: prev.totalStudied + 1,
        againCount: prev.againCount + (rating === 1 ? 1 : 0),
        hardCount: prev.hardCount + (rating === 2 ? 1 : 0),
        goodCount: prev.goodCount + (rating === 3 ? 1 : 0),
        easyCount: prev.easyCount + (rating === 4 ? 1 : 0),
      }));

      // 4. In-session queue logic: If 'Tekrar' (1) or 'Zor' (2), re-queue word at end
      if (rating === 1 || rating === 2) {
        setQueue((prevQueue) => [...prevQueue, { ...currentWord, ...result }]);
      }

      // 5. Advance to next card
      if (currentIndex + 1 < queue.length) {
        setIsFlipped(false);
        setCurrentIndex((prev) => prev + 1);
      } else {
        // Session Finished!
        setSessionCompleted(true);
        triggerCelebration();
      }
    },
    [currentWord, currentIndex, queue.length]
  );

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Space to flip
      if (e.code === "Space") {
        e.preventDefault();
        handleFlip();
      }

      // If flipped, 1-4 for ratings
      if (isFlipped) {
        if (e.key === "1") handleRate(1);
        if (e.key === "2") handleRate(2);
        if (e.key === "3") handleRate(3);
        if (e.key === "4") handleRate(4);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleFlip, handleRate, isFlipped]);

  if (loading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center p-8">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Kelimeler ve aralıklı tekrar kuyruğu yükleniyor...
        </p>
      </div>
    );
  }

  if (queue.length === 0) {
    return (
      <div className="w-full max-w-lg mx-auto p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-xl">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Bugünlük Bütün Tekrarlar Tamam!
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
          Harika gidiyorsun. Bu seviyedeki tüm kelimelerin zamanı henüz gelmedi.
          İstersen diğer seviyelere göz atabilir veya yeni kelimeler ekleyebilirsin.
        </p>
        <button
          onClick={onFinish}
          className="w-full py-3 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all shadow-lg shadow-indigo-600/30"
        >
          Ana Ekrana Dön
        </button>
      </div>
    );
  }

  // Session Completed Summary
  if (sessionCompleted) {
    const successRate =
      stats.totalStudied > 0
        ? Math.round(
            ((stats.goodCount + stats.easyCount) / stats.totalStudied) * 100
          )
        : 100;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg mx-auto p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-center"
      >
        <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center ring-8 ring-amber-500/5">
          <Trophy className="w-10 h-10" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-2">
          Seans Tamamlandı! 🎉
        </span>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
          Tebrikler!
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
          Aralıklı tekrar algoritması sonraki tekrar günlerini başarıyla planladı.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Çalışılan Kelime</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.totalStudied}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Başarı Oranı</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              %{successRate}
            </span>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl mb-6">
          <span>Tekrar: {stats.againCount}</span>
          <span>•</span>
          <span>Zor: {stats.hardCount}</span>
          <span>•</span>
          <span>İyi: {stats.goodCount}</span>
          <span>•</span>
          <span>Kolay: {stats.easyCount}</span>
        </div>

        <button
          onClick={onFinish}
          className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all shadow-lg shadow-indigo-600/30 active:scale-98"
        >
          Panele Geri Dön
        </button>
      </motion.div>
    );
  }

  // Active Flashcard Session
  const progressPercent = Math.min(
    100,
    Math.round(((currentIndex + 1) / queue.length) * 100)
  );

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
      {/* Session Header & Progress */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onFinish}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Çıkış</span>
        </button>

        {/* Progress Bar */}
        <div className="flex-1 max-w-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-1.5">
            <span>İlerleme</span>
            <span>
              {currentIndex + 1} / {queue.length}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-900">
          <Zap className="w-3.5 h-3.5" />
          <span>{level === "all" ? "Tümü" : level}</span>
        </div>
      </div>

      {/* Main Flashcard Component */}
      <Flashcard
        word={currentWord}
        isFlipped={isFlipped}
        onFlip={handleFlip}
        voiceAccent={voiceAccent}
      />

      {/* Action / Evaluation Area */}
      <div className="w-full max-w-xl mx-auto">
        {!isFlipped ? (
          <button
            type="button"
            onClick={handleFlip}
            className="w-full py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm tracking-wide shadow-lg hover:shadow-xl hover:opacity-95 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Kartı Çevir & Cevabı Gör (Boşluk)</span>
          </button>
        ) : (
          /* 4-button SM-2 grading */
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {([1, 2, 3, 4] as Rating[]).map((rating) => {
              const info = RATING_LABELS[rating];
              return (
                <button
                  key={rating}
                  type="button"
                  onClick={() => handleRate(rating)}
                  className={`relative p-3 rounded-2xl bg-gradient-to-br ${info.color} shadow-md hover:shadow-lg transition-all active:scale-95 flex flex-col items-center justify-center text-center`}
                >
                  <span className="text-xs font-mono font-bold opacity-75 mb-0.5">
                    [{rating}]
                  </span>
                  <span className="text-sm font-extrabold">{info.label}</span>
                  <span className="text-[10px] opacity-85 mt-0.5 line-clamp-1">
                    {info.description}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Shortcuts indicator */}
        <div className="mt-3 text-center text-[11px] text-slate-400 dark:text-slate-500">
          İpucu: Klavyede <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700 font-mono">Boşluk</kbd> ile kartı çevirebilir, <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700 font-mono">1-4</kbd> tuşlarıyla değerlendirebilirsin.
        </div>
      </div>
    </div>
  );
};


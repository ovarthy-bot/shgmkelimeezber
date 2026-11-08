"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  ArrowLeft,
  CheckCircle,
  Trophy,
  RefreshCw,
  Zap,
  HelpCircle,
  Layers,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Rating, Word } from "@/types";
import { calculateNextReview, RATING_LABELS } from "@/lib/sm2";
import { getDueWords, getNewWords, recordReview, db } from "@/lib/db";
import { soundEffects } from "@/lib/soundEffects";
import { Flashcard } from "./Flashcard";

interface StudySessionProps {
  onFinish: () => void;
  voiceAccent?: "en-US" | "en-GB";
}

type StudyMode = "flashcard" | "quiz";

export const StudySession: React.FC<StudySessionProps> = ({
  onFinish,
  voiceAccent = "en-US",
}) => {
  const [queue, setQueue] = useState<Word[]>([]);
  const [allWordsPool, setAllWordsPool] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [studyMode, setStudyMode] = useState<StudyMode>("flashcard");
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [autoPronounce, setAutoPronounce] = useState(true);
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
      const allWords = await db.words.toArray();
      setAllWordsPool(allWords);

      let words = await getDueWords();

      // If few due words, add unlearned new words up to 10
      if (words.length < 10) {
        const needed = 10 - words.length;
        const newWords = await getNewWords(needed);
        const existingIds = new Set(words.map((w) => w.id));
        const additional = newWords.filter((w) => !existingIds.has(w.id));
        words = [...words, ...additional];
      }

      setQueue(words);
      setLoading(false);
    }

    loadSessionWords();
  }, []);

  const currentWord = queue[currentIndex];

  const handleFlip = useCallback(() => {
    soundEffects.playFlip();
    setIsFlipped((prev) => !prev);
  }, []);

  const handleRate = useCallback(
    async (rating: Rating) => {
      if (!currentWord || !currentWord.id) return;

      if (rating === 1) {
        soundEffects.playAgain();
      } else {
        soundEffects.playSuccess();
      }

      const result = calculateNextReview(
        rating,
        currentWord.interval,
        currentWord.easinessFactor,
        currentWord.repetition
      );

      await recordReview(currentWord.id, rating, result);

      setStats((prev) => ({
        ...prev,
        totalStudied: prev.totalStudied + 1,
        againCount: prev.againCount + (rating === 1 ? 1 : 0),
        hardCount: prev.hardCount + (rating === 2 ? 1 : 0),
        goodCount: prev.goodCount + (rating === 3 ? 1 : 0),
        easyCount: prev.easyCount + (rating === 4 ? 1 : 0),
      }));

      // In-session queue logic: If 'Tekrar' (1) or 'Zor' (2), re-queue word at end
      if (rating === 1 || rating === 2) {
        setQueue((prevQueue) => [...prevQueue, { ...currentWord, ...result }]);
      }

      // Reset quiz state
      setSelectedQuizOption(null);
      setQuizAnswered(false);

      if (currentIndex + 1 < queue.length) {
        setIsFlipped(false);
        setCurrentIndex((prev) => prev + 1);
      } else {
        setSessionCompleted(true);
        triggerCelebration();
      }
    },
    [currentWord, currentIndex, queue.length]
  );

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  };

  // Multiple choice quiz options generator
  const quizOptions = useMemo(() => {
    if (!currentWord) return [];
    const correct = currentWord.turkish;
    const others = allWordsPool
      .filter((w) => w.id !== currentWord.id && w.turkish !== correct)
      .map((w) => w.turkish);

    // Shuffle and pick 3 wrong options
    const shuffledOthers = [...others].sort(() => 0.5 - Math.random()).slice(0, 3);
    const combined = [correct, ...shuffledOthers].sort(() => 0.5 - Math.random());
    return combined;
  }, [currentWord, allWordsPool]);

  const handleSelectQuizOption = (option: string) => {
    if (quizAnswered) return;
    setSelectedQuizOption(option);
    setQuizAnswered(true);

    const isCorrect = option === currentWord.turkish;
    if (isCorrect) {
      soundEffects.playSuccess();
    } else {
      soundEffects.playAgain();
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && studyMode === "flashcard") {
        e.preventDefault();
        handleFlip();
      }

      if (isFlipped && studyMode === "flashcard") {
        if (e.key === "1") handleRate(1);
        if (e.key === "2") handleRate(2);
        if (e.key === "3") handleRate(3);
        if (e.key === "4") handleRate(4);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleFlip, handleRate, isFlipped, studyMode]);

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
        </p>
        <button
          onClick={onFinish}
          className="w-full py-3 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
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
          SM-2 aralıklı tekrar algoritması sonraki tekrar tarihlerini başarıyla hesapladı.
        </p>

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

        <button
          onClick={onFinish}
          className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
        >
          Panele Geri Dön
        </button>
      </motion.div>
    );
  }

  const progressPercent = Math.min(
    100,
    Math.round(((currentIndex + 1) / queue.length) * 100)
  );

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
      {/* Session Top Bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onFinish}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
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

        {/* Mode Selector and Sound Toggle */}
        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setStudyMode("flashcard")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                studyMode === "flashcard"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-white shadow-sm"
                  : "text-slate-500"
              }`}
            >
              Kart
            </button>
            <button
              onClick={() => setStudyMode("quiz")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                studyMode === "quiz"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-white shadow-sm"
                  : "text-slate-500"
              }`}
            >
              Test
            </button>
          </div>

          <button
            onClick={() => setAutoPronounce(!autoPronounce)}
            className={`p-2 rounded-xl border transition-colors ${
              autoPronounce
                ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900"
                : "text-slate-400 border-slate-200 dark:border-slate-800"
            }`}
            title={autoPronounce ? "Otomatik Ses Açık" : "Otomatik Ses Kapalı"}
          >
            {autoPronounce ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Study View (Flashcard or Quiz) */}
      {studyMode === "flashcard" ? (
        <>
          <Flashcard
            word={currentWord}
            isFlipped={isFlipped}
            onFlip={handleFlip}
            voiceAccent={voiceAccent}
            autoPronounce={autoPronounce}
          />

          <div className="w-full max-w-xl mx-auto">
            {!isFlipped ? (
              <button
                type="button"
                onClick={handleFlip}
                className="w-full py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm tracking-wide shadow-lg hover:shadow-xl hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Kartı Çevir & Cevabı Gör (Boşluk)</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {([1, 2, 3, 4] as Rating[]).map((rating) => {
                  const info = RATING_LABELS[rating];
                  return (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => handleRate(rating)}
                      className={`relative p-3 rounded-2xl bg-gradient-to-br ${info.color} shadow-md hover:shadow-lg transition-all active:scale-95 flex flex-col items-center justify-center text-center cursor-pointer`}
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

            <div className="mt-3 text-center text-[11px] text-slate-400 dark:text-slate-500">
              İpucu: Klavyede <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700 font-mono">Boşluk</kbd> ile çevir, <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700 font-mono">1-4</kbd> tuşlarıyla değerlendir.
            </div>
          </div>
        </>
      ) : (
        /* Quiz Mode View */
        <div className="w-full max-w-xl mx-auto flex flex-col gap-6">
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 block mb-2">
              Çoktan Seçmeli Anlam Testi
            </span>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2">
              {currentWord.english}
            </h2>
            <span className="text-sm font-mono text-indigo-600 dark:text-indigo-400">
              {currentWord.phonetic}
            </span>
            <p className="mt-3 text-xs sm:text-sm text-slate-400 italic">
              &ldquo;{currentWord.exampleEn}&rdquo;
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quizOptions.map((option, idx) => {
              const isSelected = selectedQuizOption === option;
              const isCorrect = option === currentWord.turkish;

              let btnStyle = "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-indigo-400";
              if (quizAnswered) {
                if (isCorrect) {
                  btnStyle = "bg-emerald-500 text-white border-emerald-500 font-bold shadow-lg shadow-emerald-500/30";
                } else if (isSelected && !isCorrect) {
                  btnStyle = "bg-rose-500 text-white border-rose-500 font-bold shadow-lg shadow-rose-500/30";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectQuizOption(option)}
                  disabled={quizAnswered}
                  className={`p-4 rounded-2xl border text-sm font-semibold transition-all text-left flex items-center justify-between cursor-pointer ${btnStyle}`}
                >
                  <span>{option}</span>
                  {quizAnswered && isCorrect && <CheckCircle className="w-4 h-4 text-white" />}
                </button>
              );
            })}
          </div>

          {quizAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700"
            >
              <div className="text-xs">
                <span className="font-bold text-slate-900 dark:text-white block">
                  {selectedQuizOption === currentWord.turkish ? "🎉 Doğru Cevap!" : "❌ Yanlış Cevap"}
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  {currentWord.english} = {currentWord.turkish}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {selectedQuizOption === currentWord.turkish ? (
                  <button
                    onClick={() => handleRate(3)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer"
                  >
                    Devam Et (İyi)
                  </button>
                ) : (
                  <button
                    onClick={() => handleRate(1)}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer"
                  >
                    Tekrar Et (Sıfırla)
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

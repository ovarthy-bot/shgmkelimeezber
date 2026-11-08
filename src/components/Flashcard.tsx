"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Volume2,
  Sparkles,
  RotateCcw,
  BookOpen,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Lightbulb,
  MessageSquareQuote,
  Flame,
} from "lucide-react";
import { Word } from "@/types";
import { speakEnglishWord } from "@/lib/speech";
import { getWordImageUrl } from "@/lib/utils";
import { soundEffects } from "@/lib/soundEffects";

interface FlashcardProps {
  word: Word;
  isFlipped: boolean;
  onFlip: () => void;
  voiceAccent?: "en-US" | "en-GB";
  showImageByDefault?: boolean;
  autoPronounce?: boolean;
}

export const Flashcard: React.FC<FlashcardProps> = ({
  word,
  isFlipped,
  onFlip,
  voiceAccent = "en-US",
  showImageByDefault = true,
  autoPronounce = false,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isPlayingSentence, setIsPlayingSentence] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showImage, setShowImage] = useState(showImageByDefault);

  const imageUrl = word.imageUrl || getWordImageUrl(word.english, word.imagePrompt);
  const pronTr = word.pronunciationTr || word.phonetic?.replace(/\//g, "") || "";
  const hook = word.mnemonicHook || word.english.toUpperCase();
  const scene = word.mnemonicScene || word.storyTr || "";

  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);

    if (autoPronounce && !isFlipped) {
      speakEnglishWord(word.english, voiceAccent);
    }
  }, [word.english, autoPronounce, isFlipped, voiceAccent]);

  const handlePlayAudio = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsPlayingAudio(true);
    await speakEnglishWord(word.english, voiceAccent);
    setTimeout(() => setIsPlayingAudio(false), 200);
  };

  const handlePlaySentence = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsPlayingSentence(true);
    await speakEnglishWord(word.exampleEn, voiceAccent, 0.95);
    setTimeout(() => setIsPlayingSentence(false), 200);
  };

  const handleCardClick = () => {
    soundEffects.playFlip();
    onFlip();
  };

  return (
    <div className="w-full max-w-xl mx-auto perspective-1000 select-none">
      <motion.div
        className="relative w-full min-h-[480px] cursor-pointer preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        onClick={handleCardClick}
      >
        {/* ==================== ÖN YÜZ ==================== */}
        <div
          className={`absolute inset-0 w-full h-full rounded-3xl p-6 sm:p-8 flex flex-col justify-between
            bg-white dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 shadow-xl dark:shadow-2xl shadow-indigo-500/5
            backdrop-blur-xl backface-hidden ${isFlipped ? "pointer-events-none" : ""}`}
        >
          {/* Üst Başlık & Kontroller */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900">
                ✈️ SHGM Kelimesi
              </span>
              {hook && (
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                  İpucu: &quot;{hook}&quot;
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowImage(!showImage);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={showImage ? "Görseli Gizle" : "Görseli Göster"}
              >
                {showImage ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <div className="flex items-center gap-1 text-xs font-medium text-slate-400 dark:text-slate-500">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Ön Yüz</span>
              </div>
            </div>
          </div>

          {/* Görsel Alanı */}
          {showImage && (
            <div className="my-2.5 relative w-full h-44 sm:h-48 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mb-2">
                    <ImageIcon className="w-5 h-5 text-slate-400" />
                  </div>
                  <span className="text-xs text-slate-400 font-medium">Yapay zeka görseli yükleniyor...</span>
                </div>
              )}

              {!imageError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt={word.english}
                  className={`w-full h-full object-cover transition-opacity duration-500 ${
                    imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
                  }`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => {
                    setImageError(true);
                    setImageLoaded(true);
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-pink-500/20 flex flex-col items-center justify-center p-4 text-center">
                  <span className="text-4xl font-extrabold text-indigo-500/70 mb-1">
                    {word.english.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 max-w-xs line-clamp-1 italic">
                    &ldquo;{word.english}&rdquo;
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Kelime & Türkçe Okunuşu */}
          <div className="flex-1 flex flex-col items-center justify-center py-2 text-center">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                {word.english}
              </h2>

              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={handlePlayAudio}
                className={`p-2.5 rounded-full border transition-all ${
                  isPlayingAudio
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/30 scale-105"
                    : "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60"
                }`}
                title="Telaffuzu Dinle"
              >
                <Volume2 className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Türkçe Okunuş Vurgusu (niidır, avın vb.) */}
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold">
              <span className="text-slate-400 text-xs">Okunuş:</span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">({pronTr})</span>
            </div>

            {/* Benzetme Anahtarı Balonu */}
            {hook && (
              <p className="mt-3 text-xs sm:text-sm font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3.5 py-1.5 rounded-2xl border border-amber-500/20">
                🎯 Çağrışım Benzetmesi: <strong className="underline underline-offset-2">&quot;{hook}&quot;</strong>
              </p>
            )}
          </div>

          {/* Kart Çevir İpucu */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center text-xs text-slate-400 dark:text-slate-500 gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Türkçe benzetme senaryosunu görmek için tıkla veya [Boşluk]</span>
          </div>
        </div>

        {/* ==================== ARKA YÜZ (YOG METODU) ==================== */}
        <div
          className={`absolute inset-0 w-full h-full rounded-3xl p-6 sm:p-8 flex flex-col justify-between
            bg-white dark:bg-slate-900/95 border border-indigo-200/60 dark:border-indigo-900/60 shadow-xl dark:shadow-2xl shadow-indigo-500/10
            backdrop-blur-xl rotate-y-180 backface-hidden ${!isFlipped ? "pointer-events-none" : ""}`}
        >
          {/* Başlık Satırı */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-slate-900 dark:text-white">
                {word.english}
              </span>
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                ({pronTr})
              </span>
            </div>

            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={handlePlayAudio}
              className="p-1.5 rounded-full text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
              title="Kelimeyi Dinle"
            >
              <Volume2 className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Türkçe Anlamı */}
          <div className="my-1.5">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">
              Türkçe Anlamı
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
              {word.turkish}
            </h3>
          </div>

          {/* 🎯 KELİME BENZETME & ÇAĞRIŞIM SENARYOSU (YoG Metodu) */}
          <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border-2 border-amber-500/30 text-xs sm:text-sm">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-700 dark:text-amber-400">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>KELİME BENZETME & HAFIZA ÇIPASI</span>
              </div>
              {hook && (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-black bg-amber-500/20 text-amber-800 dark:text-amber-300">
                  {hook}
                </span>
              )}
            </div>

            <p className="text-slate-800 dark:text-slate-100 font-medium leading-relaxed">
              {renderFormattedScene(scene)}
            </p>
          </div>

          {/* Örnek Havacılık Cümlesi */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center justify-between font-semibold text-slate-600 dark:text-slate-400 mb-1">
              <div className="flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-indigo-500" />
                <span>Örnek Cümle</span>
              </div>
              <button
                type="button"
                onClick={handlePlaySentence}
                className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <Volume2 className="w-3 h-3" />
                <span>Seslendir</span>
              </button>
            </div>
            <p className="text-slate-800 dark:text-slate-200 font-medium line-clamp-1">
              {word.exampleEn}
            </p>
            <p className="text-slate-400 italic mt-0.5 line-clamp-1">
              {word.exampleTr}
            </p>
          </div>

          {/* Alt Bilgi */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span>Tekrar: {word.timesReviewed || 0}</span>
              <span>•</span>
              <span>Aralık: {word.interval || 0} gün</span>
            </div>
            <span className="font-semibold text-indigo-500">Aşağıdan değerlendir 👇</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

/**
 * Highlights quotes in the mnemonic scene for punchy readability
 */
function renderFormattedScene(text: string) {
  if (!text) return null;
  const parts = text.split(/("[^"]*")/g);

  return parts.map((part, i) => {
    if (part.startsWith('"') && part.endsWith('"')) {
      return (
        <span
          key={i}
          className="font-black text-amber-700 dark:text-amber-300 underline decoration-amber-400 decoration-2"
        >
          {part}
        </span>
      );
    }
    return part;
  });
}

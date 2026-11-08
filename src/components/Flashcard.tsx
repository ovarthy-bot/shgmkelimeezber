"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Volume2,
  Sparkles,
  RotateCcw,
  BookOpen,
  Image as ImageIcon,
  CheckCircle2,
  HelpCircle,
  Eye,
  EyeOff,
  Lightbulb,
} from "lucide-react";
import { Word } from "@/types";
import { speakEnglishWord } from "@/lib/speech";
import { getWordImageUrl } from "@/lib/utils";

interface FlashcardProps {
  word: Word;
  isFlipped: boolean;
  onFlip: () => void;
  voiceAccent?: "en-US" | "en-GB";
  showImageByDefault?: boolean;
}

export const Flashcard: React.FC<FlashcardProps> = ({
  word,
  isFlipped,
  onFlip,
  voiceAccent = "en-US",
  showImageByDefault = true,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showImage, setShowImage] = useState(showImageByDefault);

  const imageUrl = word.imageUrl || getWordImageUrl(word.english, word.imagePrompt);

  useEffect(() => {
    // Reset image state when word changes
    setImageLoaded(false);
    setImageError(false);
  }, [word.english]);

  const handlePlayAudio = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsPlayingAudio(true);
    await speakEnglishWord(word.english, voiceAccent);
    setTimeout(() => setIsPlayingAudio(false), 300);
  };

  const getPartOfSpeechLabel = (pos: string) => {
    switch (pos) {
      case "noun":
        return { label: "İsim", short: "n.", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900" };
      case "verb":
        return { label: "Fiil", short: "v.", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900" };
      case "adjective":
        return { label: "Sıfat", short: "adj.", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900" };
      case "adverb":
        return { label: "Zarf", short: "adv.", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900" };
      default:
        return { label: pos, short: pos, color: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800" };
    }
  };

  const posBadge = getPartOfSpeechLabel(word.partOfSpeech);

  const getLevelBadgeColor = (lvl: string) => {
    switch (lvl) {
      case "A1":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      case "A2-B1":
        return "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800";
      case "B2-C1":
        return "bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border-violet-200 dark:border-violet-800";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto perspective-1000 select-none">
      <motion.div
        className="relative w-full min-h-[460px] cursor-pointer preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        onClick={onFlip}
      >
        {/* ==================== FRONT OF CARD ==================== */}
        <div
          className={`absolute inset-0 w-full h-full rounded-3xl p-6 sm:p-8 flex flex-col justify-between
            bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xl dark:shadow-2xl shadow-indigo-500/5
            backdrop-blur-xl backface-hidden ${isFlipped ? "pointer-events-none" : ""}`}
        >
          {/* Card Header */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${posBadge.color}`}>
                {posBadge.short} {posBadge.label}
              </span>
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getLevelBadgeColor(word.level)}`}>
                {word.level}
              </span>
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

          {/* Visual Container */}
          {showImage && (
            <div className="my-3 relative w-full h-44 sm:h-48 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              {/* Skeleton placeholder while image loads */}
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mb-2">
                    <ImageIcon className="w-5 h-5 text-slate-400" />
                  </div>
                  <span className="text-xs text-slate-400 font-medium">Yapay zeka görseli yükleniyor...</span>
                </div>
              )}

              {/* Generative AI Image */}
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
                /* Fallback Graphic Placeholder */
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

          {/* Word Center */}
          <div className="flex-1 flex flex-col items-center justify-center py-2 text-center">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
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

            {/* Phonetic transcription */}
            <span className="mt-2 text-sm sm:text-base font-mono text-indigo-600 dark:text-indigo-400 font-medium tracking-wide">
              {word.phonetic}
            </span>

            {/* Quick Context hint */}
            <p className="mt-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400 italic max-w-md line-clamp-2">
              &ldquo;{word.exampleEn}&rdquo;
            </p>
          </div>

          {/* Card Footer Hint */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center text-xs text-slate-400 dark:text-slate-500 gap-1.5">
            <RotateCcw className="w-3.5 h-3.5 animate-spin-slow" />
            <span>Anlamını ve hikayeyi görmek için tıkla veya [Boşluk]</span>
          </div>
        </div>

        {/* ==================== BACK OF CARD ==================== */}
        <div
          className={`absolute inset-0 w-full h-full rounded-3xl p-6 sm:p-8 flex flex-col justify-between
            bg-white dark:bg-slate-900/95 border border-indigo-200/60 dark:border-indigo-900/60 shadow-xl dark:shadow-2xl shadow-indigo-500/10
            backdrop-blur-xl rotate-y-180 backface-hidden ${!isFlipped ? "pointer-events-none" : ""}`}
        >
          {/* Back Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                {word.english}
              </span>
              <span className="text-xs font-mono text-slate-400">
                {word.phonetic}
              </span>
            </div>

            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={handlePlayAudio}
              className="p-1.5 rounded-full text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
            >
              <Volume2 className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Main Meaning */}
          <div className="my-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500">
              Türkçe Anlamı
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
              {word.turkish}
            </h3>
          </div>

          {/* Example Sentence with highlighted word */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-sm">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
              <span>Örnek Cümle</span>
            </div>
            <p className="text-slate-800 dark:text-slate-200 font-medium">
              {renderSentenceWithHighlight(word.exampleEn, word.english)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">
              {word.exampleTr}
            </p>
          </div>

          {/* Micro-story / Context */}
          <div className="p-3.5 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-900/40 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Hafıza & Mikro Hikaye</span>
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {word.storyEn}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">
              {word.storyTr}
            </p>
          </div>

          {/* Synonyms tags */}
          {word.synonyms && word.synonyms.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-xs text-slate-400 font-medium">Eş Anlamlılar:</span>
              {word.synonyms.map((syn, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  {syn}
                </span>
              ))}
            </div>
          )}

          {/* Card Footer Hint */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span>Tekrar: {word.timesReviewed || 0}</span>
              <span>•</span>
              <span>Aralık: {word.interval || 0} gün</span>
            </div>
            <span className="italic">Aşağıdan durumunu değerlendir 👇</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

/**
 * Highlights the target word in an example sentence
 */
function renderSentenceWithHighlight(sentence: string, targetWord: string) {
  const regex = new RegExp(`(${escapeRegExp(targetWord)})`, "gi");
  const parts = sentence.split(regex);

  return parts.map((part, index) => {
    if (part.toLowerCase() === targetWord.toLowerCase()) {
      return (
        <span
          key={index}
          className="text-indigo-600 dark:text-indigo-400 font-bold underline decoration-indigo-400/50 underline-offset-2"
        >
          {part}
        </span>
      );
    }
    return part;
  });
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}


import { Rating, SM2Result, WordStatus } from "@/types";

/**
 * SuperMemo 2 (SM-2) Spaced Repetition Algorithm
 * 
 * Maps user rating (1-4) to SM-2 quality (1-5):
 * 1: Tekrar (Again/Fail) -> Quality 1
 * 2: Zor (Hard)          -> Quality 3
 * 3: İyi (Good)          -> Quality 4
 * 4: Kolay (Easy)        -> Quality 5
 */

export const RATING_LABELS: Record<Rating, { label: string; description: string; color: string; badge: string }> = {
  1: {
    label: "Tekrar",
    description: "Hatırlayamadım (< 1 gün)",
    color: "from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white",
    badge: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900",
  },
  2: {
    label: "Zor",
    description: "Zorlanarak hatırladım (1-2 gün)",
    color: "from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white",
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900",
  },
  3: {
    label: "İyi",
    description: "Doğru hatırladım (Standart)",
    color: "from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white",
    badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900",
  },
  4: {
    label: "Kolay",
    description: "Çok rahat bildim (Hızlı ilerleme)",
    color: "from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white",
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900",
  },
};

const RATING_TO_QUALITY: Record<Rating, number> = {
  1: 1, // Again
  2: 3, // Hard
  3: 4, // Good
  4: 5, // Easy
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Calculates next review interval, repetition count, and easiness factor.
 * Pure function with no side effects.
 */
export function calculateNextReview(
  rating: Rating,
  currentInterval: number = 0,
  currentEF: number = 2.5,
  currentRepetitions: number = 0,
  nowTimestamp: number = Date.now()
): SM2Result {
  const quality = RATING_TO_QUALITY[rating];

  // 1. Calculate new Easiness Factor (EF)
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const deltaEF = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
  let newEF = currentEF + deltaEF;
  // SM-2 minimum easiness factor is 1.3
  if (newEF < 1.3) {
    newEF = 1.3;
  }
  // Round to 2 decimal places
  newEF = Math.round(newEF * 100) / 100;

  let newInterval: number;
  let newRepetitions: number;

  // 2. Failure: rating < 3 (Tekrar / Again)
  if (quality < 3) {
    newRepetitions = 0;
    newInterval = 1; // repeat tomorrow (or end of session)
  } else {
    // 3. Success: rating >= 3 (Hard, Good, Easy)
    newRepetitions = currentRepetitions + 1;

    if (newRepetitions === 1) {
      newInterval = rating === 4 ? 2 : 1;
    } else if (newRepetitions === 2) {
      if (rating === 2) {
        newInterval = 3;
      } else if (rating === 4) {
        newInterval = 7;
      } else {
        newInterval = 6;
      }
    } else {
      // repetition > 2
      if (rating === 2) {
        // Hard: conservative interval growth (1.2x)
        newInterval = Math.max(currentInterval + 1, Math.round(currentInterval * 1.2));
      } else if (rating === 4) {
        // Easy: aggressive interval growth (EF * 1.3x)
        newInterval = Math.round(currentInterval * newEF * 1.3);
      } else {
        // Good: standard SM-2 interval = currentInterval * EF
        newInterval = Math.round(currentInterval * newEF);
      }
    }
  }

  // Safety bounds
  if (newInterval < 1) newInterval = 1;

  const nextReviewDate = nowTimestamp + newInterval * MS_PER_DAY;

  // Determine status
  let status: WordStatus = "learning";
  if (newInterval >= 21) {
    status = "mastered";
  } else if (newRepetitions === 0 && currentRepetitions === 0 && currentInterval === 0) {
    status = "new";
  }

  return {
    interval: newInterval,
    repetition: newRepetitions,
    easinessFactor: newEF,
    nextReviewDate,
    status,
  };
}

/**
 * Helper to format intervals into human friendly Turkish strings
 */
export function formatInterval(intervalDays: number): string {
  if (intervalDays <= 1) return "1 gün";
  if (intervalDays < 7) return `${intervalDays} gün`;
  if (intervalDays < 30) {
    const weeks = Math.round(intervalDays / 7);
    return `${weeks} hafta`;
  }
  const months = Math.round(intervalDays / 30);
  return `${months} ay`;
}

/**
 * Check if a word is due for review today
 */
export function isDueForReview(nextReviewDate: number, now: number = Date.now()): boolean {
  // Considered due if the nextReviewDate is in the past or within current calendar day
  const endOfToday = new Date(now).setHours(23, 59, 59, 999);
  return nextReviewDate <= endOfToday;
}


import Dexie, { Table } from "dexie";
import { DailyActivity, DifficultyLevel, Rating, ReviewLog, SM2Result, UserSettings, Word } from "@/types";
import { INITIAL_WORDS } from "./seedData";

export class LexiFlowDatabase extends Dexie {
  words!: Table<Word, number>;
  reviews!: Table<ReviewLog, number>;
  settings!: Table<UserSettings, number>;

  constructor() {
    super("LexiFlowDB_SHGM");
    this.version(1).stores({
      words: "++id, english, turkish, level, status, nextReviewDate, interval, repetition, timesReviewed",
      reviews: "++id, wordId, rating, reviewedAt, nextReviewDate",
      settings: "++id",
    });
  }
}

export const db = new LexiFlowDatabase();

/**
 * Initializes database with seed words and default user settings if empty
 */
export async function initializeDatabase(): Promise<void> {
  const count = await db.words.count();
  if (count === 0) {
    console.log("Seeding LexiFlow database with initial vocabulary...");
    await db.words.bulkAdd(INITIAL_WORDS as Word[]);
  }

  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    const today = new Date().toISOString().split("T")[0];
    await db.settings.add({
      dailyGoal: 10,
      streak: 1,
      lastActiveDate: today,
      selectedLevel: "all",
      soundEnabled: true,
      voiceAccent: "en-US",
      autoPronounce: false,
    });
  }
}

/**
 * Get words that are due for review (nextReviewDate <= end of today)
 */
export async function getDueWords(level?: DifficultyLevel | "all"): Promise<Word[]> {
  const endOfToday = new Date().setHours(23, 59, 59, 999);
  let query = db.words.where("nextReviewDate").belowOrEqual(endOfToday);

  let dueWords = await query.toArray();

  if (level && level !== "all") {
    dueWords = dueWords.filter((w) => w.level === level);
  }

  // Sort by priority: failed/lapsed first, then earliest review date
  return dueWords.sort((a, b) => {
    if (a.lapses !== b.lapses) return b.lapses - a.lapses;
    return a.nextReviewDate - b.nextReviewDate;
  });
}

/**
 * Get new unlearned words
 */
export async function getNewWords(limit: number = 10, level?: DifficultyLevel | "all"): Promise<Word[]> {
  let collection = db.words.where("status").equals("new");
  let words = await collection.toArray();

  if (level && level !== "all") {
    words = words.filter((w) => w.level === level);
  }

  return words.slice(0, limit);
}

/**
 * Record a review and update the word's SM-2 state in IndexedDB
 */
export async function recordReview(
  wordId: number,
  rating: Rating,
  sm2Result: SM2Result
): Promise<void> {
  const now = Date.now();
  const word = await db.words.get(wordId);
  if (!word) return;

  const isLapse = rating === 1;

  await db.transaction("rw", db.words, db.reviews, db.settings, async () => {
    // 1. Update word
    await db.words.update(wordId, {
      interval: sm2Result.interval,
      repetition: sm2Result.repetition,
      easinessFactor: sm2Result.easinessFactor,
      nextReviewDate: sm2Result.nextReviewDate,
      status: sm2Result.status,
      lastReviewedAt: now,
      timesReviewed: (word.timesReviewed || 0) + 1,
      lapses: (word.lapses || 0) + (isLapse ? 1 : 0),
    });

    // 2. Add review log entry
    await db.reviews.add({
      wordId,
      rating,
      reviewedAt: now,
      interval: sm2Result.interval,
      easinessFactor: sm2Result.easinessFactor,
      nextReviewDate: sm2Result.nextReviewDate,
    });

    // 3. Update streak
    const settings = await db.settings.toCollection().first();
    if (settings) {
      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

      let newStreak = settings.streak;
      if (settings.lastActiveDate === yesterday) {
        newStreak += 1;
      } else if (settings.lastActiveDate !== today) {
        newStreak = 1;
      }

      await db.settings.update(settings.id!, {
        streak: newStreak,
        lastActiveDate: today,
      });
    }
  });
}

/**
 * Get user settings
 */
export async function getSettings(): Promise<UserSettings> {
  let settings = await db.settings.toCollection().first();
  if (!settings) {
    const today = new Date().toISOString().split("T")[0];
    const defaultSettings: UserSettings = {
      dailyGoal: 10,
      streak: 1,
      lastActiveDate: today,
      selectedLevel: "all",
      soundEnabled: true,
      voiceAccent: "en-US",
      autoPronounce: false,
    };
    const id = await db.settings.add(defaultSettings);
    return { ...defaultSettings, id };
  }
  return settings;
}

/**
 * Update user settings
 */
export async function updateSettings(newValues: Partial<UserSettings>): Promise<void> {
  const settings = await getSettings();
  if (settings.id) {
    await db.settings.update(settings.id, newValues);
  }
}

/**
 * Get statistics for the dashboard
 */
export interface OverallStats {
  totalWords: number;
  masteredWords: number;
  learningWords: number;
  newWords: number;
  dueTodayCount: number;
  reviewedTodayCount: number;
  totalReviewsLogged: number;
  averageAccuracy: number; // percentage
  streak: number;
  dailyGoal: number;
}

export async function getOverallStats(): Promise<OverallStats> {
  const words = await db.words.toArray();
  const settings = await getSettings();

  const totalWords = words.length;
  const masteredWords = words.filter((w) => w.status === "mastered").length;
  const learningWords = words.filter((w) => w.status === "learning").length;
  const newWords = words.filter((w) => w.status === "new").length;

  const startOfToday = new Date().setHours(0, 0, 0, 0);
  const endOfToday = new Date().setHours(23, 59, 59, 999);

  const dueTodayCount = words.filter((w) => w.nextReviewDate <= endOfToday).length;

  const reviews = await db.reviews.toArray();
  const totalReviewsLogged = reviews.length;

  const todayReviews = reviews.filter((r) => r.reviewedAt >= startOfToday);
  const reviewedTodayCount = todayReviews.length;

  let averageAccuracy = 85;
  if (reviews.length > 0) {
    const successReviews = reviews.filter((r) => r.rating >= 2).length;
    averageAccuracy = Math.round((successReviews / reviews.length) * 100);
  }

  return {
    totalWords,
    masteredWords,
    learningWords,
    newWords,
    dueTodayCount,
    reviewedTodayCount,
    totalReviewsLogged,
    averageAccuracy,
    streak: settings.streak,
    dailyGoal: settings.dailyGoal,
  };
}

/**
 * Get daily activity chart data for the past 7 days
 */
export async function getWeeklyActivity(): Promise<DailyActivity[]> {
  const reviews = await db.reviews.toArray();
  const days: DailyActivity[] = [];

  const dayNames = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayLabel = dayNames[d.getDay()];

    const startOfDay = new Date(d.setHours(0, 0, 0, 0)).getTime();
    const endOfDay = new Date(d.setHours(23, 59, 59, 999)).getTime();

    const dayReviews = reviews.filter((r) => r.reviewedAt >= startOfDay && r.reviewedAt <= endOfDay);
    const successCount = dayReviews.filter((r) => r.rating >= 2).length;
    const retentionRate = dayReviews.length > 0 ? Math.round((successCount / dayReviews.length) * 100) : 0;

    days.push({
      date: dateStr,
      dayLabel,
      reviewedCount: dayReviews.length,
      learnedCount: dayReviews.filter((r) => r.rating >= 3).length,
      retentionRate,
    });
  }

  return days;
}

/**
 * Reset database to default seed state
 */
export async function resetDatabase(): Promise<void> {
  await db.words.clear();
  await db.reviews.clear();
  await db.settings.clear();
  await initializeDatabase();
}


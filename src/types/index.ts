export type DifficultyLevel = "A1" | "A2-B1" | "B2-C1" | "Aviation";

export type WordStatus = "new" | "learning" | "mastered";

export interface Word {
  id?: number;
  english: string;
  turkish: string;
  phonetic: string;
  partOfSpeech: "noun" | "verb" | "adjective" | "adverb" | "idiom";
  level: DifficultyLevel;
  exampleEn: string;
  exampleTr: string;
  storyEn: string;
  storyTr: string;
  synonyms?: string[];
  imagePrompt?: string;
  imageUrl?: string;
  category?: "general" | "aviation";

  // SM-2 Spaced Repetition Fields
  interval: number; // in days
  repetition: number; // consecutive correct reviews count
  easinessFactor: number; // EF, default 2.5, min 1.3
  nextReviewDate: number; // timestamp in ms
  lastReviewedAt?: number; // timestamp in ms
  status: WordStatus;
  timesReviewed: number;
  lapses: number; // number of times forgotten (rating < 3)
}

export type Rating = 1 | 2 | 3 | 4;
// 1 = Tekrar (Again/Fail)
// 2 = Zor (Hard)
// 3 = İyi (Good)
// 4 = Kolay (Easy)

export interface SM2Result {
  interval: number;
  repetition: number;
  easinessFactor: number;
  nextReviewDate: number;
  status: WordStatus;
}

export interface ReviewLog {
  id?: number;
  wordId: number;
  rating: Rating;
  reviewedAt: number;
  interval: number;
  easinessFactor: number;
  nextReviewDate: number;
}

export interface UserSettings {
  id?: number;
  dailyGoal: number; // e.g. 15 words
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD
  selectedLevel: DifficultyLevel | "all";
  soundEnabled: boolean;
  voiceAccent: "en-US" | "en-GB";
  autoPronounce: boolean;
}

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  dayLabel: string; // e.g., "Pzt", "Sal"
  reviewedCount: number;
  learnedCount: number;
  retentionRate: number; // percentage
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns an AI image generator URL (Pollinations.ai)
 * or fallback Unsplash query
 */
export function getWordImageUrl(englishWord: string, prompt?: string): string {
  const query = prompt || `${englishWord} aesthetic minimal cinematic concept`;
  const cleanPrompt = encodeURIComponent(query.slice(0, 150));
  // Pollinations.ai generates fast, artistic contextual AI images without API key
  return `https://image.pollinations.ai/prompt/${cleanPrompt}?width=800&height=500&nologo=true&seed=${stringToSeed(englishWord)}`;
}

function stringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}


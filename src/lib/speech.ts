/**
 * SpeechSynthesis wrapper for accurate English pronunciation
 */

let voices: SpeechSynthesisVoice[] = [];

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  const loadVoices = () => {
    voices = window.speechSynthesis.getVoices();
  };
  loadVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
}

export function speakEnglishWord(
  text: string,
  accent: "en-US" | "en-GB" = "en-US",
  rate: number = 0.9
): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      console.warn("SpeechSynthesis not supported in this browser.");
      resolve();
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = accent;
    utterance.rate = rate; // slightly slower for better learner comprehension
    utterance.pitch = 1.0;

    // Pick best voice for this accent
    if (voices.length === 0) {
      voices = window.speechSynthesis.getVoices();
    }

    const preferredVoice =
      voices.find((v) => v.lang.replace("_", "-").toLowerCase() === accent.toLowerCase()) ||
      voices.find((v) => v.lang.startsWith("en-")) ||
      voices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    window.speechSynthesis.speak(utterance);
  });
}


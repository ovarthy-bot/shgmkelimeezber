import fs from "fs";
import path from "path";

const raw = fs.readFileSync("raw_words.txt", "utf-8");
const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

const seen = new Map();

for (const line of lines) {
  if (line.toLowerCase().startsWith("ingilizce") || line.toLowerCase().startsWith("i̇ngilizce")) {
    continue;
  }
  const parts = line.split(/\t+/);
  if (parts.length >= 2) {
    const en = parts[0].trim();
    const tr = parts[1].trim();
    if (!en || !tr) continue;
    const key = en.toLowerCase();
    if (!seen.has(key)) {
      seen.set(key, { english: en, turkish: tr });
    } else {
      // merge turkish meanings if different
      const existing = seen.get(key);
      if (!existing.turkish.toLowerCase().includes(tr.toLowerCase())) {
        existing.turkish = `${existing.turkish}, ${tr}`;
      }
    }
  }
}

console.log(`Found ${seen.size} unique English vocabulary items.`);

function guessPartOfSpeech(en, tr) {
  const lowerEn = en.toLowerCase();
  const lowerTr = tr.toLowerCase();
  if (lowerTr.endsWith("mak") || lowerTr.endsWith("mek") || lowerEn.startsWith("to ")) {
    return "verb";
  }
  if (lowerTr.endsWith("li") || lowerTr.endsWith("siz") || lowerTr.includes("ayarlanabilen") || lowerTr.includes("yan yana") || lowerTr.includes("dahili") || lowerTr.includes("harici") || lowerTr.includes("mat")) {
    return "adjective";
  }
  if (lowerEn.endsWith("ly")) {
    return "adverb";
  }
  return "noun";
}

function guessLevel(en) {
  const words = en.split(" ");
  if (words.length > 2 || en.includes("Transmitter") || en.includes("System") || en.includes("Coupling")) {
    return "Aviation";
  }
  if (en.length > 10) return "B2-C1";
  if (en.length > 6) return "A2-B1";
  return "A1";
}

const wordList = Array.from(seen.values()).map(item => {
  const cleanEn = item.english.charAt(0).toUpperCase() + item.english.slice(1);
  const pos = guessPartOfSpeech(item.english, item.turkish);
  const lvl = guessLevel(item.english);
  const phonetic = `/${item.english.toLowerCase().replace(/[^a-z0-9 -]/g, "")}/`;

  return {
    english: cleanEn,
    phonetic,
    turkish: item.turkish,
    partOfSpeech: pos,
    level: "Aviation", // All are SHGM aviation & technical vocabulary!
    exampleEn: `Verify the condition of the ${item.english.toLowerCase()} during routine aircraft maintenance.`,
    exampleTr: `Rutin uçak bakımı sırasında ${item.turkish.split(",")[0]} durumunu kontrol edin.`,
    storyEn: `Aviation maintenance technicians strictly inspect every ${item.english.toLowerCase()} to ensure safe flight operations.`,
    storyTr: `Uçak bakım teknisyenleri, güvenli uçuş operasyonlarını sağlamak için her ${item.turkish.split(",")[0]} bileşenini titizlikle denetler.`,
    synonyms: [],
    imagePrompt: `aviation technical component ${item.english}, aircraft maintenance closeup in modern hangar, detailed engineering photography`,
    interval: 0,
    repetition: 0,
    easinessFactor: 2.5,
    nextReviewDate: Date.now(),
    status: "new",
    timesReviewed: 0,
    lapses: 0,
  };
});

const fileContent = `import { Word } from "@/types";

export const INITIAL_WORDS: Omit<Word, "id">[] = ${JSON.stringify(wordList, null, 2)};
`;

fs.writeFileSync("src/lib/seedData.ts", fileContent, "utf-8");
console.log(`Successfully generated src/lib/seedData.ts with ${wordList.length} SHGM vocabulary items!`);


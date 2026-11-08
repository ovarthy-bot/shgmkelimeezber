// Matches each seed word to a Pixabay photo and writes `imageUrl` into src/lib/seedData.ts.
// Usage (PowerShell):  $env:PIXABAY_API_KEY="..."; node scripts/fetch_pixabay_images.mjs
// Images are hotlinked from Pixabay's CDN (no download). Re-runs skip words already matched.
import fs from "fs";

const KEY = process.env.PIXABAY_API_KEY;
if (!KEY) {
  console.error("PIXABAY_API_KEY is not set.");
  process.exit(1);
}

const SEED = "src/lib/seedData.ts";
const CACHE = "scripts/.pixabay-cache.json";
const DELAY_MS = 700; // Pixabay allows 100 requests / 60 s

const src = fs.readFileSync(SEED, "utf8");
const words = JSON.parse(src.slice(src.indexOf("= [") + 2, src.lastIndexOf("];") + 1));
const cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, "utf8")) : {};

// Turn a seed entry into a short, searchable English query.
function queryFor(w) {
  return w.english
    .replace(/\(.*?\)/g, " ")          // drop parenthetical notes
    .split(/[,/]/)[0]                  // first alternative only
    .replace(/[^A-Za-z\- ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

async function search(q) {
  const url = new URL("https://pixabay.com/api/");
  url.searchParams.set("key", KEY);
  url.searchParams.set("q", q);
  url.searchParams.set("image_type", "photo");
  url.searchParams.set("safesearch", "true");
  url.searchParams.set("per_page", "3");
  const res = await fetch(url, { headers: { "User-Agent": "lexiflow-seed-script" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for "${q}"`);
  const data = await res.json();
  const hit = data.hits?.[0];
  return hit ? { imageUrl: hit.webformatURL, pageUrl: hit.pageURL, pixabayId: hit.id } : null;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let matched = 0, missed = 0;

for (const w of words) {
  const key = w.english;
  if (cache[key]) { // retry earlier misses (null)
    cache[key]?.imageUrl ? matched++ : missed++;
    continue;
  }
  const q = queryFor(w);
  try {
    cache[key] = (q && (await search(q))) || null;
  } catch (e) {
    console.error(e.message);
    cache[key] = null;
  }
  cache[key] ? matched++ : missed++;
  fs.writeFileSync(CACHE, JSON.stringify(cache, null, 1));
  await sleep(DELAY_MS);
}

for (const w of words) {
  const hit = cache[w.english];
  if (hit) {
    w.imageUrl = hit.imageUrl;
    w.imageSource = hit.pageUrl;
  }
}

fs.writeFileSync(
  SEED,
  'import { Word } from "@/types";\n\nexport const INITIAL_WORDS: Omit<Word, "id">[] = ' +
    JSON.stringify(words, null, 2) + ";\n",
  "utf8"
);
console.log(`Matched: ${matched}, no result: ${missed}, total: ${words.length}`);

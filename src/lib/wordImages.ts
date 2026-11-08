import { db, WordImage } from "./db";

// Pixabay API anahtarı yalnızca kullanıcının tarayıcısında (localStorage) saklanır.
const KEY_STORAGE = "lexiflow.pixabayKey";
const MIN_GAP_MS = 700;

export function getPixabayKey(): string {
  try {
    return window.localStorage.getItem(KEY_STORAGE) ?? "";
  } catch {
    return "";
  }
}

export function setPixabayKey(key: string): void {
  try {
    const trimmed = key.trim();
    if (trimmed) window.localStorage.setItem(KEY_STORAGE, trimmed);
    else window.localStorage.removeItem(KEY_STORAGE);
  } catch {
    // localStorage yoksa (gizli mod vb.) sessizce geç; görseller yine de çalışmaz
  }
}

const cacheKey = (english: string) => english.trim().toLowerCase();
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

let queue: Promise<unknown> = Promise.resolve();
let lastRequestAt = 0;

/**
 * Pixabay'den bir kelimenin ilk uygun fotoğrafını alır.
 * Hata (ağ, geçersiz anahtar, sınır aşımı) durumunda throw eder; böylece hatalı sonuç önbelleğe yazılmaz.
 * Sonuç bulunamazsa null döner (bu durum önbelleğe "bulunamadı" olarak yazılır).
 */
async function fetchFromPixabay(
  english: string,
  key: string
): Promise<{ blob: Blob | null; sourceUrl: string; pageURL: string } | null> {
  const params = new URLSearchParams({
    key,
    q: english,
    image_type: "photo",
    safesearch: "true",
    per_page: "3",
    lang: "en",
  });

  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(`https://pixabay.com/api/?${params.toString()}`);
    if (res.status === 429) {
      await sleep(2000 * (attempt + 1));
      continue;
    }
    if (!res.ok) throw new Error(`Pixabay ${res.status}`);

    const data = (await res.json()) as { hits?: { webformatURL: string; pageURL: string }[] };
    const hit = data.hits?.[0];
    if (!hit) return null;

    // Görseli cihaza indirmeye çalış; olmazsa uzak URL'yi kullanırız.
    let blob: Blob | null = null;
    try {
      const imgRes = await fetch(hit.webformatURL);
      if (imgRes.ok) blob = await imgRes.blob();
    } catch {
      blob = null;
    }
    return { blob, sourceUrl: hit.webformatURL, pageURL: hit.pageURL };
  }
  throw new Error("Pixabay rate limit");
}

/**
 * Kelime için görseli döndürür: önce cihazdaki önbelleğe bakar, yoksa Pixabay'den alıp önbelleğe yazar.
 * Anahtar yoksa ve önbellekte yoksa null döner.
 */
export async function loadWordImage(english: string): Promise<WordImage | null> {
  const cached = await db.wordImages.get(cacheKey(english));
  if (cached) return cached.sourceUrl ? cached : null;

  const key = getPixabayKey();
  if (!key) return null;

  const run = async (): Promise<WordImage | null> => {
    const wait = MIN_GAP_MS - (Date.now() - lastRequestAt);
    if (wait > 0) await sleep(wait);
    lastRequestAt = Date.now();

    const again = await db.wordImages.get(cacheKey(english));
    if (again) return again.sourceUrl ? again : null;

    const got = await fetchFromPixabay(english, key);
    const record: WordImage = {
      key: cacheKey(english),
      blob: got?.blob ?? null,
      sourceUrl: got?.sourceUrl ?? "",
      pageURL: got?.pageURL ?? "",
      fetchedAt: Date.now(),
    };
    await db.wordImages.put(record);
    return record.sourceUrl ? record : null;
  };

  // İstekleri sıraya koy: aynı anda birçok kart açılsa bile Pixabay sınırı aşılmaz.
  const result = queue.then(run, run);
  queue = result.catch(() => undefined);
  return result.catch(() => null);
}

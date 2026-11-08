"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import {
  Search,
  Plus,
  Filter,
  Volume2,
  Trash2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Clock,
  Lightbulb,
  X,
  Download,
  Upload,
} from "lucide-react";
import { Word, WordStatus } from "@/types";
import { db, resetDatabase } from "@/lib/db";
import { speakEnglishWord } from "@/lib/speech";
import { formatInterval } from "@/lib/sm2";
import { getPixabayKey, setPixabayKey } from "@/lib/wordImages";
import { useWordImage } from "@/hooks/useWordImage";

/** Kelime için önbellekteki görseli gösterir; görsel yoksa hiçbir şey çizmez. */
const WordThumb: React.FC<{ english: string }> = ({ english }) => {
  const { url, pageURL } = useWordImage(english);
  if (!url) return null;
  return (
    <div className="w-full md:w-44 h-32 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 relative">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={english} className="w-full h-full object-cover" />
      {pageURL && (
        <a
          href={pageURL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-1 right-1.5 text-[10px] font-semibold text-white bg-black/45 hover:bg-black/60 px-1.5 py-0.5 rounded"
        >
          Pixabay
        </a>
      )}
    </div>
  );
};

/** Pixabay API anahtarını tarayıcıya kaydetmek için küçük bir alan. */
const noopSubscribe = () => () => {};

const PixabayKeyInput: React.FC = () => {
  // Sunucuda (SSR) anahtar okunamadığı için sunucu anlık görüntüsü boş döner.
  const storedKey = useSyncExternalStore(noopSubscribe, getPixabayKey, () => "");
  const [draft, setDraft] = useState("");
  const [override, setOverride] = useState<string | null>(null);
  const currentKey = override ?? storedKey;

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-2 sm:items-center">
      <p className="text-xs text-slate-500 dark:text-slate-400 flex-1">
        Kelime görselleri için ücretsiz Pixabay API anahtarı. Anahtar yalnızca bu tarayıcıda saklanır.{" "}
        {currentKey ? <span className="font-semibold text-emerald-600">Anahtar kayıtlı.</span> : null}
      </p>
      <input
        type="password"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Pixabay API anahtarı"
        className="px-3 py-2 text-base sm:text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent flex-1 min-w-0"
      />
      <button
        type="button"
        onClick={() => {
          setPixabayKey(draft);
          setOverride(draft.trim());
          setDraft("");
        }}
        className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
      >
        Kaydet
      </button>
    </div>
  );
};

export const WordManagement: React.FC = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState<number>(30);
  const [expandedWordId, setExpandedWordId] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWord, setNewWord] = useState<Partial<Word>>({
    english: "",
    turkish: "",
    phonetic: "",
    partOfSpeech: "noun",
    level: "A1",
    exampleEn: "",
    exampleTr: "",
    storyEn: "",
    storyTr: "",
  });

  const loadWords = async () => {
    const all = await db.words.toArray();
    setWords(all);
  };

  useEffect(() => {
    loadWords();
  }, []);

  const handleAudio = async (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await speakEnglishWord(text);
  };

  const handleToggleExpand = (id: number) => {
    setExpandedWordId(expandedWordId === id ? null : id);
  };

  const handleReset = async () => {
    if (window.confirm("Bütün ilerlemeyi sıfırlayıp varsayılan kelime havuzuna dönmek istediğine emin misin?")) {
      await resetDatabase();
      await loadWords();
    }
  };

  const handleExportJSON = async () => {
    const [reviews, settings] = await Promise.all([db.reviews.toArray(), db.settings.toArray()]);
    const backup = {
      format: "lexiflow-backup",
      version: 2,
      exportedAt: new Date().toISOString(),
      words,
      reviews,
      settings,
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `lexiflow_backup_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);

        // v2: kelimeler + tekrar geçmişi + ayarlar (id'ler korunur, ilişkiler bozulmaz)
        if (parsed && parsed.format === "lexiflow-backup") {
          await db.transaction("rw", db.words, db.reviews, db.settings, async () => {
            if (Array.isArray(parsed.words)) await db.words.bulkPut(parsed.words);
            if (Array.isArray(parsed.reviews)) await db.reviews.bulkPut(parsed.reviews);
            if (Array.isArray(parsed.settings)) await db.settings.bulkPut(parsed.settings);
          });
          await loadWords();
          alert(`🎉 Yedek geri yüklendi: ${parsed.words?.length ?? 0} kelime, ${parsed.reviews?.length ?? 0} tekrar kaydı.`);
          return;
        }

        // v1 (eski): yalnızca kelime dizisi
        const imported = parsed;
        if (Array.isArray(imported)) {
          for (const item of imported) {
            delete item.id;
            await db.words.add(item);
          }
          await loadWords();
          alert(`🎉 ${imported.length} kelime başarıyla içe aktarıldı!`);
        }
      } catch (err) {
        alert("Geçersiz JSON dosyası!");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleSaveWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.english || !newWord.turkish) return;

    const fullWord: Omit<Word, "id"> = {
      english: newWord.english.trim(),
      turkish: newWord.turkish.trim(),
      phonetic: newWord.phonetic?.trim() || `/${newWord.english.toLowerCase()}/`,
      partOfSpeech: (newWord.partOfSpeech as any) || "noun",
      level: "A1",
      exampleEn: newWord.exampleEn?.trim() || `This is an example with ${newWord.english}.`,
      exampleTr: newWord.exampleTr?.trim() || `Bu ${newWord.turkish} ile bir örnektir.`,
      storyEn: newWord.storyEn?.trim() || `Remembering ${newWord.english} in context.`,
      storyTr: newWord.storyTr?.trim() || `${newWord.turkish} kelimesini akılda tutmak için kısa not.`,
      interval: 0,
      repetition: 0,
      easinessFactor: 2.5,
      nextReviewDate: Date.now(),
      status: "new",
      timesReviewed: 0,
      lapses: 0,
    };

    await db.words.add(fullWord as Word);
    setShowAddModal(false);
    setNewWord({
      english: "",
      turkish: "",
      phonetic: "",
      partOfSpeech: "noun",
      level: "A1",
      exampleEn: "",
      exampleTr: "",
      storyEn: "",
      storyTr: "",
    });
    await loadWords();
  };

  const filteredWords = words.filter((w) => {
    const matchesSearch =
      w.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.turkish.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || w.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Kelime Havuzu ({words.length})</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tüm kelimeleri filtrele, telaffuzlarını dinle veya yeni özel kelime ekle.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Kelime Ekle</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="p-2 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-colors cursor-pointer"
            title="Kelimeleri İndir (JSON Yedek)"
          >
            <Download className="w-4 h-4" />
          </button>

          <label
            className="p-2 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-colors cursor-pointer"
            title="Kelimeleri Yükle (JSON İçe Aktar)"
          >
            <Upload className="w-4 h-4" />
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>

          <button
            onClick={handleReset}
            className="p-2 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-500 hover:border-rose-300 dark:hover:border-rose-900 transition-colors cursor-pointer"
            title="Kelime Havuzunu Sıfırla"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="İngilizce veya Türkçe ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-base sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Status filter */}
        <div className="relative">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-base sm:text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="new">Yeni (Henüz çalışılmadı)</option>
            <option value="learning">Öğreniliyor (Döngüde)</option>
            <option value="mastered">Kalıcı Hafızada</option>
          </select>
        </div>
      </div>

      <PixabayKeyInput />

      {/* Words List */}
      <div className="flex flex-col gap-3">
        {filteredWords.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400">
            Arama kriterine uygun kelime bulunamadı.
          </div>
        ) : (
          filteredWords.slice(0, visibleCount).map((w) => {
            const isExpanded = expandedWordId === w.id;

            return (
              <div
                key={w.id}
                onClick={() => handleToggleExpand(w.id!)}
                className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900 shadow-sm transition-all cursor-pointer"
              >
                {/* Main Row */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={(e) => handleAudio(w.english, e)}
                      className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
                      title="Telaffuzu Dinle"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                          {w.english}
                        </span>
                        <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400">
                          {w.phonetic}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                        {w.turkish}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        w.status === "mastered"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : w.status === "learning"
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          : "bg-slate-500/10 text-slate-500"
                      }`}
                    >
                      {w.status === "mastered"
                        ? "Kalıcı"
                        : w.status === "learning"
                        ? "Öğreniliyor"
                        : "Yeni"}
                    </span>

                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4">
                    {/* Görsel (önbellekte veya Pixabay'den; yoksa gösterilmez) */}
                    <WordThumb english={w.english} />

                    {/* Sentences & Story */}
                    <div className="flex-1 flex flex-col gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                          Örnek Cümle:
                        </span>
                        <p className="text-slate-800 dark:text-slate-200">{w.exampleEn}</p>
                        <p className="text-slate-400 italic mt-0.5">{w.exampleTr}</p>
                      </div>

                      <div className="p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/25">
                        <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400 mb-1">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                          <span>Kelime Benzetme & Hafıza Çıpası:</span>
                          {w.mnemonicHook && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[10px] font-black">
                              {w.mnemonicHook}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                          {w.mnemonicScene || w.storyTr}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 text-slate-400 mt-1">
                        <span>Tekrar: {w.timesReviewed || 0}</span>
                        <span>•</span>
                        <span>Aralık: {formatInterval(w.interval || 0)}</span>
                        <span>•</span>
                        <span>EF: {w.easinessFactor || 2.5}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}

        {visibleCount < filteredWords.length && (
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + 30)}
            className="mt-2 py-3 px-6 rounded-2xl bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold text-xs hover:bg-indigo-100 dark:hover:bg-slate-700 transition-colors cursor-pointer mx-auto block shadow-sm border border-indigo-200/50 dark:border-slate-700"
          >
            Daha Fazla Kelime Göster ({filteredWords.length - visibleCount} kelime kaldı)
          </button>
        )}
      </div>

      {/* Add Custom Word Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute right-5 top-5 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              Yeni Kelime Ekle
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Kelimeye ait telaffuz, örnek cümle ve mikro hikaye ekleyerek kalıcılığı artır.
            </p>

            <form onSubmit={handleSaveWord} className="flex flex-col gap-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    İngilizce Kelime *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="örn: Serendipity"
                    value={newWord.english}
                    onChange={(e) => setNewWord({ ...newWord, english: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Türkçe Anlamı *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="örn: Mutlu tesadüf"
                    value={newWord.turkish}
                    onChange={(e) => setNewWord({ ...newWord, turkish: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    IPA Telaffuz
                  </label>
                  <input
                    type="text"
                    placeholder="örn: /ˈel.ə.kwənt/"
                    value={newWord.phonetic}
                    onChange={(e) => setNewWord({ ...newWord, phonetic: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  İngilizce Örnek Cümle
                </label>
                <input
                  type="text"
                  placeholder="Kelimenin geçtiği cümle..."
                  value={newWord.exampleEn}
                  onChange={(e) => setNewWord({ ...newWord, exampleEn: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Örnek Cümle Türkçe Çevirisi
                </label>
                <input
                  type="text"
                  placeholder="Cümlenin Türkçe çevirisi..."
                  value={newWord.exampleTr}
                  onChange={(e) => setNewWord({ ...newWord, exampleTr: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Mikro Hikaye (Bağlam & Çağrışım)
                </label>
                <textarea
                  rows={2}
                  placeholder="Kelimeyi unutmamak için kısa bir sahne veya hikaye..."
                  value={newWord.storyEn}
                  onChange={(e) => setNewWord({ ...newWord, storyEn: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="mt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-600/30"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


"use client";

import React, { useEffect, useState } from "react";
import { BookOpen, ListChecks, HelpCircle, Eye, EyeOff } from "lucide-react";

// Yerel içerik: public/local-content/study.json (git'e dahil değildir, bkz. .gitignore)
interface Konu {
  baslik: string;
  satirlar: string[];
}
interface Bolum {
  no: number;
  baslik: string;
  ozet: string;
  konular: Konu[];
  kelimeler: string[];
  sorular: string[];
  cevaplar: string[];
}
interface StudyData {
  kaynak: string;
  bolumler: Bolum[];
}

type Sekme = "konu" | "kelime" | "soru";

export const StudyNotes: React.FC = () => {
  const [data, setData] = useState<StudyData | null>(null);
  const [yok, setYok] = useState(false);
  const [bolumNo, setBolumNo] = useState(1);
  const [sekme, setSekme] = useState<Sekme>("konu");
  const [acik, setAcik] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetch("/local-content/study.json")
      .then((r) => {
        if (!r.ok) throw new Error("yok");
        return r.json();
      })
      .then((d: StudyData) => setData(d))
      .catch(() => setYok(true));
  }, []);

  if (yok) {
    return (
      <div className="max-w-3xl mx-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-300">
        Konu içeriği bu sürümde yok. Yerel olarak <code>public/local-content/study.json</code> dosyası
        eklendiğinde burada görünür.
      </div>
    );
  }
  if (!data) {
    return <div className="text-sm text-slate-400">Yükleniyor...</div>;
  }

  const bolum = data.bolumler.find((b) => b.no === bolumNo) ?? data.bolumler[0];

  const sekmeler: { id: Sekme; label: string; icon: React.ReactNode }[] = [
    { id: "konu", label: "Konu Anlatımı", icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: "kelime", label: "Kelime Listesi", icon: <ListChecks className="w-3.5 h-3.5" /> },
    { id: "soru", label: "Alıştırmalar", icon: <HelpCircle className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 pb-12">
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white">Konu Anlatımı</h2>
        <p className="text-xs text-slate-400 mt-1">{data.kaynak}</p>
      </div>

      {/* Bölüm seçici */}
      <div className="flex flex-wrap gap-2">
        {data.bolumler.map((b) => (
          <button
            key={b.no}
            type="button"
            onClick={() => {
              setBolumNo(b.no);
              setAcik({});
            }}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold border transition-all ${
              bolum.no === b.no
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800"
            }`}
          >
            Bölüm {b.no}
          </button>
        ))}
      </div>

      <div className="p-5 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 text-sm text-slate-700 dark:text-slate-200">
        <strong>Bölüm {bolum.no} – {bolum.baslik}</strong>
        {bolum.ozet && <p className="mt-2 leading-relaxed">{bolum.ozet}</p>}
      </div>

      {/* Alt sekmeler */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {sekmeler.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSekme(s.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${
              sekme === s.id
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {s.icon}
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      {sekme === "konu" && (
        <div className="flex flex-col gap-5">
          {bolum.konular.map((k, i) => (
            <div key={i} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white mb-3">{k.baslik}</h3>
              <div className="flex flex-col gap-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {k.satirlar.map((s, j) => (
                  <p key={j}>{s}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {sekme === "kelime" && (
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <ul className="flex flex-col gap-1.5 text-sm text-slate-700 dark:text-slate-300">
            {bolum.kelimeler.map((k, i) => (
              <li key={i}>{k}</li>
            ))}
          </ul>
        </div>
      )}

      {sekme === "soru" && (
        <div className="flex flex-col gap-3">
          {bolum.sorular.map((s, i) => {
            const open = !!acik[i];
            return (
              <div key={i} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {i + 1}. {s}
                </p>
                <button
                  type="button"
                  onClick={() => setAcik({ ...acik, [i]: !open })}
                  className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400"
                >
                  {open ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{open ? "Cevabı gizle" : "Cevabı göster"}</span>
                </button>
                {open && (
                  <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-400">
                    {bolum.cevaplar[i] ?? "Bu soru için cevap anahtarında karşılık yok."}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

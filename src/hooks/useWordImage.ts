"use client";

import { useEffect, useState } from "react";
import { loadWordImage } from "@/lib/wordImages";

export interface WordImageState {
  url: string;
  pageURL: string;
}

const EMPTY: WordImageState = { url: "", pageURL: "" };

/**
 * Kelime için önbellekteki (ya da Pixabay'den yeni alınan) görseli döndürür.
 * Görsel yoksa url boş string olur.
 */
export function useWordImage(english: string): WordImageState {
  // Durum, hangi kelimeye ait olduğuyla birlikte tutulur; kelime değişince eski görsel gösterilmez.
  const [state, setState] = useState<{ english: string } & WordImageState>({ english: "", ...EMPTY });

  useEffect(() => {
    let cancelled = false;
    let objectUrl = "";

    loadWordImage(english).then((record) => {
      if (cancelled || !record) return;
      if (record.blob) {
        objectUrl = URL.createObjectURL(record.blob);
        setState({ english, url: objectUrl, pageURL: record.pageURL });
      } else {
        setState({ english, url: record.sourceUrl, pageURL: record.pageURL });
      }
    });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [english]);

  return state.english === english ? { url: state.url, pageURL: state.pageURL } : EMPTY;
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LexiFlow – Yapay Zeka Destekli Görsel Kelime Ezberleme Platformu",
  description:
    "SuperMemo 2 (SM-2) aralıklı tekrar algoritması, yapay zeka görselleri ve mikro hikayelerle kalıcı İngilizce kelime ezberleme platformu.",
  keywords: [
    "İngilizce kelime ezberleme",
    "Spaced repetition",
    "SuperMemo 2",
    "SM-2",
    "Flashcard",
    "LexiFlow",
    "AI vocabulary",
  ],
  manifest: "/shgmkelimeezber/manifest.json",
  // iPhone: ana ekrana eklenince tam ekran uygulama olarak açılması için
  appleWebApp: {
    capable: true,
    title: "LexiFlow",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}

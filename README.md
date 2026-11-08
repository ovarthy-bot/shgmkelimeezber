# 🚀 LexiFlow – Yapay Zeka Destekli Görsel Kelime Ezberleme Platformu

**LexiFlow**, YoG uygulamasının *"Görsel + Tekrar + Hikaye"* metodolojisini SuperMemo 2 (SM-2) aralıklı tekrar algoritmasıyla harmanlayan, modern, çevrimdışı öncelikli (offline-first) ve açık kaynaklı bir web platformudur.

---

## 🌐 Canlı Uygulama Nasıl Açılır?

Geliştirme sunucusu arka planda çalışmaktadır. Uygulamaya erişmek için tarayıcınızda (Chrome, Edge vb.) şu adresi açın:

👉 **[http://localhost:3000](http://localhost:3000)**

---

## ✨ Öne Çıkan Özellikler

### 1. 🎴 3D Çift Taraflı Kelime Kartı (Flashcard)
- **Ön Yüz:** İngilizce kelime, IPA fonetik telaffuz transkripsiyonu, yapay zeka üretken görseli (Pollinations.ai), iskelet (skeleton) yükleyici ve Web Speech API sesli telaffuz butonu.
- **Arka Yüz:** Vurgulu Türkçe anlamı, hedef kelimenin renkli vurgulandığı örnek cümle + Türkçe çevirisi, hafızayı pekiştiren canlı mikro hikaye ve eş anlamlılar.
- **Etkileşim:** Kart üzerine tıklayarak veya klavyedeki <kbd>Boşluk</kbd> (Space) tuşuna basarak çevrilir.

### 2. 🧠 SuperMemo 2 (SM-2) Aralıklı Tekrar Motoru
- **[1] Tekrar (Again):** Hatırlanamayan kelimeler seansın sonuna tekrar eklenir ve pekiştirilene kadar sorulur.
- **[2] Zor (Hard):** 1.2x aralık çarpanı ve düşük EF ile yakın tarihte tekrar planlanır.
- **[3] İyi (Good):** Standart SM-2 aralığı ($I_n = I_{n-1} \times EF$).
- **[4] Kolay (Easy):** Kolaylık bonusu ($1.3\times$) ile uzun vadeli kalıcı hafızaya aktarılır.
- Kısayollar: Kart açıkken <kbd>1</kbd>, <kbd>2</kbd>, <kbd>3</kbd>, <kbd>4</kbd> tuşlarıyla değerlendirme yapılır.

### 3. ✈️ Özel Seviyeler & SHGM Havacılık İngilizcesi
- **A1:** Günlük temel kelimeler
- **A2-B1:** İletişim ve iş dünyası kelimeleri
- **B2-C1:** İleri düzey akademik & zengin nüanslı kelimeler
- **Aviation (SHGM):** Pilot, kabin ve havacılık sınavlarına özel terimler (*Turbulence, Clearance, Go-Around, Expedite, Mayday, Glide Slope, Squawk...*)

### 4. 📊 Detaylı İstatistikler & Analiz (Recharts)
- Günlük ve haftalık tekrar hacmi çubuk grafiği.
- Hafıza tutma eğrisi (retention rate %).
- Kalıcı, öğrenilen ve yeni kelimeler pasta grafiği.
- Kesintisiz çalışma serisi (Streak) sayacı.

### 5. 💾 Çevrimdışı Çalışma Desteği (IndexedDB & Dexie.js)
- İnternet bağlantınız kopsa bile tüm kelime veritabanı, tekrar geçmişi ve ayarlar yerel IndexedDB'de saklanır.

---

## 🛠️ Teknoloji Yığını

- **Framework:** Next.js 16 (App Router, Turbopack) & React 19
- **Stil:** Tailwind CSS v4 & Shadcn UI estetiği (Dark / Light tema)
- **Animasyon:** Framer Motion & Canvas Confetti
- **Veritabanı:** Dexie.js (IndexedDB)
- **Ses:** Web Speech API (US & UK aksan seçenekleri)
- **Grafik:** Recharts
- **İkonlar:** Lucide React

---

## 💻 Geliştirici Komutları

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev

# Üretim derlemesi (Build)
npm run build
```

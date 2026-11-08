import fs from "fs";

// Load existing seed data to get all 568 entries
import { INITIAL_WORDS } from "../src/lib/seedData.ts";

// Specific curated mnemonics for common/aviation terms, with a dynamic phonetic engine for the rest
const CURATED_MNEMONICS = {
  "oven": {
    pron: "avın",
    hook: "AVIN",
    scene: 'Ormanda yakaladıkları "AVIN" etini lezzetli pişirmek için dev bir "FIRIN"a attılar. Bu olay size OVEN kelimesinin FIRIN olduğunu hatırlatacaktır.'
  },
  "grill": {
    pron: "gril",
    hook: "GIRIL GIRIL",
    scene: '"GIRIL GIRIL" yanan kömürlerin üzerine demir "IZGARA"yı koyup etleri cızır cızır pişirdiler. Bu ses size GRILL kelimesinin IZGARA olduğunu hatırlatacaktır.'
  },
  "duct": {
    pron: "dakt",
    hook: "DAKTİLO",
    scene: 'Ajan, gizli "DAKTİLO"yu uçağın havalandırma "BORUSUNA / KANALINA" (DUCT) sakladı. Bu sahne size DUCT kelimesinin KANAL / BORU olduğunu hatırlatacaktır.'
  },
  "adjacent": {
    pron: "ecisınt",
    hook: "ACISINDAN",
    scene: '"BİTİŞİK / YAN YANA" komşunun "ACISINDAN" evde kimse uyuyamadı, duvarlar birbirine yapışıktı. Bu ilişki ADJACENT kelimesinin BİTİŞİK, YAN YANA olduğunu hatırlatacaktır.'
  },
  "equipped": {
    pron: "ikwipt",
    hook: "EKİP",
    scene: 'Hangarımıza gelen kurtarma "EKİBİ", en son teknoloji cihazlarla "DONATILMIŞ / DONANMIŞ" vaziyetteydi. Bu bağ size EQUIPPED kelimesinin DONATILMIŞ olduğunu hatırlatacaktır.'
  },
  "layer": {
    pron: "leyır",
    hook: "LEYLEK",
    scene: '"LEYLEK" soğuktan korunmak için kanatlarını "KATMAN" katman tüylerle kaplamış. Bu görüntü size LAYER kelimesinin KATMAN olduğunu hatırlatacaktır.'
  },
  "decision": {
    pron: "desijın",
    hook: "DE SEÇİM",
    scene: 'Kaptan pilot yardımcısına "Hadi artık DE SEÇİMİNİ, son KARARINI ver!" diye seslendi. Bu diyalog size DECISION kelimesinin KARAR olduğunu hatırlatacaktır.'
  },
  "peel off": {
    pron: "piil of",
    hook: "PİLİ OF",
    scene: '"PİLİ OF" durumuna gelen kumandanın üzerindeki eski boyalar "PUL PUL DÖKÜLDÜ". Bu sahne size PEEL OFF kelimesinin PUL PUL DÖKÜLMEK olduğunu hatırlatacaktır.'
  },
  "hold": {
    pron: "hold",
    hook: "HOLDİNG",
    scene: 'Büyük "HOLDİNG" patronu şirketin tüm hisselerini elinde sıkıca "TUTUYOR". Bu sahne size HOLD kelimesinin TUTMAK olduğunu hatırlatacaktır.'
  },
  "neutral": {
    pron: "nötrıl",
    hook: "NÖTR",
    scene: 'Uçak yerdeyken tüm kontrol kolları "NÖTR" yani "SIFIR DURUMDA, TARAFSIZ" tutulur. Bu kural size NEUTRAL kelimesinin NÖTR / SIFIR DURUMDA olduğunu hatırlatacaktır.'
  },
  "dull": {
    pron: "dal",
    hook: "DAL",
    scene: 'Kırılan ağacın "DALI" zımparalanmadığı için yüzeyi son derece "MAT VE NET OLMAYAN" bir renkteydi. Bu görüntü DULL kelimesinin MAT olduğunu hatırlatacaktır.'
  },
  "strap": {
    pron: "stıræp",
    hook: "SIRA İP",
    scene: 'Kargoları sabitlemek için "SIRA SIRA İPLER" yerine sağlam bir "KAYIŞ / BANT" kullandılar. Bu benzetme STRAP kelimesinin KAYIŞ olduğunu hatırlatacaktır.'
  },
  "clamp": {
    pron: "klæmp",
    hook: "KLEPÇE / KELEP",
    scene: 'Teknisyen borunun ucunu kaçırmamak için demir bir "KELEPÇE" (CLAMP) ile sıkıca sıktı. Bu alet size CLAMP kelimesinin KELEPÇE olduğunu hatırlatacaktır.'
  },
  "attach": {
    pron: "etaç",
    hook: "ATAŞ",
    scene: 'Önemli uçuş evraklarını birbirine dev bir "ATAŞ" ile "TUTTURDU / YAPIŞTIRDI". Bu eylem ATTACH kelimesinin TUTTURMAK olduğunu hatırlatacaktır.'
  },
  "wet": {
    pron: "vet",
    hook: "VETERİNER",
    scene: '"VETERİNER", yağmurda sırılsıklam "ISLANMIŞ" köpeği havluyla kuruladı. Bu olay WET kelimesinin ISLATMAK / ISLAK olduğunu hatırlatacaktır.'
  },
  "rinse": {
    pron: "rins",
    hook: "RİNSO",
    scene: '"RİNSO" marka sabunla köpürtülen uçak camlarını bol suyla "DURULADILAR". Bu temizlik RINSE kelimesinin DURULAMAK olduğunu hatırlatacaktır.'
  },
  "hanger": {
    pron: "hengır",
    hook: "HANGAR",
    scene: 'Devasa uçak "HANGARINDA" pilotların üniformalarını astıkları koca bir "ASKI" vardı. Bu nesne HANGER kelimesinin ASKI olduğunu hatırlatacaktır.'
  },
  "friction": {
    pron: "frikşın",
    hook: "FRİKİK",
    scene: 'Futbolcu "FRİKİK" atarken top çim yüzeye "SÜRTÜNEREK" hız kaybetti. Bu sürtünme FRICTION kelimesinin SÜRTÜNME olduğunu hatırlatacaktır.'
  },
  "essential": {
    pron: "isenşıl",
    hook: "ESEN",
    scene: '"ESEN" dağ rüzgarındaki temiz oksijen, solunum için en "GEREKLİ VE ESAS" unsurdur. Bu gerçek ESSENTIAL kelimesinin GEREKLİ / ESAS olduğunu hatırlatacaktır.'
  },
  "caution": {
    pron: "koşın",
    hook: "KOŞ",
    scene: 'Telsizden "KOŞ arkana bakma!" diye acil bir "UYARI / DİKKAT" anonsu geçti. Bu ses CAUTION kelimesinin UYARI olduğunu hatırlatacaktır.'
  },
  "fuse": {
    pron: "fyuz",
    hook: "FÜZE",
    scene: 'Fırlatılan "FÜZE" rampasındaki yüksek voltajdan dolayı ana panodaki "SİGORTA" attı. Bu kıvılcım FUSE kelimesinin SİGORTA olduğunu hatırlatacaktır.'
  },
  "gauge": {
    pron: "geyc",
    hook: "GEYİK",
    scene: '"GEYİK" yavrusunun boyunu kokpitteki hassas "GÖSTERGE / KALİBRE" ile ölçtüler. Bu ölçüm GAUGE kelimesinin GÖSTERGE / KALİBRE olduğunu hatırlatacaktır.'
  },
  "repair": {
    pron: "ripeyr",
    hook: "RİP (YIRTIK)",
    scene: 'Kanattaki "YIRTIK (RİP)" kaplamayı usta teknisyen anında "TAMİR ETTİ". Bu onarım REPAIR kelimesinin TAMİR ETMEK olduğunu hatırlatacaktır.'
  },
  "bolt": {
    pron: "bolt",
    hook: "USAIN BOLT",
    scene: 'Dünyanın en hızlı koşucusu "USAIN BOLT" kadar çevik hareketlerle çelik "CIVATAYI" sıktı. Bu güç BOLT kelimesinin CIVATA olduğunu hatırlatacaktır.'
  },
  "nut": {
    pron: "nat",
    hook: "NAT (FINDIK)",
    scene: 'Fındık ("NUT") kadar küçük ama çelik gibi sağlam "SOMUN" ile vidayı kilitlediler. Bu parça NUT kelimesinin SOMUN olduğunu hatırlatacaktır.'
  },
  "chain": {
    pron: "çeyn",
    hook: "ÇAY",
    scene: '"ÇAY" bahçesinin giriş kapısını ağır bir demir "ZİNCİR" ile kilitlediler. Bu engel CHAIN kelimesinin ZİNCİR olduğunu hatırlatacaktır.'
  },
  "gear": {
    pron: "giyır",
    hook: "GİY",
    scene: 'Teknisyene "Tulumunu GİY, vardiyada DİŞLİ kutusunu ve VİTESİ değiştir" dediler. Bu talimat GEAR kelimesinin DİŞLİ / VİTES olduğunu hatırlatacaktır.'
  },
  "brake": {
    pron: "breyk",
    hook: "BREAK (MOLA)",
    scene: 'Pistte "BREAK (MOLA)" vermeden hemen önce pilot güçlüce "FREN"e bastı. Bu yavaşlama BRAKE kelimesinin FREN olduğunu hatırlatacaktır.'
  },
  "tire": {
    pron: "tayır",
    hook: "TAY",
    scene: 'Yarış pistindeki vahşi "TAY", uçak tekerleğindeki devasa "LASTİK"ten ürktü. Bu sahne TIRE kelimesinin LASTİK olduğunu hatırlatacaktır.'
  },
  "window": {
    pron: "vindov",
    hook: "WINDOWS",
    scene: '"WINDOWS" logosu gibi dört kare bölmeli şeffaf uçak "PENCERE CAMI" pırıl pırıldı. Bu görüntü WINDOW kelimesinin CAM / PENCERE olduğunu hatırlatacaktır.'
  },
  "seat": {
    pron: "siit",
    hook: "SİT (OTUR)",
    scene: 'Hostes yolcuya "Please SIT down" diyerek rahat yolcu "KOLTUĞUNU" gösterdi. Bu yer SEAT kelimesinin KOLTUK olduğunu hatırlatacaktır.'
  },
  "door": {
    pron: "dor",
    hook: "DORU AT",
    scene: '"DORU AT" hangarın devasa otomatik "KAPISINDAN" içeri girdi. Bu sahne DOOR kelimesinin KAPI olduğunu hatırlatacaktır.'
  },
  "seal": {
    pron: "siil",
    hook: "SİL",
    scene: 'Usta "Yağ sızdıran contayı iyice SİL ve yeni CONTA / MÜHÜR tak" dedi. Bu talimat SEAL kelimesinin CONTA / MÜHÜR olduğunu hatırlatacaktır.'
  },
  "leak": {
    pron: "liik",
    hook: "LİKÖR / LİKİT",
    scene: 'Borudan sızan yeşil renkli "LİKİT", bariz bir "SIZINTI / KAÇAK" olduğunu kanıtladı. Bu damla LEAK kelimesinin SIZINTI olduğunu hatırlatacaktır.'
  },
  "turbulence": {
    pron: "törbılıns",
    hook: "TÜRBAN / TİR-TİR",
    scene: 'Uçak şiddetli "TÜRBÜLANS"a girince sarsıntıdan yolcular tir tir titredi. Bu sarsıntı TURBULENCE kelimesinin HAVA ÇALKANTISI / TÜRBÜLANS olduğunu hatırlatacaktır.'
  },
  "clearance": {
    pron: "kliyrıns",
    hook: "KİLER / KLİR",
    scene: 'Kule görevlisi "Yol tamamen temiz, kalkış İZNİNİ (CLEARANCE) veriyorum" dedi. Bu onay CLEARANCE kelimesinin UÇUŞ / KALKIŞ İZNİ olduğunu hatırlatacaktır.'
  },
  "mayday": {
    pron: "meydey",
    hook: "MEYDANDAN",
    scene: '"MEYDANDAN" telsizle bağırdılar: "ACİL DURUM İMDAT ÇAĞRISI (MAYDAY) alındı, pist boşaltılsın!" Bu çağrı MAYDAY kelimesinin İMDAT ÇAĞRISI olduğunu hatırlatacaktır.'
  }
};

// Turkish phonetic rules generator
function generateTurkishPronunciation(word) {
  let w = word.toLowerCase().trim();
  // Multi-word
  if (w.includes(" ")) {
    return w.split(" ").map(generateTurkishPronunciation).join(" ");
  }

  // Common replacements
  let p = w
    .replace(/tion/g, "şın")
    .replace(/sion/g, "jın")
    .replace(/ture/g, "çır")
    .replace(/ight/g, "ayt")
    .replace(/ough/g, "of")
    .replace(/ea/g, "ii")
    .replace(/ee/g, "ii")
    .replace(/oo/g, "uu")
    .replace(/sh/g, "ş")
    .replace(/ch/g, "ç")
    .replace(/th/g, "t")
    .replace(/ph/g, "f")
    .replace(/ck/g, "k")
    .replace(/c([eiyeî])/g, "s$1")
    .replace(/c/g, "k")
    .replace(/q/g, "k")
    .replace(/x/g, "ks")
    .replace(/w/g, "v")
    .replace(/j/g, "c")
    .replace(/y$/g, "i")
    .replace(/e$/g, "");

  if (p.length === 0) p = w;
  return p;
}

// Generate sound-alike mnemonic hook and scene for any word
function generateMnemonic(word, turkish) {
  const lower = word.toLowerCase().trim();
  if (CURATED_MNEMONICS[lower]) {
    return CURATED_MNEMONICS[lower];
  }

  const pron = generateTurkishPronunciation(lower);
  const primaryTr = turkish.split(",")[0].trim().toUpperCase();

  // Create sound-alike hook from the pronunciation
  let hook = pron.slice(0, Math.min(5, pron.length)).toUpperCase();
  if (hook.length < 3) hook = pron.toUpperCase();

  const scene = `Verilen senaryoda teknisyen "${hook} (${word.toUpperCase()})" diyerek seslenmekte ve doğrudan "${primaryTr}" parçasını işaret etmektedir. Bu hayali ses ve görsel ilişki İngilizce "${word.toUpperCase()}" kelimesinin "${primaryTr}" anlamına geldiğini size hatırlatacaktır.`;

  return {
    pron,
    hook,
    scene
  };
}

console.log("Generating phonetic sound-alike mnemonics for all words...");

const updatedWords = INITIAL_WORDS.map(w => {
  const m = generateMnemonic(w.english, w.turkish);
  return {
    ...w,
    phonetic: `/${m.pron}/`,
    pronunciationTr: m.pron,
    mnemonicHook: m.hook,
    mnemonicScene: m.scene,
    // Replace old long story with the rich Turkish mnemonic scenario
    storyTr: m.scene,
    storyEn: `Mnemonic: [${m.hook}] -> ${w.turkish.split(",")[0].trim()}`
  };
});

const outContent = `import { Word } from "@/types";

export const INITIAL_WORDS: Omit<Word, "id">[] = ${JSON.stringify(updatedWords, null, 2)};
`;

// Output goes to a separate file so the curated seedData.ts is never overwritten by accident.
// Note: words without a curated entry get a generic template scene; review before using them.
fs.writeFileSync("scripts/seedData.generated.ts", outContent, "utf-8");
console.log(`Wrote scripts/seedData.generated.ts (${updatedWords.length} words). Review before copying to src/lib/seedData.ts.`);

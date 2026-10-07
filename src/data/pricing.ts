export type PriceItem = {
  name: string;
  desc?: string;
  prices: string[];
  time?: string;
  badge?: string;
};
export type PriceCategory = { id: string; label: string; items: PriceItem[] };

export const lengthLegend = "R = do ramion · Ł = do łopatek · T = do talii · D = dłuższe";

export const pricing: PriceCategory[] = [
  {
    id: "rekonstrukcja",
    label: "Trwała rekonstrukcja 💚",
    items: [
      { name: "Nanobotoks – do 5 miesięcy", badge: "HIT naszych klientek", desc: "Wygładzenie i regeneracja włosów z efektem do 5 miesięcy.", prices: ["R 500 zł", "Ł 600 zł", "T 750 zł", "D 850 zł"], time: "3–4 h" },
      { name: "Bioplastia – do 6 miesięcy", desc: "Trwałe pożegnanie z puszeniem i elektryzowaniem, zachowuje naturalną objętość, nie zmienia koloru. Idealna dla włosów uwrażliwionych, cienkich, falowanych.", prices: ["R 590 zł", "Ł 690 zł", "T 850 zł", "D 950 zł"], time: "3–4 h" },
      { name: "Nanoplastia Basic – dla blondynek, do 6 miesięcy", desc: "Najmocniejszy zabieg z 19 aminokwasami, trwale prostuje nawet kręcone włosy.", prices: ["R 600 zł", "Ł 750 zł", "T 950 zł", "D 1100 zł"], time: "3–4,5 h" },
      { name: "Taninoplastia (vegan)", desc: "Roślinna alternatywa trwałej odbudowy włosa.", prices: ["R 600 zł", "Ł 750 zł", "T i dłuższe 950 zł"], time: "3–3 h 40 min" },
      { name: "Botoks organiczny", desc: "Brazylijski zabieg – głęboka regeneracja, redukcja objętości i puszenia.", prices: ["R 450 zł", "Ł 550 zł", "T 650 zł"], time: "2,5–3 h 20 min" },
      { name: "Kauteryzacja włosa", desc: "Ratunek dla najbardziej uwrażliwionych włosów, także po rozjaśnianiu.", prices: ["R 200 zł", "Ł 250 zł", "T 300 zł", "D 350 zł"], time: "2–3 h" },
      { name: "Rekonstrukcja – trudne przypadki / hybrydy", desc: "Konsultacja + czas na zabieg.", prices: ["cena indywidualna"], time: "3 h" },
      { name: "Nie wiem jaki zabieg", desc: "Konsultacja + czas na zabieg.", prices: ["cena indywidualna"], time: "3 h" },
    ],
  },
  {
    id: "koloryzacja",
    label: "Koloryzacja 🎨",
    items: [
      { name: "Air Touch | koloryzacje indywidualne", desc: "Najnowocześniejsze techniki dopasowane do Twojego stylu i urody.", prices: ["R 750 zł", "Ł 1100 zł", "T od 1400 zł"], time: "4–6,5 h" },
      { name: "Balejaż niteczkowy / pasemka / refleks + tonowanie", desc: "Zawiera odrost, tonowanie i modelowanie/loki/fale.", prices: ["R 550 zł", "Ł 650 zł", "T 750 zł"], time: "3 h" },
      { name: "Koloryzacja blond + tonowanie", desc: "Dekoloryzacja odrostu + tonowanie długości.", prices: ["R 450 zł", "Ł 590 zł", "T 650 zł"], time: "3–3,5 h" },
      { name: "Front blond | delikatne pojaśnienia", desc: "Do 10 folii, cena dla każdej długości.", prices: ["400 zł"], time: "2 h" },
      { name: "Koloryzacja wielotonowa (3D)", desc: "Min. dwa kolory bazowe – głębszy, naturalny efekt.", prices: ["R 350 zł", "Ł 450 zł", "T 550 zł"], time: "2 h" },
      { name: "Koloryzacja jednotonowa", desc: "Jednolity, równy kolor od nasady po końce.", prices: ["R 290 zł", "Ł 390 zł", "T 490 zł"], time: "2 h" },
      { name: "Dekoloryzacja + koloryzacja", desc: "Usunięcie sztucznych barwników i nałożenie nowego koloru. Wariant „dekoloryzacja poprzez zabieg rekonstrukcji” – cena indywidualna.", prices: ["Ł 850 zł", "T 1000 zł"], time: "4–4,5 h" },
      { name: "Odrost bez rozjaśniania", desc: "Odrost do 3 cm na ciemny kolor.", prices: ["pierwsza wizyta 350 zł", "stały klient 250 zł"], time: "2 h" },
      { name: "Tonowanie", desc: "Odświeżenie chłodnego blondu lub brązu, z myciem i modelowaniem.", prices: ["R 150 zł", "Ł 250 zł", "T 350 zł"], time: "1,5 h" },
      { name: "Kąpiel rozjaśniająca | oczyszczenie koloru 1 ton", desc: "Delikatne oczyszczenie koloru o jeden ton.", prices: ["R 150 zł", "za ramiona 200 zł"], time: "1 h" },
      { name: "Repigmentacja (dodatek do usługi)", desc: "Przywrócenie pigmentu przed koloryzacją.", prices: ["150 zł"], time: "45 min" },
      { name: "Nie wiem jaki kolor", desc: "Konsultacja + czas na wizytę.", prices: ["cena indywidualna"], time: "3 h" },
    ],
  },
  {
    id: "pielegnacja",
    label: "Pielęgnacja 🌱",
    items: [
      { name: "Rekonstrukcja Joico K-PAK ❄️", desc: "Najsilniejsza rekonstrukcja na zimno – dla włosów zniszczonych i łamliwych.", prices: ["150 zł"], time: "1 h" },
      { name: "Ampułka regeneracyjna ❄️", desc: "Ekspresowa kuracja dla włosów suchych i matowych.", prices: ["150 zł"], time: "1 h" },
      { name: "Maska na ciepło 🔥", desc: "Aminokwasy, białka, fibroina – odbudowa i ochrona koloru.", prices: ["150 zł"], time: "1 h" },
    ],
  },
  {
    id: "strzyzenie",
    label: "Strzyżenie ✂️",
    items: [
      { name: "Strzyżenie + mycie + modelowanie", desc: "Nowy kształt fryzury z pełną stylizacją.", prices: ["R 100 zł", "Ł i dłuższe 120 zł"], time: "40 min–1 h" },
      { name: "Podcięcie końcówek + mycie + modelowanie", desc: "Odświeżenie końcówek bez zmiany kształtu.", prices: ["R 99 zł", "Ł i dłuższe 110 zł"], time: "40 min–1 h" },
      { name: "Mycie + stylizacja / modelowanie", desc: "Z maską nawilżającą.", prices: ["R 80 zł", "Ł i dłuższe 100 zł"], time: "45–50 min" },
      { name: "Strzyżenie samej grzywki", desc: "Bez mycia.", prices: ["40 zł"], time: "15 min" },
    ],
  },
  {
    id: "czesanie",
    label: "Czesanie i makijaż 💄",
    items: [
      { name: "Makijaż + fryzura 2w1", desc: "Kompletna stylizacja na wyjątkową okazję.", prices: ["550 zł"], time: "1,5 h" },
      { name: "Fryzura okolicznościowa Basic", desc: "Prostowanie, karbowanie, loki, fale.", prices: ["200 zł"], time: "1 h" },
      { name: "Fryzura okolicznościowa Premium", desc: "Fale Hollywood, upięcia, koki, french twist, glamour.", prices: ["250 zł"], time: "1,5 h" },
      { name: "Makijaż dzienny / biznesowy", desc: "Naturalny, świeży look na co dzień.", prices: ["230 zł"], time: "1 h" },
      { name: "Makijaż okolicznościowy", desc: "Trwały makijaż na wieczór i uroczystości.", prices: ["280 zł"], time: "1,5 h" },
      { name: "Makijaż ślubny / próba", desc: "Makijaż dopasowany do Twojego wielkiego dnia.", prices: ["300 zł"], time: "1,5 h" },
      { name: "Fryzura próbna / ślubna w salonie", desc: "Fryzura ślubna wykonana w studiu.", prices: ["300 zł"], time: "2,5 h" },
      { name: "Fryzura ślubna + dojazd 👰", desc: "Zapraszamy do rezerwacji na sezon 2027.", prices: ["wycena indywidualna"] },
    ],
  },
  {
    id: "inne",
    label: "Konsultacja i inne",
    items: [
      { name: "Konsultacja (zabieg i/lub koloryzacja)", badge: "GRATIS", desc: "Test włosa i dobór najlepszego zabiegu.", prices: ["0 zł"], time: "15 min" },
      { name: "Termin VIP", desc: "Dowolna usługa poza godzinami pracy (przed 10:00 i po 20:00 pn–pt, weekendy i święta).", prices: ["+50% ceny usługi"] },
      { name: "Voucher prezentowy 🎁", desc: "Do każdego vouchera dodajemy 10% jego wartości!", prices: ["dowolna kwota"] },
    ],
  },
];

export type PriceVariant = {
  label?: string | undefined;
  /** Cena regularna (przekreślona), gdy usługa jest w promocji */
  old?: string | undefined;
  price: string;
  time?: string | undefined;
  /** Najniższa cena z 30 dni przed obniżką – wyliczana automatycznie w bazie (widok price_services_public) */
  lowest30?: number | string | undefined;
};
export type PriceItem = {
  name: string;
  desc?: string;
  badge?: string;
  /** Np. "-15%" */
  discount?: string;
  /** Zdjęcia efektów z public/cennik */
  images?: string[];
  variants: PriceVariant[];
};
export type PriceCategory = { id: string; label: string; items: PriceItem[] };

const img = (slug: string, count: number) =>
  Array.from({ length: count }, (_, i) => `/cennik/${slug}/${i + 1}.webp`);

const v = (label: string | undefined, old: string | undefined, price: string, time?: string): PriceVariant => ({
  label,
  old,
  price,
  time,
});

const strzyzenie: PriceItem = {
  name: "Strzyżenie damskie ✂️",
  images: img("strzyzenie", 3),
  desc: "Strzyżenie + mycie + modelowanie/stylizacja.",
  discount: "-15%",
  variants: [
    v("Strzyżenie samej grzywki BEZ MYCIA", "40,00 zł", "34,00 zł", "15 min"),
    v("Włosy do ramion", "100,00 zł", "85,00 zł", "40 min"),
    v("Włosy do łopatek i dłuższe", "120,00 zł", "102,00 zł", "1 h"),
  ],
};

const nieWiemZabieg: PriceItem = {
  name: "Nie wiem jaki zabieg",
  images: img("niewiemjaki", 3),
  desc: "Konsultacja + czas na zabieg.",
  variants: [v(undefined, undefined, "Cena zmienna", "3 h")],
};

const odrost: PriceItem = {
  name: "Odrost bez rozjaśniania",
  images: img("odrostbezrozjasniania", 3),
  desc: "Usługa zawiera koloryzację odrostu do 3 cm na ciemny kolor.",
  discount: "-15%",
  variants: [
    v("Pierwsza wizyta", "350,00 zł", "297,50 zł", "2 h"),
    v("Stały klient", "250,00 zł", "212,50 zł", "2 h"),
  ],
};

export const pricing: PriceCategory[] = [
  {
    id: "popularne",
    label: "Popularne usługi ⭐",
    items: [strzyzenie, nieWiemZabieg, odrost],
  },
  {
    id: "koloryzacja",
    label: "Koloryzacja i dekoloryzacja 🎨",
    items: [
      {
        name: "Nie wiem jaki kolor",
        images: img("niewiemjakikolor", 4),
        desc: "Konsultacja + czas przeznaczony na wizytę. Jeżeli nie wiesz, jaką koloryzację wybrać, ta usługa jest dla Ciebie :)",
        variants: [v(undefined, undefined, "Cena zmienna", "3 h")],
      },
      {
        name: "Tonowanie",
        images: img("tonowanie", 2),
        desc: "Jeżeli Twój blond nie jest już chłodnym blondem, brąz przechodzi w rudości, a jeszcze nie chcesz ponawiać koloryzacji permanentnej – ta usługa jest dla Ciebie! Usługa obejmuje tonowanie całej długości włosa, mycie i modelowanie.",
        discount: "-15%",
        variants: [
          v("Włosy do ramion", "150,00 zł", "127,50 zł", "1 h 30 min"),
          v("Włosy do łopatek", "250,00 zł", "212,50 zł", "1 h 30 min"),
          v("Włosy do talii", "350,00 zł", "297,50 zł", "1 h 30 min"),
        ],
      },
      odrost,
      {
        name: "Front blond | delikatne pojaśnienia",
        images: img("frontblond", 3),
        desc: "Nowoczesne rozjaśnienie frontów włosów do maksymalnej ilości 10 folii. Istnieje również możliwość rozłożenia pojaśnień, tak aby uzyskać delikatne rozjaśnienie całej fryzury. Cena jest taka sama dla każdej długości włosa.",
        discount: "-15%",
        variants: [v(undefined, "400,00 zł", "340,00 zł", "2 h")],
      },
      {
        name: "Balejaż niteczkowy | pasemka | refleks + tonowanie",
        images: img("balejazniteczkowy", 6),
        desc: "Wybierz tę usługę, jeżeli pragniesz rozjaśnić swoje włosy metodą całościową, pasemkami lub refleksami. W usługę wlicza się balejaż niteczkowy / refleksy / pojaśnienia min. 50% oraz odrost, tonowanie i modelowanie/loki/fale.",
        discount: "-15%",
        variants: [
          v("Włosy do ramion", "550,00 zł", "467,50 zł", "3 h"),
          v("Włosy do łopatek", "650,00 zł", "552,50 zł", "3 h"),
          v("Włosy do talii", "750,00 zł", "637,50 zł", "3 h"),
        ],
      },
      {
        name: "Koloryzacja blond + tonowanie",
        images: img("koloryzacjablond", 2),
        desc: "Usługa polega na dekoloryzacji odrostu oraz tonowaniu reszty włosa. Jeżeli chcesz zrobić również refleksy lub pojaśnienia – wybierz usługę POJAŚNIENIA.",
        discount: "-15%",
        variants: [
          v("Włosy do ramion", "450,00 zł", "382,50 zł", "3 h"),
          v("Włosy do łopatek", "590,00 zł", "501,50 zł", "3 h"),
          v("Włosy długie (do talii)", "650,00 zł", "552,50 zł", "3 h 30 min"),
        ],
      },
      {
        name: "Koloryzacja jednotonowa",
        images: img("koloryzacjajednotonowa", 1),
        desc: "Koloryzacja jednotonowa to pokrycie całych włosów farbą permanentną – jednym odcieniem farby po całej długości.",
        discount: "-15%",
        variants: [
          v("Włosy do ramion", "290,00 zł", "246,50 zł", "2 h"),
          v("Włosy do łopatek", "390,00 zł", "331,50 zł", "2 h"),
          v("Włosy do talii", "490,00 zł", "416,50 zł", "2 h"),
        ],
      },
      {
        name: "Koloryzacja wielotonowa",
        images: img("koloryzacjawielotonowa", 2),
        desc: "Koloryzacja wielotonowa (inaczej koloryzacja 3D) to technika, w której stosuje się co najmniej dwa kolory bazowe. Dzięki niej kolor jest głębszy, bardziej naturalny i nie jest „płaski”. W tej usłudze wliczamy również farbowanie odrostu na inny kolor niż reszta włosów po długości.",
        discount: "-15%",
        variants: [
          v("Włosy do ramion", "350,00 zł", "297,50 zł", "2 h"),
          v("Włosy do łopatek", "450,00 zł", "382,50 zł", "2 h"),
          v("Włosy do talii", "550,00 zł", "467,50 zł", "2 h"),
        ],
      },
      {
        name: "Air Touch | koloryzacje indywidualne",
        images: img("airtouch", 4),
        desc: "Najbardziej nowoczesne techniki koloryzacji dopasowane indywidualnie do Twojego stylu, urody oraz możliwości na włosach.",
        discount: "-15%",
        variants: [
          v("Włosy do ramion", "750,00 zł", "637,50 zł", "4 h"),
          v("Włosy do łopatek", "1 100,00 zł", "935,00 zł", "5 h"),
          v("Włosy do talii", "1 400,00 zł+", "1 190,00 zł+", "6 h 30 min"),
        ],
      },
      {
        name: "Dekoloryzacja + koloryzacja",
        images: img("dekoloryzacjakoloryzacja", 2),
        desc: "Dekoloryzacja znana jest też jako ściąganie koloru z włosów. Jest to zabieg usunięcia sztucznych barwników z wnętrza włosa – pigmentów wprowadzonych tam podczas koloryzacji. Po dekoloryzacji nakładana jest pożądana koloryzacja.",
        discount: "-15%",
        variants: [
          v("Dekoloryzacja poprzez zabieg rekonstrukcji", undefined, "Cena zmienna", "3 h 30 min"),
          v("Włosy do łopatek", "850,00 zł", "722,50 zł", "4 h"),
          v("Włosy do talii", "1 000,00 zł", "850,00 zł", "4 h 30 min"),
        ],
      },
      {
        name: "Kąpiel rozjaśniająca | oczyszczenie koloru 1 ton",
        desc: "Poszukujesz sposobu na delikatne rozjaśnienie włosów? Nie chcesz narażać ich na silne, inwazyjne zabiegi takie jak dekoloryzacja, ale zależy Ci na uzyskaniu choć trochę jaśniejszego koloru? Jeśli tak, pomoże Ci kąpiel rozjaśniająca.",
        discount: "-15%",
        variants: [
          v("Włosy do ramion", "150,00 zł", "127,50 zł", "1 h"),
          v("Włosy za ramiona", "200,00 zł", "170,00 zł", "1 h"),
        ],
      },
      {
        name: "Repigmentacja – dodatek do usługi",
        desc: "Repigmentacja to zabieg chemiczny, który polega na przywróceniu pigmentów utraconych podczas rozjaśniania i farbowania włosów. Może być stosowana także w przypadku bardzo jasnych włosów.",
        discount: "-15%",
        variants: [v(undefined, "150,00 zł", "127,50 zł", "45 min")],
      },
    ],
  },
  {
    id: "pielegnacja",
    label: "Pielęgnacja 🌱",
    items: [
      {
        name: "Ampułka regeneracyjna ❄️",
        images: img("ampulkaregeneracyjna", 3),
        desc: "Złota ampułka to ekspresowa kuracja do włosów suchych, matowych i zniszczonych, idealna także po zabiegach chemicznych.",
        discount: "-15%",
        variants: [v(undefined, "150,00 zł", "127,50 zł", "1 h")],
      },
      {
        name: "Rekonstrukcja Joico ❄️",
        images: img("rekonstrukcjajoico", 2),
        desc: "JOICO K-Pak – najlepsza dostępna rekonstrukcja na zimno na rynku – to silnie regenerująca kuracja przeznaczona do włosów zniszczonych, osłabionych i łamliwych. Wzmacnia pasma, poprawia ich kondycję i pomaga przywrócić elastyczność oraz połysk – efekty są widoczne już po pierwszym użyciu.",
        discount: "-15%",
        variants: [v(undefined, "150,00 zł", "127,50 zł", "1 h")],
      },
      {
        name: "Maska na ciepło 🔥",
        images: img("maskanacieplo", 1),
        desc: "Profesjonalna, odbudowująca maska do włosów, również po zabiegach chemicznych. Dzięki aminokwasom, białkom, fibroinie i nanokapsułkom intensywnie regeneruje włókna włosów, zapobiega łamliwości i chroni kolor. Idealna po koloryzacji, dekoloryzacji czy innych zabiegach chemicznych.",
        discount: "-15%",
        variants: [v(undefined, "150,00 zł", "127,50 zł", "1 h")],
      },
    ],
  },
  {
    id: "rekonstrukcja",
    label: "Trwała rekonstrukcja włosa 💚",
    items: [
      nieWiemZabieg,
      {
        name: "Rekonstrukcja włosów | trudne przypadki | hybrydy",
        images: img("rekonstrukcjatrudneprzypadki", 6),
        desc: "Konsultacja + czas na wykonanie zabiegu trwałej rekonstrukcji włosa.",
        variants: [v(undefined, undefined, "Cena zmienna", "3 h")],
      },
      {
        name: "Kauteryzacja włosa",
        images: img("kauteryzacjawlosa", 2),
        desc: "Zabieg to ratunek dla najbardziej uwrażliwionych włosów, również tych po procesie rozjaśniania, nieprzechodzących testu włosa.",
        discount: "-15%",
        variants: [
          v("Włosy do ramion", "200,00 zł", "170,00 zł", "2 h"),
          v("Włosy do łopatek", "250,00 zł", "212,50 zł", "2 h 30 min"),
          v("Włosy do talii", "300,00 zł", "255,00 zł", "2 h 30 min"),
          v("Włosy dłuższe", "350,00 zł", "297,50 zł", "3 h"),
        ],
      },
      {
        name: "Botoks organiczny",
        images: img("botoksorganiczny", 2),
        desc: "Btox Organic to zaawansowany, brazylijski zabieg kapilarny (botoks na włosy) stworzony z myślą o głębokiej regeneracji, redukcji objętości oraz eliminacji puszenia się pasm.",
        discount: "-15%",
        variants: [
          v("Włosy do ramion", "450,00 zł", "382,50 zł", "2 h 30 min"),
          v("Włosy do łopatek", "550,00 zł", "467,50 zł", "3 h"),
          v("Włosy do talii", "650,00 zł", "552,50 zł", "3 h 20 min"),
        ],
      },
      {
        name: "Nanobotoks – do 5 miesięcy",
        images: img("nanobotoks", 4),
        badge: "HIT naszych klientek 🤩",
        discount: "-15%",
        variants: [
          v("Włosy do ramion", "500,00 zł", "425,00 zł", "3 h"),
          v("Włosy do łopatek", "600,00 zł", "510,00 zł", "3 h 30 min"),
          v("Włosy do talii", "750,00 zł", "637,50 zł", "3 h 30 min"),
          v("Włosy dłuższe", "850,00 zł", "722,50 zł", "4 h"),
        ],
      },
      {
        name: "Bioplastia – do 6 miesięcy",
        images: img("bioplastia", 2),
        desc: "Kuracja przeciw puszeniu się włosa – dla włosów uwrażliwionych, niesfornych, plączących się czy cienkich, a także wysokoporowatych. Uszczelnia łuskę włosa, chroni przed uszkodzeniami mechanicznymi i optycznie pogrubia. To trwałe pożegnanie z puszeniem i elektryzowaniem – włosy nie reagują na zmianę pogody, a przy odpowiednio dobranych parametrach zachowują naturalną objętość. Zalecana również dla włosów falowanych, nie zmienia koloru.",
        discount: "-15%",
        variants: [
          v("Włosy do ramion", "590,00 zł", "501,50 zł", "3 h"),
          v("Włosy do łopatek", "690,00 zł", "586,50 zł", "3 h 30 min"),
          v("Włosy do talii", "850,00 zł", "722,50 zł", "3 h 30 min"),
          v("Włosy dłuższe", "950,00 zł", "807,50 zł", "4 h"),
        ],
      },
      {
        name: "Nanoplastia Basic | dla blondynek do 6 miesięcy",
        images: img("nanoplastia", 3),
        desc: "Najmocniejszy zabieg ze specjalnie opatentowaną formułą, wzbogaconą o 19 aminokwasów aktywnych. Trwale rozprostowuje włosy, NAWET kręcone, jednocześnie uszczelniając i odbudowując łodygę włosa.",
        discount: "-15%",
        variants: [
          v("Włosy do ramion", "600,00 zł", "510,00 zł", "3 h"),
          v("Włosy do łopatek", "750,00 zł", "637,50 zł", "3 h 30 min"),
          v("Włosy do talii", "950,00 zł", "807,50 zł", "4 h"),
          v("Włosy dłuższe", "1 100,00 zł", "935,00 zł", "4 h 30 min"),
        ],
      },
      {
        name: "Taninoplastia (vegan)",
        images: img("taninoplastiavegan", 2),
        desc: "Taniny – sekret zabiegu taninoplastii.",
        discount: "-15%",
        variants: [
          v("Włosy do ramion", "600,00 zł", "510,00 zł", "3 h"),
          v("Włosy do łopatek", "750,00 zł", "637,50 zł", "3 h 20 min"),
          v("Włosy do talii i dłuższe", "950,00 zł", "807,50 zł", "3 h 40 min"),
        ],
      },
    ],
  },
  {
    id: "strzyzenie",
    label: "Strzyżenie damskie ✂️",
    items: [
      {
        name: "Mycie + podcięcie końcówek + modelowanie",
        desc: "Usługa polega na umyciu włosów i podcięciu ich na prosto (same końcówki).",
        discount: "-15%",
        variants: [
          v("Włosy do ramion", "99,00 zł", "84,15 zł", "40 min"),
          v("Włosy do łopatek i dłuższe", "110,00 zł", "93,50 zł", "1 h"),
        ],
      },
      {
        name: "Mycie + stylizacja lub modelowanie",
        desc: "Mycie włosów, maska nawilżająca i suszenie z modelowaniem, prostowaniem lub stylizacja.",
        discount: "-15%",
        variants: [
          v("Włosy do ramion", "80,00 zł", "68,00 zł", "45 min"),
          v("Włosy do łopatek i dłuższe", "100,00 zł", "85,00 zł", "50 min"),
        ],
      },
      strzyzenie,
    ],
  },
  {
    id: "czesanie",
    label: "Czesanie i makijaż 💄",
    items: [
      {
        name: "🚀 Makijaż + fryzura 2w1",
        images: img("makijazfryzura", 15),
        desc: "Usługa 2w1, która pozwoli zaoszczędzić Ci czas w ważnym dla Ciebie dniu.",
        variants: [v(undefined, undefined, "550,00 zł", "1 h 30 min")],
      },
      {
        name: "Fryzura okolicznościowa Basic",
        images: img("fryzuraokolicznosciowabasic", 3),
        desc: "Czesanie prostych fryzur typu prostowanie, karbowanie, loki, fale. Pamiętaj, aby umyć głowę dzień wcześniej i nie nakładać zbyt mocno obciążających masek.",
        discount: "-10%",
        variants: [v(undefined, "200,00 zł", "180,00 zł", "1 h")],
      },
      {
        name: "Fryzura okolicznościowa Premium",
        images: img("fryzuraokolicznosciowapremium", 11),
        desc: "Czesanie fryzur typu: fale Hollywood, upięcia, półupięcia, french twist, koki, fale objętościowe, fryzury glamour.",
        discount: "-10%",
        variants: [v(undefined, "250,00 zł", "225,00 zł", "1 h 30 min")],
      },
      {
        name: "💄 Makijaż okolicznościowy | makijaż ślubny",
        images: img("makijazokolicznosciowy", 12),
        desc: "Profesjonalny makijaż dopasowany do indywidualnych potrzeb i typu urody – dzienny, wieczorowy oraz na specjalne okazje, takie jak śluby i sesje zdjęciowe. Używamy wyłącznie wysokiej jakości kosmetyków. Na wizytę zapraszamy bez makijażu, a dzień wcześniej warto zadbać o nawilżenie skóry.",
        discount: "-10%",
        variants: [
          v("Makijaż dzienny / biznesowy (delikatny, bez rzęs)", "230,00 zł", "207,00 zł", "1 h"),
          v("Makijaż okolicznościowy", "280,00 zł", "252,00 zł", "1 h 30 min"),
          v("Makijaż ślubny / próba", "300,00 zł", "270,00 zł", "1 h 30 min"),
        ],
      },
      {
        name: "👰‍♀️ Fryzura próbna | ślubna",
        images: img("fryzuraprobna", 14),
        desc: "Rezerwacja czasu na próbę ślubną lub pojedynczą fryzurę ślubną w salonie.",
        discount: "-10%",
        variants: [v(undefined, "300,00 zł", "270,00 zł", "2 h 30 min")],
      },
      {
        name: "Fryzura ślubna + dojazd 👰🤵‍♂️",
        images: img("fryzuraslubnadojazd", 16),
        desc: "Zapraszamy do rezerwowania miejsc na sezon 2027.",
        variants: [v(undefined, undefined, "Wycena indywidualna", "4 h")],
      },
    ],
  },
  {
    id: "konsultacja",
    label: "Konsultacja 🤔",
    items: [
      {
        name: "Konsultacja",
        badge: "Bezpłatna",
        desc: "Jeżeli nie jesteś przekonana, jaki zabieg lub kolor będzie dla Ciebie odpowiedni, zapraszamy na BEZPŁATNĄ I NIEZOBOWIĄZUJĄCĄ konsultację z naszym specjalistą od zabiegów i koloryzacji.",
        variants: [
          v("Konsultacja (zabieg i/lub koloryzacja)", undefined, "Darmowa", "15 min"),
          v("Konsultacja (koloryzacja)", undefined, "Darmowa", "15 min"),
        ],
      },
      {
        name: "Termin VIP +50%",
        desc: "Dowolna usługa w dogodnym dla Ciebie terminie – poza godzinami pracy salonu (przed 10:00 i po 20:00 od pon. do pt. oraz w weekendy i święta).",
        variants: [v(undefined, undefined, "Cena zmienna")],
      },
    ],
  },
  {
    id: "vouchery",
    label: "Vouchery prezentowe 🎁",
    items: [
      {
        name: "Voucher",
        images: img("voucher", 1),
        desc: "Do każdego vouchera dodajemy 10% jego wartości!",
        variants: [v(undefined, undefined, "Cena zmienna")],
      },
    ],
  },
];

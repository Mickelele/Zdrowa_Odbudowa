import cennik from "@/data/cennik.json";

/**
 * Dane strukturalne (schema.org, JSON-LD) dla Google: salon jako lokalna firma (HairSalon)
 * z adresem, współrzędnymi, godzinami, obszarem obsługi i cennikiem usług z Booksy.
 * Sprawdzenie: https://search.google.com/test/rich-results oraz https://validator.schema.org
 */

export const SALON = {
  name: "Zdrowa Odbudowa",
  legalName: "Zdrowa Odbudowa – studio koloryzacji i rekonstrukcji włosa",
  phone: "+48796764768",
  street: "ul. Księdza Marcina Załuskiego 73, lokal 1",
  postalCode: "05-230",
  city: "Kobyłka",
  region: "mazowieckie",
  // współrzędne z profilu salonu na Booksy
  lat: 52.342028880441326,
  lng: 21.216234795815208,
  areaServed: ["Kobyłka", "Warszawa", "Zielonka", "Wołomin", "Marki", "Ząbki", "Legionowo", "Radzymin"],
  sameAs: [
    "https://www.facebook.com/profile.php?id=61573410756665",
    "https://www.instagram.com/zdrowaodbudowawlosa",
    "https://booksy.com/pl-pl/285951_zdrowa-odbudowa_fryzjer_4285_kobylka",
  ],
} as const;

type Wariant = { nazwa: string | null; cena: number | null; cenaPromo: number | null };
type Data = { kategorie: { nazwa: string; uslugi: { nazwa: string; opis: string | null; warianty: Wariant[] }[] }[] };
const data = cennik as unknown as Data;

const plain = (s: string) => s.replace(/[\p{Extended_Pictographic}️‍]/gu, "").replace(/\s+/g, " ").trim();
const titleCase = (s: string) => plain(s).toLowerCase().replace(/^\p{L}/u, (c) => c.toUpperCase());
const current = (w: Wariant) => w.cenaPromo ?? w.cena;

const allPrices = data.kategorie.flatMap((k) => k.uslugi.flatMap((u) => u.warianty.map(current))).filter((n): n is number => n != null);
export const priceRange = allPrices.length ? `${Math.min(...allPrices)}–${Math.max(...allPrices)} zł` : undefined;

function offerCatalog() {
  return {
    "@type": "OfferCatalog",
    name: "Cennik usług",
    itemListElement: data.kategorie.map((k) => ({
      "@type": "OfferCatalog",
      name: titleCase(k.nazwa),
      itemListElement: k.uslugi.map((u) => {
        const prices = u.warianty.map(current).filter((n): n is number => n != null);
        const service = { "@type": "Service", name: titleCase(u.nazwa) };
        if (!prices.length) return { "@type": "Offer", itemOffered: service };
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        return {
          "@type": "Offer",
          itemOffered: service,
          priceCurrency: "PLN",
          ...(min === max
            ? { price: min }
            : { priceSpecification: { "@type": "PriceSpecification", priceCurrency: "PLN", minPrice: min, maxPrice: max } }),
        };
      }),
    })),
  };
}

export function structuredData(origin: string, shareImage: string) {
  const id = `${origin}/#salon`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "HairSalon",
        "@id": id,
        name: SALON.name,
        alternateName: SALON.legalName,
        description:
          "Studio koloryzacji i trwałej rekonstrukcji włosa w Kobyłce koło Warszawy: nanoplastia, bioplastia, botoks, taninoplastia, Air Touch, dekoloryzacja, czesanie i makijaż ślubny.",
        url: `${origin}/`,
        logo: `${origin}/logo.png`,
        image: [shareImage, `${origin}/salon/lustra.webp`, `${origin}/salon/wnetrze-1.webp`],
        telephone: SALON.phone,
        priceRange,
        currenciesAccepted: "PLN",
        paymentAccepted: "Gotówka, karta płatnicza",
        address: {
          "@type": "PostalAddress",
          streetAddress: SALON.street,
          postalCode: SALON.postalCode,
          addressLocality: SALON.city,
          addressRegion: SALON.region,
          addressCountry: "PL",
        },
        geo: { "@type": "GeoCoordinates", latitude: SALON.lat, longitude: SALON.lng },
        hasMap: `https://www.google.com/maps?q=${SALON.lat},${SALON.lng}`,
        areaServed: SALON.areaServed.map((name) => ({ "@type": "City", name })),
        openingHoursSpecification: [
          { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday"], opens: "10:00", closes: "20:00" },
          { "@type": "OpeningHoursSpecification", dayOfWeek: ["Wednesday", "Thursday", "Friday"], opens: "09:00", closes: "21:00" },
          { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "09:00", closes: "15:00" },
        ],
        sameAs: SALON.sameAs,
        potentialAction: {
          "@type": "ReserveAction",
          target: { "@type": "EntryPoint", urlTemplate: SALON.sameAs[2], actionPlatform: ["http://schema.org/DesktopWebPlatform", "http://schema.org/MobileWebPlatform"] },
          name: "Zarezerwuj wizytę na Booksy",
        },
        hasOfferCatalog: offerCatalog(),
      },
      {
        "@type": "WebSite",
        "@id": `${origin}/#website`,
        url: `${origin}/`,
        name: SALON.name,
        inLanguage: "pl-PL",
        publisher: { "@id": id },
      },
    ],
  };
}

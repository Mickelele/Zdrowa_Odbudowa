import type { PriceCategory, PriceVariant } from "@/data/pricing";
import cennik from "@/data/cennik.json";

/**
 * Cennik na stronę – z pliku src/data/cennik.json, który codziennie o 6:00 aktualizuje
 * GitHub Action (scripts/fetch-booksy.mjs) na podstawie profilu salonu na Booksy.
 */

type Wariant = {
  nazwa: string | null;
  cena: number | null;
  cenaPromo: number | null;
  najnizszaCena30d: number | null;
  cenaTekst: string | null;
  odCeny: boolean;
  czasMin: number | null;
};
type Usluga = { nazwa: string; opis: string | null; warianty: Wariant[]; zdjecia?: string[] };
type Cennik = { aktualizacja: string; zrodlo: string; kategorie: { nazwa: string; uslugi: Usluga[] }[] };

const data = cennik as Cennik;

/** 1400 → "1400 zł", 297.5 → "297,50 zł" (bez groszy, gdy są zerowe) */
export function formatZl(n: number) {
  const whole = Number.isInteger(n);
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  }).format(n);
}

/** 90 → "1 h 30 min" */
function formatTime(min: number | null) {
  if (!min) return undefined;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return [h && `${h} h`, m && `${m} min`].filter(Boolean).join(" ");
}

/** "TRWAŁA REKONSTRUKCJA WŁOSA 💚" → "trwala-rekonstrukcja-wlosa" */
function slug(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[łŁ]/g, "l")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Opis z Booksy jest w Markdownie (**pogrubienie**, "*   punkt") – zostawiamy sam tekst z akapitami. */
function cleanDescription(s: string | null) {
  if (!s) return undefined;
  return s
    .replace(/\*\*/g, "")
    .replace(/^\s*[*-]\s+/gm, "• ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function toVariant(w: Wariant): PriceVariant {
  const time = formatTime(w.czasMin);
  if (w.cenaTekst || w.cena == null) return { label: w.nazwa ?? undefined, price: w.cenaTekst ?? "Wycena indywidualna", time };
  const od = w.odCeny ? "od " : "";
  const promo = w.cenaPromo != null && w.cenaPromo < w.cena;
  return {
    label: w.nazwa ?? undefined,
    price: od + formatZl(promo ? w.cenaPromo! : w.cena),
    old: promo ? od + formatZl(w.cena) : undefined,
    // dyrektywa Omnibus: przy obniżce pokazujemy najniższą cenę z 30 dni przed obniżką
    lowest30: promo ? formatZl(w.najnizszaCena30d ?? w.cena) : undefined,
    time,
  };
}

/** Największy rabat w usłudze, np. "-15%" */
function discountOf(warianty: Wariant[]) {
  const rates = warianty
    .filter((w) => w.cena && w.cenaPromo != null && w.cenaPromo < w.cena)
    .map((w) => Math.round((1 - w.cenaPromo! / w.cena!) * 100));
  return rates.length ? `-${Math.max(...rates)}%` : undefined;
}

export const booksyPricing: PriceCategory[] = data.kategorie.map((k) => ({
  id: slug(k.nazwa),
  label: k.nazwa,
  items: k.uslugi.map((u) => {
    const desc = cleanDescription(u.opis);
    const discount = discountOf(u.warianty);
    return {
      name: u.nazwa,
      ...(desc && { desc }),
      ...(discount && { discount }),
      images: u.zdjecia ?? [],
      variants: u.warianty.map(toVariant),
    };
  }),
}));

/** "2026-10-15T06:00:00+02:00" → "15.10.2026" */
export const pricingUpdatedAt = data.aktualizacja.slice(0, 10).split("-").reverse().join(".");
export const pricingSource = data.zrodlo;

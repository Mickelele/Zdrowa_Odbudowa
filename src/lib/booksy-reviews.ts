import { createServerFn } from "@tanstack/react-start";

/**
 * Opinie z Booksy. Booksy nie ma publicznego API, więc czytamy dane, które ich strona
 * profilu osadza w HTML (blok __NUXT_DATA__): 10 najnowszych opinii + statystyki.
 * Gdy Booksy zmieni stronę albo nie odpowie, zwracamy null i strona pokazuje wartości zapasowe.
 */

const BOOKSY_PROFILE = "https://booksy.com/pl-pl/285951_zdrowa-odbudowa_fryzjer_4285_kobylka";
const CACHE_MS = 6 * 60 * 60 * 1000; // 6 h
const MIN_STARS = 4;
const MAX_REVIEWS = 6;

export type BooksyReview = {
  id: number;
  name: string;
  stars: number;
  text: string;
  date: string;
  service?: string;
  staff?: string;
  reply?: string;
};

export type BooksyReviews = {
  rating: number;
  count: number;
  reviews: BooksyReview[];
  fetchedAt: string;
};

let cache: { at: number; data: BooksyReviews } | null = null;

/** Rozwija format "devalue" używany przez Nuxt: tablica, w której obiekty wskazują indeksy innych elementów. */
function reviveNuxtData(arr: unknown[]) {
  const memo = new Map<number, unknown>();
  const WRAPPERS = new Set(["Reactive", "ShallowReactive", "Ref", "ShallowRef", "NuxtError"]);

  const revive = (i: number, depth = 0): unknown => {
    if (i < 0) return null; // -1 undefined, -2 null, -3 NaN…
    if (memo.has(i)) return memo.get(i);
    if (depth > 40) return null;
    const v = arr[i];
    if (Array.isArray(v)) {
      if (typeof v[0] === "string" && WRAPPERS.has(v[0])) return revive(v[1] as number, depth + 1);
      if (v[0] === "Date") return v[1];
      if (v[0] === "Set" || v[0] === "Map" || v[0] === "EmptyRef" || v[0] === "EmptyShallowRef") return null;
      const out: unknown[] = [];
      memo.set(i, out);
      for (const x of v) out.push(typeof x === "number" ? revive(x, depth + 1) : x);
      return out;
    }
    if (v && typeof v === "object") {
      const out: Record<string, unknown> = {};
      memo.set(i, out);
      for (const [k, x] of Object.entries(v)) out[k] = typeof x === "number" ? revive(x, depth + 1) : x;
      return out;
    }
    return v;
  };
  return revive;
}

type RawReview = {
  id: number;
  rank: number;
  review?: string;
  created?: string;
  replyContent?: string | null;
  user?: { firstName?: string };
  services?: { name?: string }[];
  staff?: { name?: string }[];
};

function parseBooksyHtml(html: string): BooksyReviews | null {
  const m = html.match(/<script[^>]*id="__NUXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m?.[1]) return null;
  const arr = JSON.parse(m[1]) as unknown[];
  const revive = reviveNuxtData(arr);

  const pageIndex = arr.findIndex((v) => v !== null && typeof v === "object" && !Array.isArray(v) && "reviewsPage" in v && "reviews" in v);
  if (pageIndex < 0) return null;
  const page = revive(pageIndex) as { reviews?: RawReview[]; reviewsRank?: number; reviewsCount?: number };
  if (!Array.isArray(page.reviews) || typeof page.reviewsRank !== "number") return null;

  const clean = (s?: string | null) => (s ?? "").trim();
  const reviews = page.reviews
    .filter((r) => r && r.rank >= MIN_STARS && clean(r.review).length > 0)
    .slice(0, MAX_REVIEWS)
    .map((r) => {
      const out: BooksyReview = {
        id: r.id,
        name: clean(r.user?.firstName) || "Klient Booksy",
        stars: r.rank,
        text: clean(r.review),
        date: (r.created ?? "").slice(0, 10),
      };
      const service = clean(r.services?.[0]?.name).replace(/\s*\|\s*$/, "");
      if (service) out.service = service;
      const staff = clean(r.staff?.[0]?.name);
      if (staff) out.staff = staff;
      const reply = clean(r.replyContent);
      if (reply) out.reply = reply;
      return out;
    });

  return {
    rating: Math.round(page.reviewsRank * 10) / 10,
    count: page.reviewsCount ?? 0,
    reviews,
    fetchedAt: new Date().toISOString(),
  };
}

export const getBooksyReviews = createServerFn({ method: "GET" }).handler(async (): Promise<BooksyReviews | null> => {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.data;
  try {
    const res = await fetch(BOOKSY_PROFILE, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ZdrowaOdbudowa-site/1.0)",
        "Accept-Language": "pl-PL,pl;q=0.9",
      },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`Booksy HTTP ${res.status}`);
    const data = parseBooksyHtml(await res.text());
    if (!data) throw new Error("Nie znaleziono opinii w odpowiedzi Booksy");
    cache = { at: Date.now(), data };
    return data;
  } catch (e) {
    console.error("Nie udało się pobrać opinii z Booksy:", e);
    return cache?.data ?? null; // starsze dane są lepsze niż żadne
  }
});

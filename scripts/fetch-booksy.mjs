#!/usr/bin/env node
/**
 * Pobiera cennik salonu z Booksy i zapisuje go do src/data/cennik.json.
 *
 *   node scripts/fetch-booksy.mjs
 *
 * Booksy renderuje stronę po stronie serwera (Nuxt) i osadza cały stan w <script id="__NUXT_DATA__">,
 * więc czytamy uporządkowany JSON zamiast DOM-u – to dużo stabilniejsze niż selektory CSS.
 *
 * Zmienne środowiskowe (do testów):
 *   BOOKSY_HTML_FILE – zamiast pobierać stronę, wczytaj HTML z pliku
 *   CENNIK_OUT       – inna ścieżka pliku wynikowego (domyślnie src/data/cennik.json)
 *
 * Kończy się błędem (exit 1) i NIE nadpisuje pliku, gdy dane wyglądają na zepsute.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const BOOKSY_URL = "https://booksy.com/pl-pl/285951_zdrowa-odbudowa_fryzjer_4285_kobylka";
const OUT = resolve(ROOT, process.env.CENNIK_OUT ?? "src/data/cennik.json");
const PHOTO_MAP = resolve(ROOT, "scripts/booksy-zdjecia.json");

const MIN_SHARE_OF_PREVIOUS = 0.7;
const MAX_PRICE = 5000;

const fail = (msg) => {
  console.error(`✖ ${msg}`);
  console.error("Plik cennika NIE został zmieniony.");
  process.exit(1);
};

// ---------- pobranie ----------

async function loadHtml() {
  if (process.env.BOOKSY_HTML_FILE) return readFile(process.env.BOOKSY_HTML_FILE, "utf8");
  const res = await fetch(BOOKSY_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
      "Accept-Language": "pl-PL,pl;q=0.9",
      Accept: "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(30_000),
  });
  if (res.status !== 200) fail(`Booksy odpowiedziało HTTP ${res.status}`);
  return res.text();
}

// ---------- odczyt danych Nuxt (format "devalue": obiekty wskazują indeksy innych elementów tablicy) ----------

function reviveNuxtData(arr) {
  const memo = new Map();
  const WRAPPERS = new Set(["Reactive", "ShallowReactive", "Ref", "ShallowRef", "NuxtError"]);
  const revive = (i, depth = 0) => {
    if (typeof i !== "number" || i < 0) return null; // -1 undefined, -2 null…
    if (memo.has(i)) return memo.get(i);
    if (depth > 60) return null;
    const v = arr[i];
    if (Array.isArray(v)) {
      if (typeof v[0] === "string" && WRAPPERS.has(v[0])) return revive(v[1], depth + 1);
      if (v[0] === "Date") return v[1];
      if (["Set", "Map", "EmptyRef", "EmptyShallowRef"].includes(v[0])) return null;
      const out = [];
      memo.set(i, out);
      for (const x of v) out.push(typeof x === "number" ? revive(x, depth + 1) : x);
      return out;
    }
    if (v && typeof v === "object") {
      const out = {};
      memo.set(i, out);
      for (const [k, x] of Object.entries(v)) out[k] = typeof x === "number" ? revive(x, depth + 1) : x;
      return out;
    }
    return v;
  };
  return revive;
}

function findBusiness(html) {
  const m = html.match(/<script[^>]*id="__NUXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) fail("Nie znaleziono danych strony (__NUXT_DATA__) – Booksy mogło zmienić stronę.");
  let arr;
  try {
    arr = JSON.parse(m[1]);
  } catch {
    fail("Dane strony (__NUXT_DATA__) nie są poprawnym JSON-em.");
  }
  const idx = arr.findIndex((v) => v && typeof v === "object" && !Array.isArray(v) && "serviceCategories" in v);
  if (idx < 0) fail("W danych strony nie ma listy usług (serviceCategories).");
  return reviveNuxtData(arr)(idx);
}

// ---------- konwersje ----------

/** "1 400,00 zł+" (także z twardą spacją) → 1400 */
export function parsePrice(text) {
  if (typeof text !== "string" || !/\d/.test(text)) return null;
  const n = Number(text.replace(/[^\d,]/g, "").replace(",", "."));
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
}

/** "1g 30min" → 90, "45min" → 45, "3g" → 180 (gdy Booksy podaje tekst zamiast liczby) */
export function parseDuration(value) {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return null;
  const h = value.match(/(\d+)\s*(?:g|h)/i);
  const m = value.match(/(\d+)\s*min/i);
  if (!h && !m) return null;
  return (h ? Number(h[1]) * 60 : 0) + (m ? Number(m[1]) : 0);
}

const PRICE_TEXT = { F: "Bezpłatna", V: "Zmienna", D: "Wycena indywidualna" };
const TEXT_BY_LABEL = { darmowa: "Bezpłatna", zmienna: "Zmienna", "-": "Wycena indywidualna" };

function convertVariant(v, problems, where) {
  const label = typeof v.label === "string" && v.label.trim() ? v.label.trim() : null;
  const shown = typeof v.servicePrice === "string" ? v.servicePrice.trim() : "";
  const textual = PRICE_TEXT[v.type] ?? TEXT_BY_LABEL[shown.toLowerCase()];

  const regular = typeof v.price === "number" ? v.price : parsePrice(shown);
  const promo = parsePrice(v.promotion?.price?.formattedPrice);
  const lowest = parsePrice(v.omnibusPrice);

  const out = {
    nazwa: label,
    cena: textual ? null : regular,
    cenaPromo: textual ? null : promo,
    najnizszaCena30d: !textual && promo != null ? (lowest ?? regular) : null,
    cenaTekst: textual ?? null,
    odCeny: v.type === "S" || shown.endsWith("+"),
    czasMin: parseDuration(v.duration),
  };
  if (!out.cenaTekst && out.cena == null) problems.push(`${where}${label ? ` / ${label}` : ""}: nieznany format ceny "${shown}" (typ ${v.type})`);
  return out;
}

// ---------- czas Europe/Warsaw ----------

function warsawIso(date = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Warsaw",
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
      hourCycle: "h23", timeZoneName: "longOffset",
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  );
  const offset = parts.timeZoneName.replace("GMT", "") || "+00:00";
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}${offset}`;
}

// ---------- główna logika ----------

async function main() {
  const html = await loadHtml();
  const biz = findBusiness(html);
  const photoMap = existsSync(PHOTO_MAP) ? JSON.parse(await readFile(PHOTO_MAP, "utf8")) : {};

  const problems = [];
  const kategorie = (biz.serviceCategories ?? [])
    // "Popularne usługi" to osobna lista (topServices) z duplikatami – nie trafia do serviceCategories
    .filter((c) => c && Array.isArray(c.services))
    .map((c) => ({
      nazwa: String(c.name ?? "").trim(),
      uslugi: c.services
        .filter((s) => s && s.name)
        .map((s) => {
          const where = `${String(c.name).trim()} › ${String(s.name).trim()}`;
          const variants = Array.isArray(s.variants) ? s.variants : [];
          if (variants.length === 0) problems.push(`${where}: brak wariantów`);
          const zdjecia = (s.photos ?? [])
            .slice()
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((p) => {
              const hash = String(p.url ?? "").split("/").pop()?.replace(/\.\w+$/, "") ?? "";
              return photoMap[hash] ?? p.url; // lokalna, zmniejszona kopia albo oryginał z Booksy
            })
            .filter(Boolean);
          return {
            nazwa: String(s.name).trim(),
            opis: typeof s.description === "string" && s.description.trim() ? s.description.trim() : null,
            warianty: variants.map((v) => convertVariant(v, problems, where)),
            zdjecia,
          };
        }),
    }))
    .filter((c) => c.nazwa && c.uslugi.length > 0);

  // ---------- zabezpieczenia ----------
  if (kategorie.length === 0) fail("Nie znaleziono żadnej kategorii usług.");
  const serviceCount = kategorie.reduce((n, c) => n + c.uslugi.length, 0);

  for (const c of kategorie)
    for (const s of c.uslugi)
      for (const v of s.warianty)
        for (const [field, value] of [["cena", v.cena], ["cenaPromo", v.cenaPromo], ["najnizszaCena30d", v.najnizszaCena30d]])
          if (value != null && (value <= 0 || value > MAX_PRICE))
            fail(`Podejrzana cena ${field}=${value} zł w "${c.nazwa} › ${s.nazwa}${v.nazwa ? ` / ${v.nazwa}` : ""}".`);

  let previous = null;
  if (existsSync(OUT)) {
    try {
      previous = JSON.parse(await readFile(OUT, "utf8"));
    } catch {
      console.warn("! Poprzedni plik cennika jest nieczytelny – pomijam porównanie.");
    }
  }
  const previousCount = previous?.kategorie?.reduce((n, c) => n + (c.uslugi?.length ?? 0), 0) ?? 0;
  if (previousCount > 0 && serviceCount < previousCount * MIN_SHARE_OF_PREVIOUS)
    fail(`Sparsowano tylko ${serviceCount} usług, a poprzednio było ${previousCount} (minimum ${Math.ceil(previousCount * MIN_SHARE_OF_PREVIOUS)}).`);

  // ---------- zapis (tylko gdy zmieniła się treść) ----------
  const content = { zrodlo: BOOKSY_URL, kategorie };
  const same = previous && JSON.stringify({ zrodlo: previous.zrodlo, kategorie: previous.kategorie }) === JSON.stringify(content);

  console.log(`✔ Kategorie: ${kategorie.length}, usługi: ${serviceCount}, warianty: ${kategorie.reduce((n, c) => n + c.uslugi.reduce((m, s) => m + s.warianty.length, 0), 0)}`);
  if (problems.length) {
    console.log("! Nie udało się w pełni sparsować:");
    for (const p of problems) console.log(`  - ${p}`);
  }

  if (same) {
    console.log("= Cennik bez zmian – plik nie został zapisany.");
    return;
  }
  const data = { aktualizacja: warsawIso(), ...content };
  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(`✔ Zapisano ${OUT}`);
}

main().catch((e) => fail(e?.stack ?? String(e)));

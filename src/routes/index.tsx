import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Sparkles, Palette, Scissors, Leaf, Heart, Gift, Microscope, Droplets, Gem, ShieldCheck, Home,
  Phone, MapPin, Clock, Menu, X, Star, Facebook, Instagram, Navigation, CalendarHeart, Lock,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
const LOGO = "/logo.png";
import { formatPln, loadPricing } from "@/lib/pricing-db";
import type { PriceItem } from "@/data/pricing";
import { getBooksyReviews } from "@/lib/booksy-reviews";

const BOOKSY = "https://zdrowaodbudowa.booksy.com/a";
const FRESHA = "https://www.fresha.com/pl/a/zdrowa-odbudowa-studio-koloryzacji-i-rekonstrukcji-wlosa-kobylka-ksiedza-marcina-zaluskiego-73-xnra11q1";
const FB = "https://www.facebook.com/profile.php?id=61573410756665";
const IG = "https://www.instagram.com/zdrowaodbudowawlosa";
const GLOW_IG = "https://www.instagram.com/hairxmakeup_glowteam";
const TEL = "tel:+48796764768";
const MAPS = "https://maps.google.com/maps?q=Ksi%C4%99dza%20Marcina%20Za%C5%82uskiego%2073%2C%20Koby%C5%82ka&t=m&z=15&output=embed";
const ROUTE = "https://www.google.com/maps/dir/?api=1&destination=Ksi%C4%99dza%20Marcina%20Za%C5%82uskiego%2073%2C%2005-230%20Koby%C5%82ka";
const W = "https://zdrowaodbudowa.beauty-flow.pl/wp-content/uploads/";

// Zdjęcia do karuzeli "Galeria efektów" – wybrane z public/cennik (włosy na środku kadru).
const effects = [
  "airtouch/1", "balejazniteczkowy/3", "niewiemjakikolor/2", "tonowanie/1", "airtouch/4", "koloryzacjawielotonowa/2",
  "balejazniteczkowy/5", "odrostbezrozjasniania/3", "frontblond/1", "nanoplastia/2", "airtouch/3", "niewiemjakikolor/4",
  "balejazniteczkowy/2", "nanobotoks/1", "tonowanie/2", "botoksorganiczny/2", "koloryzacjablond/1", "odrostbezrozjasniania/2",
  "niewiemjakikolor/3", "dekoloryzacjakoloryzacja/1",
].map((p) => `/cennik/${p}.webp`);
const salon = [
  W + "2025/03/IMG_8055-807x1024.jpg", W + "2025/02/IMG_DDD0E2481025-1-scaled-e1740763085948-772x1024.jpeg",
  "https://images.fresha.com/locations/location-profile-images/3085242/6711026/e94265ed-d0f2-404d-867c-9b86f68c10fa-ZDROWAODBUDOWA-PL-WojewdztwoMazowieckie-Kobyka-Fresha.jpg",
  "https://images.fresha.com/locations/location-profile-images/3085242/6711027/577c1ec8-671e-4e08-ab08-d50e159837c2-ZDROWAODBUDOWA-PL-WojewdztwoMazowieckie-Kobyka-Fresha.jpg",
  "https://images.fresha.com/locations/location-profile-images/3085242/6711028/d0f21c45-e193-4b62-9ae6-6ca694699d8b-ZDROWAODBUDOWA-PL-WojewdztwoMazowieckie-Kobyka-Fresha.jpg",
];
const team = [
  { name: "Edyta", role: "fryzury okolicznościowe, zabiegi na włosy", photo: "/zespol/edyta.webp" },
  { name: "Agnieszka", role: "koloryzacja, blond, strzyżenie", photo: "/zespol/agnieszka.webp" },
  { name: "Malwina", role: "treatmentolog", photo: "/zespol/malwina.webp" },
  { name: "Aneta", role: "makijaż", photo: "/zespol/aneta.webp" },
];
const HERO = W + "2025/02/SAD_7070-682x1024.jpg";

/** Używane, gdy nie uda się pobrać danych z Booksy. */
const FALLBACK_RATING = { rating: 4.9, count: 271 };

const formatRating = (n: number) => n.toLocaleString("pl-PL", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const formatReviewDate = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" });
};

const TITLE = "Zdrowa Odbudowa – rekonstrukcja i koloryzacja włosów | Kobyłka";
const DESC = "Studio koloryzacji i rekonstrukcji włosa w Kobyłce. Nanoplastia, keratyna, bioplastia, botoks, Air Touch. Bezpłatna konsultacja – zarezerwuj na Booksy.";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HairSalon",
  name: "Zdrowa Odbudowa – studio koloryzacji i rekonstrukcji włosa",
  image: HERO,
  telephone: "+48796764768",
  address: { "@type": "PostalAddress", streetAddress: "ul. Księdza Marcina Załuskiego 73, lokal 1", postalCode: "05-230", addressLocality: "Kobyłka", addressCountry: "PL" },
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday"], opens: "10:00", closes: "20:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Wednesday", "Thursday", "Friday"], opens: "09:00", closes: "21:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "09:00", closes: "15:00" },
  ],
  sameAs: [FB, IG, BOOKSY],
};

export const Route = createFileRoute("/")({
  loader: async () => {
    const [pricing, booksy] = await Promise.all([loadPricing(), getBooksyReviews()]);
    return { pricing, booksy };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:image", content: HERO },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: HERO },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          ...jsonLd,
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: String(loaderData?.booksy?.rating ?? FALLBACK_RATING.rating),
            reviewCount: String(loaderData?.booksy?.count ?? FALLBACK_RATING.count),
          },
        }),
      },
    ],
  }),
  component: Index,
});

const ext = { target: "_blank", rel: "noopener" } as const;

function Btn({ href, children, variant = "solid", external = true }: { href: string; children: ReactNode; variant?: "solid" | "outline"; external?: boolean }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-narrow text-xl tracking-wide uppercase transition-colors";
  const v = variant === "solid"
    ? "bg-primary text-primary-foreground hover:bg-primary-hover"
    : "border border-primary text-primary hover:bg-primary hover:text-primary-foreground";
  return <a href={href} className={`${base} ${v}`} {...(external ? ext : {})}>{children}</a>;
}

function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`reveal ${className}`}>{children}</div>;
}

/** Usuwa emoji z nazw – w cenniku wyglądają elegancko bez nich. */
const plain = (s: string) => s.replace(/[\p{Extended_Pictographic}️‍]/gu, "").replace(/\s{2,}/g, " ").trim();

function PriceEntry({ item, onOpenImages }: { item: PriceItem; onOpenImages: (index: number) => void }) {
  const [expanded, setExpanded] = useState(false);
  const images = item.images ?? [];
  const longDesc = (item.desc?.length ?? 0) > 170;

  return (
    <article className="mb-12 break-inside-avoid last:mb-0">
      <div>
        <div className="flex items-start justify-between gap-3">
          <h4 className="font-display text-lg uppercase leading-snug tracking-wide text-primary md:text-xl">{plain(item.name)}</h4>
          {item.discount && (
            <span className="mt-0.5 shrink-0 rounded-full border border-primary/40 px-2.5 py-0.5 font-narrow text-sm tracking-wider text-primary">
              {item.discount}
            </span>
          )}
        </div>
        {item.badge && <p className="mt-1 font-narrow text-sm uppercase tracking-[0.2em] text-primary/80">✦ {plain(item.badge)}</p>}
        {item.desc && (
          <div className="mt-1.5">
            <p className={`text-sm leading-relaxed text-muted-foreground ${longDesc && !expanded ? "line-clamp-3" : ""}`}>{plain(item.desc)}</p>
            {longDesc && (
              <button onClick={() => setExpanded((e) => !e)} className="mt-1 text-xs font-medium uppercase tracking-wider text-primary hover:underline">
                {expanded ? "Zwiń" : "Czytaj więcej"}
              </button>
            )}
          </div>
        )}
      </div>

      {images.length > 0 && (
        <div className="mt-4 grid max-w-sm grid-cols-5 gap-2">
          {images.slice(0, 5).map((src, i) => {
            const more = i === 4 && images.length > 5 ? images.length - 5 : 0;
            return (
              <button
                key={src}
                onClick={() => onOpenImages(i)}
                aria-label={`${plain(item.name)} – zdjęcie ${i + 1} z ${images.length}`}
                className="group relative aspect-square rounded-full p-[2px] ring-1 ring-primary/30 transition hover:ring-primary"
              >
                <span className="block h-full w-full overflow-hidden rounded-full">
                  <img src={src} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                </span>
                {more > 0 && (
                  <span className="absolute inset-[2px] flex items-center justify-center rounded-full bg-foreground/55 font-narrow text-lg text-background">
                    +{more}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <ul className="mt-5 space-y-3">
        {item.variants.map((v, i) => (
          <li key={v.label ?? i}>
            <div className="flex items-baseline gap-2">
              <span className="text-[15px] text-foreground">{v.label ? plain(v.label) : (v.time ? <span className="text-muted-foreground">{v.time}</span> : "Cena")}</span>
              <span aria-hidden className="min-w-6 flex-1 -translate-y-1 border-b border-dotted border-primary/40" />
              {(v.old ?? v.lowest30) != null && (
                <s className="whitespace-nowrap text-sm text-muted-foreground/80">{formatPln((v.old ?? v.lowest30)!)}</s>
              )}
              <span className="whitespace-nowrap font-narrow text-xl leading-none text-primary">{v.price}</span>
            </div>
            {((v.label && v.time) || v.lowest30 != null) && (
              <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                {v.label && v.time && <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{v.time}</span>}
                {v.lowest30 != null && <span>Najniższa cena z 30 dni przed obniżką: {formatPln(v.lowest30)}</span>}
              </p>
            )}
          </li>
        ))}
      </ul>
    </article>
  );
}

/** Karuzela zdjęć w kształcie łuków (jak lustra w salonie): przesuwa się sama, strzałkami lub palcem. */
function EffectsCarousel({ images, onOpen }: { images: string[]; onOpen: (index: number) => void }) {
  const track = useRef<HTMLDivElement>(null);
  const paused = useRef(false);

  const slide = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const step = (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? 240;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
    if (dir === 1 && atEnd) el.scrollTo({ left: 0, behavior: "smooth" });
    else if (dir === -1 && el.scrollLeft <= 8) el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
    else el.scrollBy({ left: dir * (step + 16), behavior: "smooth" });
  };

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (!paused.current && !document.hidden) slide(1);
    }, 3000);
    return () => window.clearInterval(id);
  }, []);

  const hold = (v: boolean) => () => {
    paused.current = v;
  };

  return (
    <div onMouseEnter={hold(true)} onMouseLeave={hold(false)} onTouchStart={hold(true)} onTouchEnd={hold(false)} onFocus={hold(true)} onBlur={hold(false)}>
      <div className="mx-auto -mt-4 mb-6 flex max-w-7xl justify-center gap-3 px-5 md:justify-end">
        {([[-1, "Poprzednie zdjęcia", "←"], [1, "Następne zdjęcia", "→"]] as const).map(([dir, label, arrow]) => (
          <button
            key={label}
            onClick={() => slide(dir)}
            aria-label={label}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-primary text-xl text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            {arrow}
          </button>
        ))}
      </div>
      <div ref={track} className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth scroll-px-5 px-5 pb-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {images.map((src, i) => (
          <button
            key={src}
            onClick={() => onOpen(i)}
            aria-label={`Powiększ zdjęcie ${i + 1} z ${images.length}`}
            className={`group aspect-[5/13] w-[44vw] shrink-0 snap-start overflow-hidden rounded-b-2xl rounded-t-full sm:w-56 lg:w-60 ${i % 2 ? "mt-8" : ""}`}
          >
            <img src={src} alt={`Metamorfoza włosów – efekt zabiegu ${i + 1}`} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
          </button>
        ))}
      </div>
    </div>
  );
}

/** Kalkulator vouchera: do każdego vouchera salon dodaje 10% jego wartości. */
function VoucherCalculator() {
  const [amount, setAmount] = useState("500");
  const value = Math.max(0, Math.min(100000, Number(amount.replace(",", ".")) || 0));
  const zl = (n: number) => `${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} zł`;

  return (
    <div className="relative mt-8 rounded-[2rem] border border-primary/40 bg-card px-5 py-10 md:px-12">
      <span className="absolute -top-4 right-8 rounded-full bg-primary px-4 py-1.5 font-narrow text-xl tracking-wide text-primary-foreground">+10%</span>
      <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
        <div>
          <p className="font-narrow text-base uppercase tracking-[0.2em] text-muted-foreground">Voucher prezentowy</p>
          <h3 className="mt-2 font-display text-3xl leading-tight text-primary md:text-4xl">Płacisz kwotę, ona dostaje o 10% więcej</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Do każdego vouchera dodajemy 10% jego wartości. Kupisz go na{" "}
            <a href={BOOKSY} {...ext} className="text-primary underline underline-offset-4">Booksy</a> albo na miejscu w salonie.
          </p>
        </div>
        <div>
          <label htmlFor="voucher-amount" className="text-sm font-medium">Kwota vouchera (zł)</label>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input
              id="voucher-amount"
              type="number"
              inputMode="numeric"
              min={0}
              step={50}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-12 w-32 rounded-xl border border-border bg-secondary px-4 text-lg outline-none focus:border-primary"
            />
            {[200, 500, 1000].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setAmount(String(v))}
                className={`h-11 rounded-full border px-4 text-sm transition-colors ${value === v ? "border-primary bg-primary text-primary-foreground" : "border-border bg-secondary hover:border-primary"}`}
              >
                {v}
              </button>
            ))}
          </div>
          <p className="mt-5 font-display text-5xl text-primary" aria-live="polite">{zl(value * 1.1)}</p>
          <p className="mt-1 text-sm">do wykorzystania w salonie (płacisz {zl(value)})</p>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ kicker, title }: { kicker?: string; title: string }) {
  return (
    <div className="mb-12 text-center">
      {kicker && <p className="mb-3 font-narrow text-xl uppercase tracking-[0.2em] text-muted-foreground">{kicker}</p>}
      <h2 className="brush inline-block px-6 font-display text-4xl uppercase text-primary md:text-5xl">{title}</h2>
      <div className="gold-line mx-auto mt-6 w-24" />
    </div>
  );
}

const nav = [
  ["Zespół", "#o-nas"], ["Usługi", "#uslugi"], ["Cennik", "#cennik"], ["Efekty", "#efekty"],
  ["Jak to wygląda", "#jak"], ["FAQ", "#faq"], ["Kontakt", "#kontakt"],
];

function Logo({ small }: { small?: boolean }) {
  return (
    <a href="#top" className="flex items-center gap-3">
      <img src={LOGO} alt="Logo Zdrowa Odbudowa" className={small ? "h-10 w-10 rounded-full object-cover" : "h-12 w-12 rounded-full object-cover"} />
      <span className="font-display text-lg uppercase leading-none text-primary">Zdrowa<br />Odbudowa</span>
    </a>
  );
}

function Index() {
  const { pricing, booksy } = Route.useLoaderData();
  const rating = booksy ?? FALLBACK_RATING;
  const [open, setOpen] = useState(false);
  const [lightbox, setLightbox] = useState<{ imgs: string[]; i: number; alt: string } | null>(null);
  const step = (d: number) => setLightbox((lb) => (lb ? { ...lb, i: (lb.i + d + lb.imgs.length) % lb.imgs.length } : lb));

  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("is-visible")), { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (lightbox === null) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [lightbox !== null]);

  return (
    <div id="top" className="min-h-screen">
      {/* NAV */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
          <Logo small />
          <nav className="hidden items-center gap-6 lg:flex">
            {nav.map(([l, h]) => <a key={h} href={h} className="font-narrow text-lg uppercase tracking-wider hover:text-primary">{l}</a>)}
          </nav>
          <div className="flex items-center gap-2">
            <a href={BOOKSY} {...ext} className="hidden rounded-full bg-primary px-5 py-2 font-narrow text-lg uppercase tracking-wide text-primary-foreground hover:bg-primary-hover sm:inline-flex">Zarezerwuj</a>
            <button aria-label="Menu" onClick={() => setOpen(!open)} className="p-2 text-primary lg:hidden">{open ? <X /> : <Menu />}</button>
          </div>
        </div>
        {open && (
          <nav className="flex flex-col gap-1 border-t border-border bg-background px-5 py-4 lg:hidden">
            {nav.map(([l, h]) => <a key={h} href={h} onClick={() => setOpen(false)} className="py-2 font-narrow text-xl uppercase tracking-wider">{l}</a>)}
            <a href={BOOKSY} {...ext} className="mt-2 rounded-full bg-primary py-3 text-center font-narrow text-xl uppercase text-primary-foreground">Zarezerwuj</a>
          </nav>
        )}
      </header>

      {/* HERO */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 md:py-24 lg:grid-cols-2">
        <Reveal className="text-center lg:text-left">
          <div className="mb-8 flex items-center justify-center gap-4 lg:justify-start">
            <img src={LOGO} alt="Sylwetka kobiety – logo Zdrowa Odbudowa" className="h-24 w-24 rounded-full object-cover shadow-sm" />
            <div>
              <p className="font-display text-3xl uppercase text-primary">Zdrowa Odbudowa</p>
              <div className="gold-line my-1" />
              <p className="font-narrow text-xl text-primary">studio koloryzacji i rekonstrukcji włosa</p>
            </div>
          </div>
          <span className="mb-6 inline-flex items-center gap-1 rounded-full bg-accent-soft px-4 py-1 font-narrow text-lg tracking-wide">
            <Star className="h-4 w-4 fill-primary text-primary" /> {formatRating(rating.rating)} / 5 · {rating.count} opinii
          </span>
          <h1 className="font-display text-4xl leading-tight text-primary md:text-6xl">Każdy włos to inna historia… <span className="brush inline-block px-2">Jaka jest Twoja?</span></h1>
          <p className="mt-6 text-lg md:text-xl">Sprawimy, że Twoje włosy bez stylizacji będą lśniące, gładkie i zdrowe – aż do 6 miesięcy!</p>
          <p className="mt-4 text-muted-foreground">Zapisz się na bezpłatną i niezobowiązującą konsultację – dowiesz się, jaki zabieg będzie najlepszy dla Twoich włosów.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
            <Btn href={BOOKSY}><CalendarHeart className="h-5 w-5" /> Bezpłatna konsultacja</Btn>
            <Btn href={TEL} variant="outline" external={false}><Phone className="h-5 w-5" /> Zadzwoń: 796 764 768</Btn>
          </div>
        </Reveal>
        <Reveal className="mx-auto grid w-full max-w-lg grid-cols-2 gap-3 sm:gap-4">
          {/* łuk jak lustra w salonie */}
          <img src="/salon/lustra.webp" alt="Lustra w kształcie łuków w salonie Zdrowa Odbudowa w Kobyłce" className="row-span-2 h-full w-full rounded-b-3xl rounded-t-full object-cover" />
          <img src="/salon/wnetrze-1.webp" alt="Wnętrze salonu Zdrowa Odbudowa – stanowiska fryzjerskie" className="aspect-[4/5] w-full rounded-3xl object-cover" />
          <img src="/cennik/airtouch/1.webp" alt="Efekt koloryzacji Air Touch – lśniące, zdrowe włosy" className="aspect-[4/5] w-full rounded-3xl object-cover" />
        </Reveal>
      </section>

      {/* USŁUGI */}
      <section id="uslugi" className="bg-secondary py-20">
        <div className="mx-auto max-w-7xl px-5">
          <SectionTitle kicker="Czym się zajmujemy" title="Usługi" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              [Sparkles, "Trwała rekonstrukcja włosa", "Zabiegi pielęgnująco-prostujące. Hybrydy zabiegowe. Pomagamy nawet najcięższym przypadkom."],
              [Palette, "Koloryzacja i dekoloryzacja", "Metamorfozy struktury oraz koloru włosa. Bezinwazyjna dekoloryzacja. Najnowsze techniki koloryzacji."],
              [Scissors, "Strzyżenie", "Tylko damskie"],
              [Leaf, "Pielęgnacja", "Kuracje regenerujące, maski i ampułki"],
              [Heart, "Czesanie i makijaż", "Czesanie i makijaż dzienny oraz okolicznościowy. Usługa 2w1 makijaż + fryzura w 1,5h. Pakiety ślubne z dojazdem.", GLOW_IG],
              [Gift, "Vouchery prezentowe", "Podaruj bliskiej osobie chwilę dla siebie"],
            ].map(([I, t, d, link]) => {
              const Icon = I as typeof Sparkles;
              return (
                <Reveal key={t as string}>
                  <div className="h-full rounded-2xl border border-primary/40 bg-card p-8 transition hover:-translate-y-1 hover:shadow-lg">
                    <Icon className="mb-4 h-9 w-9 text-primary" strokeWidth={1.3} />
                    <h3 className="font-display text-2xl uppercase text-primary">{t as string}</h3>
                    <p className="mt-2 font-narrow text-xl">{d as string}</p>
                    {link && (
                      <a href={link as string} {...ext} className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary underline-offset-4 hover:underline">
                        <Instagram className="h-4 w-4 shrink-0" /> Nasze prace ślubne: @hairxmakeup_glowteam
                      </a>
                    )}
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* EFEKTY ZABIEGÓW */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5">
          <SectionTitle kicker="Co zyskujesz" title="Efekty zabiegów" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {[
              [Microscope, "Test włosa", "Już na bezpłatnej konsultacji poznasz strukturę i kondycję włosów oraz dowiesz się, jak o nie dbać."],
              [Droplets, "Nawilżone włosy", "Miękkie w dotyku i sypkie."],
              [Gem, "Brak rozdwojonych końcówek", "Włosy odzyskują blask i zdrowy wygląd."],
              [ShieldCheck, "Odbudowane włosy", "Zabiegi bogate w proteiny i aminokwasy."],
              [Home, "Wygoda", "W domu wystarczy wysuszyć włosy, by mieć efekt jak z salonu."],
            ].map(([I, t, d]) => {
              const Icon = I as typeof Sparkles;
              return (
                <Reveal key={t as string} className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft"><Icon className="h-7 w-7 text-primary" strokeWidth={1.4} /></div>
                  <h3 className="font-narrow text-2xl uppercase text-primary">{t as string}</h3>
                  <p className="mt-2 text-sm">{d as string}</p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* CENNIK */}
      <section id="cennik" className="bg-secondary py-20">
        <div className="mx-auto max-w-6xl px-5">
          <SectionTitle kicker="Promocje do -15%" title="Cennik" />
          <Tabs defaultValue={pricing[0]?.id ?? ""}>
            <div className="-mx-5 overflow-x-auto px-5 [scrollbar-width:none] lg:mx-0 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden">
              <TabsList className="h-auto w-max gap-x-1 rounded-none border-b border-primary/20 bg-transparent p-0 lg:flex lg:w-full lg:flex-wrap lg:justify-center lg:gap-x-4">
                {pricing.map((c) => (
                  <TabsTrigger
                    key={c.id}
                    value={c.id}
                    className="-mb-px rounded-none border-b-2 border-transparent bg-transparent px-3 py-3 font-narrow text-lg uppercase tracking-[0.15em] text-muted-foreground shadow-none transition-colors hover:text-primary data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
                  >
                    {plain(c.label)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            {pricing.map((c) => (
              <TabsContent key={c.id} value={c.id} className="mt-10">
                <div className="rounded-[2rem] border border-primary/15 bg-card px-5 py-10 shadow-[0_20px_60px_-30px_rgba(92,74,54,0.25)] md:px-12 md:py-14">
                  <header className="mb-10 text-center">
                    <div className="flex items-center justify-center gap-4">
                      <span className="hidden h-px w-20 bg-primary/40 md:block" />
                      <h3 className="font-display text-2xl uppercase tracking-wide text-primary md:text-4xl">{plain(c.label)}</h3>
                      <span className="hidden h-px w-20 bg-primary/40 md:block" />
                    </div>
                  </header>
                  <div className="md:columns-2 md:gap-16 md:[column-rule:1px_solid_color-mix(in_srgb,var(--primary)_15%,transparent)]">
                    {c.items.map((it) => (
                      <PriceEntry
                        key={it.name}
                        item={it}
                        onOpenImages={(i) => setLightbox({ imgs: it.images ?? [], i, alt: `${plain(it.name)} – efekt zabiegu` })}
                      />
                    ))}
                  </div>
                </div>
                {/voucher/i.test(c.id + c.label) && <VoucherCalculator />}
              </TabsContent>
            ))}
          </Tabs>
          <p className="mx-auto mt-10 max-w-3xl text-center text-sm text-muted-foreground">Ostateczna cena zależy od długości i gęstości włosa – dokładny koszt poznasz przed zabiegiem.</p>
          <div className="mt-6 text-center"><Btn href={BOOKSY}>Zarezerwuj na Booksy</Btn></div>
        </div>
      </section>

      {/* GALERIA */}
      <section id="efekty" className="py-20">
        <div className="mx-auto max-w-7xl px-5">
          <SectionTitle kicker="Metamorfozy" title="Galeria efektów" />
        </div>
        <EffectsCarousel images={effects} onOpen={(i) => setLightbox({ imgs: effects, i, alt: "Powiększone zdjęcie metamorfozy" })} />
      </section>
      {lightbox !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/90 p-4" onClick={() => setLightbox(null)}>
          <button aria-label="Zamknij" className="absolute right-4 top-4 text-background"><X className="h-8 w-8" /></button>
          <button aria-label="Poprzednie" className="absolute left-2 p-3 font-display text-5xl text-background" onClick={(e) => { e.stopPropagation(); step(-1); }}>‹</button>
          <img src={lightbox.imgs[lightbox.i] ?? ""} alt={lightbox.alt} className="max-h-[90vh] max-w-full rounded-lg object-contain" onClick={(e) => e.stopPropagation()} />
          <button aria-label="Następne" className="absolute right-2 p-3 font-display text-5xl text-background" onClick={(e) => { e.stopPropagation(); step(1); }}>›</button>
        </div>
      )}

      {/* JAK TO WYGLĄDA */}
      <section id="jak" className="bg-secondary py-20">
        <div className="mx-auto max-w-4xl px-5">
          <SectionTitle kicker="Krok po kroku" title="Jak to wygląda" />
          <ol className="relative space-y-10 border-l border-primary/50 pl-10">
            {[
              ["Zapis na konsultację", "Przez Booksy lub telefonicznie 796 764 768."],
              ["Konsultacja", "Wywiad o przeciwwskazaniach i oczekiwanym efekcie, test włosa, porady pielęgnacyjne. Tu możesz zakończyć wizytę."],
              ["Zabieg (nieobowiązkowy)", "Ty relaksujesz się przy serialu lub kawie z ekspresu, my działamy."],
              ["Efekty", "Lśniące włosy · zero rozdwojonych końcówek · zero puszenia · zero elektryzowania · wygoda na co dzień · piękne włosy nawet do 6 miesięcy."],
            ].map(([t, d], i) => (
              <Reveal key={t}>
                <li className="relative">
                  <span className="absolute -left-[3.6rem] flex h-10 w-10 items-center justify-center rounded-full bg-primary font-display text-xl text-primary-foreground">{i + 1}</span>
                  <h3 className="font-narrow text-2xl uppercase text-primary">Krok {i + 1} – {t}</h3>
                  <p className="mt-1">{d}</p>
                </li>
              </Reveal>
            ))}
          </ol>
          <p className="mt-12 rounded-2xl bg-card p-6 text-sm leading-relaxed">Zabieg trwa ok. 3–3,5 h. Włosy myjemy szamponem oczyszczającym, suszymy i robimy test jakości włosa. Cienkimi pasmami nakładamy produkt najwyższej jakości na 30–90 minut, spłukujemy, suszymy i prostujemy w dobranej temperaturze (7–20 przeciągnięć), by wtłoczyć produkt w łuskę włosa. Na koniec myjemy i od razu cieszysz się efektem.</p>
        </div>
      </section>

      {/* O NAS */}
      <section id="o-nas" className="py-20">
        <div className="mx-auto max-w-7xl px-5">
          <SectionTitle kicker="Poznajmy się" title="Nasz zespół" />
          <Reveal>
            <p className="mx-auto max-w-3xl text-center leading-relaxed">Zdrowa Odbudowa to miejsce, gdzie pasja do fryzjerstwa spotyka się z indywidualnym podejściem. Specjalizujemy się w koloryzacjach, w tym w nowoczesnych technikach jak Air Touch, oraz w trwałej rekonstrukcji włosa. Wierzymy, że pełen sukces osiągniemy tylko przy dobrze przemyślanej decyzji klientki – dlatego konsultacja jest bezpłatna, niezobowiązująca, a na decyzję masz tyle czasu, ile potrzebujesz.</p>
          </Reveal>
          <div className="mx-auto mt-14 grid max-w-5xl grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
            {team.map((m) => (
              <Reveal key={m.name} className="text-center">
                <div className="brush-band mx-auto w-36 sm:w-44">
                  <img src={m.photo} alt={`${m.name} – ${m.role}`} loading="lazy" className="aspect-square w-full rounded-full border-4 border-background object-cover shadow-sm" />
                </div>
                <h3 className="mt-5 font-display text-2xl text-primary">{m.name}</h3>
                <p className="mx-auto mt-1 max-w-[12rem] font-narrow text-lg leading-snug text-muted-foreground">{m.role}</p>
              </Reveal>
            ))}
          </div>
          <div className="mt-16 flex flex-wrap justify-center gap-4">
            {salon.map((s, i) => <img key={s} src={s} alt={`Wnętrze salonu Zdrowa Odbudowa ${i + 1}`} loading="lazy" className="aspect-square w-[calc(50%-0.5rem)] rounded-xl object-cover md:w-[calc(33.333%-0.667rem)] lg:w-[calc(20%-0.8rem)]" />)}
          </div>
        </div>
      </section>

      {/* OPINIE */}
      <section className="bg-secondary py-20">
        <div className="mx-auto max-w-6xl px-5 text-center">
          <SectionTitle kicker="Co mówią klientki" title="Opinie" />
          <p className="font-display text-6xl text-primary">{formatRating(rating.rating)} ★</p>
          <p className="font-narrow text-2xl">{rating.count} opinii na Booksy</p>
          {booksy && booksy.reviews.length > 0 && (
            <div className="mt-10 gap-6 text-left md:columns-2 lg:columns-3">
              {booksy.reviews.map((r) => (
                <figure key={r.id} className="mb-6 break-inside-avoid rounded-2xl bg-card p-6">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div className="flex gap-0.5" aria-label={`Ocena ${r.stars} na 5`}>
                      {[...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 ${i < r.stars ? "fill-primary text-primary" : "text-border"}`} />)}
                    </div>
                    {r.date && <time dateTime={r.date} className="text-xs text-muted-foreground">{formatReviewDate(r.date)}</time>}
                  </div>
                  <blockquote className="italic">„{r.text}”</blockquote>
                  <figcaption className="mt-3">
                    <p className="font-narrow text-lg text-primary">{r.name} <span className="text-sm text-muted-foreground">· potwierdzony klient Booksy</span></p>
                    {(r.service || r.staff) && (
                      <p className="text-xs text-muted-foreground">{[r.service, r.staff && `pracownik: ${r.staff}`].filter(Boolean).join(" · ")}</p>
                    )}
                  </figcaption>
                  {r.reply && (
                    <p className="mt-4 border-l-2 border-primary/40 pl-3 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Odpowiedź salonu:</span> {r.reply}
                    </p>
                  )}
                </figure>
              ))}
            </div>
          )}
          <div className="mt-10"><Btn href={BOOKSY} variant="outline">Zobacz wszystkie opinie na Booksy</Btn></div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20">
        <div className="mx-auto max-w-3xl px-5">
          <SectionTitle kicker="Pytania i odpowiedzi" title="FAQ" />
          <Accordion type="single" collapsible>
            {[
              ["Dlaczego rekonstrukcja jest wyjątkowa?", "To innowacyjne zabiegi oparte na nanotechnologii. Po zabiegu włosy są proste, gładkie i lśniące."],
              ["Czy zabieg jest bolesny?", "Nie, zabiegi są bezbolesne."],
              ["Czy kolor włosów się zmieni?", "Zależnie od zabiegu: niektóre delikatnie rozjaśniają o kilka tonów, inne tonują lub ocieplają kolor – dlatego tak ważna jest konsultacja."],
              ["Ile trwa wizyta?", "Konsultacja 30 min, zabieg ok. 3–4 h."],
              ["Czy włosy muszą być maksymalnie proste?", "Nie. Jeśli chcesz zachować naturalny skręt, a pozbyć się puszenia, wykonamy zabieg w niższej temperaturze."],
              ["Jak długo utrzymują się efekty?", "Od 3 do 6 miesięcy, przy podatnych włosach i dobrej pielęgnacji nawet do roku."],
              ["Jakie są przeciwwskazania?", "Henna na włosach, trwała ondulacja (kwasowa), nieuregulowane hormony, aktywne stany zapalne skóry głowy, łysienie plackowate, mocno uwrażliwione/spalone włosy (wtedy możliwa tylko kuracja SOS na zimno)."],
              ["Zalecenia po zabiegu?", "Koloryzacja po 10–14 dniach (min. 14 dni przy rozjaśnianiu); unikaj sauny i basenu; szampony bez SLS/SLES; zawsze susz włosy suszarką w 100%; rozczesuj od końcówek, stosuj olejek na końce."],
              ["Ile kosztują zabiegi?", "Od 250 zł, zależnie od długości i gęstości włosa. Dokładny koszt poznasz przed zabiegiem."],
              ["Czy można płacić kartą?", "Tak."],
              ["Czy jest parking?", "Tak, przy salonie jest duży bezpłatny parking."],
            ].map(([q, a], i) => (
              <AccordionItem key={q} value={`q${i}`}>
                <AccordionTrigger className="font-narrow text-xl text-primary hover:no-underline">{q}</AccordionTrigger>
                <AccordionContent className="text-base">{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* KONTAKT */}
      <section id="kontakt" className="bg-secondary py-20">
        <div className="mx-auto max-w-7xl px-5">
          <SectionTitle kicker="Zapraszamy" title="Kontakt" />
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="space-y-6">
              <p className="flex gap-3"><MapPin className="h-6 w-6 shrink-0 text-primary" />ul. Księdza Marcina Załuskiego 73, lokal 1, domofon 1, 05-230 Kobyłka – 20 minut od Warszawy</p>
              <a href={TEL} className="flex gap-3 font-narrow text-3xl text-primary"><Phone className="h-6 w-6 shrink-0" />796 764 768</a>
              <div className="flex gap-3">
                <Clock className="h-6 w-6 shrink-0 text-primary" />
                <ul className="space-y-1">
                  <li>Pn–Wt: 10:00–20:00</li><li>Śr–Pt: 9:00–21:00</li><li>Sob: 9:00–15:00</li><li>Ndz: nieczynne</li>
                </ul>
              </div>
              <div className="flex flex-wrap gap-3">
                <Btn href={BOOKSY}>Zarezerwuj na Booksy</Btn>
                <Btn href={FRESHA} variant="outline">Rezerwuj na Fresha</Btn>
                <Btn href={ROUTE} variant="outline"><Navigation className="h-5 w-5" />Wyznacz trasę</Btn>
              </div>
              <div className="flex gap-3">
                <a href={FB} {...ext} aria-label="Facebook" className="rounded-full border border-primary p-3 text-primary hover:bg-primary hover:text-primary-foreground"><Facebook /></a>
                <a href={IG} {...ext} aria-label="Instagram" className="rounded-full border border-primary p-3 text-primary hover:bg-primary hover:text-primary-foreground"><Instagram /></a>
              </div>
            </div>
            <iframe title="Mapa dojazdu do salonu Zdrowa Odbudowa" src={MAPS} loading="lazy" className="h-96 w-full rounded-2xl border border-border" />
          </div>
        </div>
      </section>

      {/* STOPKA */}
      <footer className="py-12">
        <div className="mx-auto max-w-7xl px-5">
          <div className="gold-line mb-10" />
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <Logo />
              <p className="mt-4 text-sm text-muted-foreground">Studio koloryzacji i rekonstrukcji włosa w Kobyłce. Każdy włos to inna historia… Jaka jest Twoja?</p>
            </div>
            <div className="space-y-2 text-sm">
              <a href={TEL} className="block hover:text-primary">tel. 796 764 768</a>
              <p>ul. Księdza Marcina Załuskiego 73, lokal 1, 05-230 Kobyłka</p>
            </div>
            <div className="flex gap-3 md:justify-end">
              <a href={FB} {...ext} aria-label="Facebook" className="text-primary hover:text-primary-hover"><Facebook /></a>
              <a href={IG} {...ext} aria-label="Instagram" className="text-primary hover:text-primary-hover"><Instagram /></a>
            </div>
          </div>
          <div className="mt-10 flex flex-col items-center gap-3 text-center text-xs text-muted-foreground">
            <p>
              © 2026 Zdrowa Odbudowa · Wykonanie:{" "}
              <a href="https://mico-page.pl" {...ext} className="underline-offset-2 hover:text-primary hover:underline">MicoPage ©</a>
            </p>
            <a href="/admin" rel="nofollow" className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 hover:border-primary hover:text-primary">
              <Lock className="h-3 w-3" /> Panel administratora
            </a>
          </div>
        </div>
      </footer>

      <a href={BOOKSY} {...ext} className="fixed bottom-5 right-5 z-40 rounded-full bg-primary px-6 py-3 font-narrow text-xl uppercase text-primary-foreground shadow-lg hover:bg-primary-hover sm:hidden">Zarezerwuj</a>
    </div>
  );
}

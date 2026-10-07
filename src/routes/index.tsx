import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  Sparkles, Palette, Scissors, Leaf, Heart, Gift, Microscope, Droplets, Gem, ShieldCheck, Home,
  Phone, MapPin, Clock, Menu, X, Star, Facebook, Instagram, Navigation, CalendarHeart,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
const LOGO = "/logo.png";
import { pricing, lengthLegend } from "@/data/pricing";

const BOOKSY = "https://zdrowaodbudowa.booksy.com/a";
const FRESHA = "https://www.fresha.com/pl/a/zdrowa-odbudowa-studio-koloryzacji-i-rekonstrukcji-wlosa-kobylka-ksiedza-marcina-zaluskiego-73-xnra11q1";
const FB = "https://www.facebook.com/profile.php?id=61573410756665";
const IG = "https://www.instagram.com/zdrowaodbudowawlosa";
const TEL = "tel:+48796764768";
const MAPS = "https://maps.google.com/maps?q=Ksi%C4%99dza%20Marcina%20Za%C5%82uskiego%2073%2C%20Koby%C5%82ka&t=m&z=15&output=embed";
const ROUTE = "https://www.google.com/maps/dir/?api=1&destination=Ksi%C4%99dza%20Marcina%20Za%C5%82uskiego%2073%2C%2005-230%20Koby%C5%82ka";
const W = "https://zdrowaodbudowa.beauty-flow.pl/wp-content/uploads/";

const effects = [
  "2025/03/IMG_0142.jpeg", "2025/03/55F38167-82E0-4952-936E-C0EE1EB2C4EF-1024x1024.jpg", "2025/03/IMG_8138-834x1024.jpg",
  "2025/02/540CC51D-2924-473C-BC8D-F89A7F001D30-1024x1024.jpg", "2025/04/IMG_0077-595x1024.jpg", "2025/04/IMG_0076-703x1024.jpg",
  "2025/04/IMG_0075-622x1024.jpg",
].map((p) => W + p);
const salon = [
  W + "2025/02/IMG_7888-768x1024.jpg", W + "2025/03/IMG_8055-807x1024.jpg", W + "2025/02/IMG_DDD0E2481025-1-scaled-e1740763085948-772x1024.jpeg",
  "https://images.fresha.com/locations/location-profile-images/3085242/6711026/e94265ed-d0f2-404d-867c-9b86f68c10fa-ZDROWAODBUDOWA-PL-WojewdztwoMazowieckie-Kobyka-Fresha.jpg",
  "https://images.fresha.com/locations/location-profile-images/3085242/6711027/577c1ec8-671e-4e08-ab08-d50e159837c2-ZDROWAODBUDOWA-PL-WojewdztwoMazowieckie-Kobyka-Fresha.jpg",
  "https://images.fresha.com/locations/location-profile-images/3085242/6711028/d0f21c45-e193-4b62-9ae6-6ca694699d8b-ZDROWAODBUDOWA-PL-WojewdztwoMazowieckie-Kobyka-Fresha.jpg",
];
const HERO = W + "2025/02/SAD_7070-682x1024.jpg";

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
  aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", reviewCount: "260" },
  sameAs: [FB, IG, BOOKSY],
};

export const Route = createFileRoute("/")({
  head: () => ({
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
    scripts: [{ type: "application/ld+json", children: JSON.stringify(jsonLd) }],
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
  ["O nas", "#o-nas"], ["Usługi", "#uslugi"], ["Cennik", "#cennik"], ["Efekty", "#efekty"],
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
  const [open, setOpen] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("is-visible")), { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (lightbox === null) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") setLightbox((i) => (i! + 1) % effects.length);
      if (e.key === "ArrowLeft") setLightbox((i) => (i! - 1 + effects.length) % effects.length);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [lightbox]);

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
            <Star className="h-4 w-4 fill-primary text-primary" /> 4,9 / 5 · 260 opinii
          </span>
          <h1 className="font-display text-4xl leading-tight text-primary md:text-6xl">Każdy włos to inna historia… <span className="brush inline-block px-2">Jaka jest Twoja?</span></h1>
          <p className="mt-6 text-lg md:text-xl">Sprawimy, że Twoje włosy bez stylizacji będą lśniące, gładkie i zdrowe – aż do 6 miesięcy!</p>
          <p className="mt-4 text-muted-foreground">Zapisz się na bezpłatną i niezobowiązującą konsultację – dowiesz się, jaki zabieg będzie najlepszy dla Twoich włosów.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
            <Btn href={BOOKSY}><CalendarHeart className="h-5 w-5" /> Bezpłatna konsultacja</Btn>
            <Btn href={TEL} variant="outline" external={false}><Phone className="h-5 w-5" /> Zadzwoń: 796 764 768</Btn>
          </div>
        </Reveal>
        <Reveal className="relative mx-auto w-full max-w-md">
          <div className="absolute -inset-4 -rotate-3 rounded-[2rem] bg-accent-soft" />
          <img src={HERO} alt="Malwina Szprecher – kolorystka, właścicielka studia" className="relative aspect-[2/3] w-full rounded-[2rem] object-cover" />
        </Reveal>
      </section>

      {/* USŁUGI */}
      <section id="uslugi" className="bg-secondary py-20">
        <div className="mx-auto max-w-7xl px-5">
          <SectionTitle kicker="Czym się zajmujemy" title="Usługi" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              [Sparkles, "Trwała rekonstrukcja włosa", "Nanoplastia, Keratyna, Bioplastia, Botoks"],
              [Palette, "Koloryzacja i dekoloryzacja", "Metamorfozy koloru, Dekoloryzacja bez zniszczeń, Air Touch, Odrost"],
              [Scissors, "Strzyżenie", "Damskie i męskie"],
              [Leaf, "Pielęgnacja", "Kuracje regenerujące, maski i ampułki"],
              [Heart, "Czesanie i makijaż", "Okolicznościowy i ślubny"],
              [Gift, "Vouchery prezentowe 🎁", "Podaruj bliskiej osobie chwilę dla siebie"],
            ].map(([I, t, d]) => {
              const Icon = I as typeof Sparkles;
              return (
                <Reveal key={t as string}>
                  <div className="h-full rounded-2xl border border-primary/40 bg-card p-8 transition hover:-translate-y-1 hover:shadow-lg">
                    <Icon className="mb-4 h-9 w-9 text-primary" strokeWidth={1.3} />
                    <h3 className="font-display text-2xl uppercase text-primary">{t as string}</h3>
                    <p className="mt-2 font-narrow text-xl">{d as string}</p>
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
          <SectionTitle kicker={lengthLegend} title="Cennik" />
          <Tabs defaultValue="rekonstrukcja">
            <div className="-mx-5 overflow-x-auto px-5 pb-2">
              <TabsList className="h-auto w-max gap-1 rounded-full bg-card p-1">
                {pricing.map((c) => (
                  <TabsTrigger key={c.id} value={c.id} className="rounded-full px-4 py-2 font-narrow text-lg uppercase tracking-wide data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{c.label}</TabsTrigger>
                ))}
              </TabsList>
            </div>
            {pricing.map((c) => (
              <TabsContent key={c.id} value={c.id} className="mt-8">
                <div className="grid gap-4 md:grid-cols-2">
                  {c.items.map((it) => (
                    <div key={it.name} className="rounded-2xl border border-border bg-card p-6">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="font-display text-xl uppercase text-primary">{it.name}</h3>
                        {it.badge && <span className="rounded-full bg-accent px-3 py-0.5 font-narrow text-base uppercase tracking-wide">{it.badge}</span>}
                      </div>
                      {it.desc && <p className="mt-2 text-sm text-muted-foreground">{it.desc}</p>}
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {it.prices.map((p) => <span key={p} className="rounded-full border border-primary/40 px-3 py-1 font-narrow text-lg text-primary">{p}</span>)}
                        {it.time && <span className="ml-auto inline-flex items-center gap-1 text-sm text-muted-foreground"><Clock className="h-4 w-4" />{it.time}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
          <p className="mx-auto mt-10 max-w-3xl text-center text-sm text-muted-foreground">Podane ceny są cenami regularnymi. Ostateczna cena zależy od długości i gęstości włosa – dokładny koszt poznasz przed zabiegiem. Aktualne promocje (nawet do -15%) znajdziesz na Booksy.</p>
          <div className="mt-6 text-center"><Btn href={BOOKSY}>Sprawdź promocje i zarezerwuj na Booksy</Btn></div>
        </div>
      </section>

      {/* GALERIA */}
      <section id="efekty" className="py-20">
        <div className="mx-auto max-w-7xl px-5">
          <SectionTitle kicker="Metamorfozy" title="Galeria efektów" />
          <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
            {effects.map((src, i) => (
              <button key={src} onClick={() => setLightbox(i)} className="mb-4 block w-full overflow-hidden rounded-xl">
                <img src={src} alt={`Metamorfoza włosów – efekt zabiegu ${i + 1}`} loading="lazy" className="w-full object-cover transition duration-500 hover:scale-105" />
              </button>
            ))}
          </div>
        </div>
      </section>
      {lightbox !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/90 p-4" onClick={() => setLightbox(null)}>
          <button aria-label="Zamknij" className="absolute right-4 top-4 text-background"><X className="h-8 w-8" /></button>
          <button aria-label="Poprzednie" className="absolute left-2 p-3 font-display text-5xl text-background" onClick={(e) => { e.stopPropagation(); setLightbox((lightbox - 1 + effects.length) % effects.length); }}>‹</button>
          <img src={effects[lightbox] ?? ""} alt="Powiększone zdjęcie metamorfozy" className="max-h-[90vh] max-w-full rounded-lg object-contain" onClick={(e) => e.stopPropagation()} />
          <button aria-label="Następne" className="absolute right-2 p-3 font-display text-5xl text-background" onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % effects.length); }}>›</button>
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
              ["Efekty", "💎 lśniące włosy 💎 zero rozdwojonych końcówek 💎 zero puszenia 💎 zero elektryzowania 💎 wygoda na co dzień 💎 piękne włosy nawet do 6 miesięcy."],
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
          <SectionTitle kicker="Poznajmy się" title="O nas" />
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <Reveal className="grid grid-cols-2 gap-4">
              <img src={W + "2025/02/SAD_7083-682x1024.jpg"} alt="Malwina Szprecher przy pracy" loading="lazy" className="aspect-[2/3] w-full rounded-2xl object-cover" />
              <img src={W + "2025/02/SAD_7006-682x1024.jpg"} alt="Malwina Szprecher w studiu" loading="lazy" className="mt-10 aspect-[2/3] w-full rounded-2xl object-cover" />
            </Reveal>
            <Reveal>
              <h3 className="font-display text-3xl uppercase text-primary">Malwina Szprecher</h3>
              <p className="font-narrow text-xl text-muted-foreground">kolorysta i trener technik trwałej odbudowy włosa</p>
              <div className="gold-line my-6 w-24" />
              <p className="leading-relaxed">Zdrowa Odbudowa to miejsce, gdzie pasja do fryzjerstwa spotyka się z indywidualnym podejściem. Specjalizujemy się w koloryzacjach, w tym w nowoczesnych technikach jak Air Touch, oraz w trwałej rekonstrukcji włosa. Wierzymy, że pełen sukces osiągniemy tylko przy dobrze przemyślanej decyzji klientki – dlatego konsultacja jest bezpłatna, niezobowiązująca, a na decyzję masz tyle czasu, ile potrzebujesz 💕</p>
              <div className="mt-8 flex flex-wrap gap-6">
                {[["Malwina", "fryzjer i kolorysta"], ["Edyta", "zespół"], ["Agnieszka", "zespół"], ["Glow", "make-up"]].map(([n, r]) => (
                  <div key={n} className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft font-display text-xl text-primary">{n?.[0]}</span>
                    <div><p className="font-narrow text-xl text-primary">{n}</p><p className="text-xs text-muted-foreground">{r}</p></div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {salon.map((s, i) => <img key={s} src={s} alt={`Wnętrze salonu Zdrowa Odbudowa ${i + 1}`} loading="lazy" className="aspect-square w-full rounded-xl object-cover" />)}
          </div>
        </div>
      </section>

      {/* OPINIE */}
      <section className="bg-secondary py-20">
        <div className="mx-auto max-w-6xl px-5 text-center">
          <SectionTitle kicker="Co mówią klientki" title="Opinie" />
          <p className="font-display text-6xl text-primary">4,9 ★</p>
          <p className="font-narrow text-2xl">260 opinii na Booksy</p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="rounded-2xl bg-card p-6 text-left">
                <div className="mb-3 flex gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-primary text-primary" />)}</div>
                <p className="italic">„Opinia klientki z Booksy”</p>
                <p className="mt-3 font-narrow text-lg text-primary">Klientka Booksy</p>
              </div>
            ))}
          </div>
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
          <p className="mt-10 text-center text-xs text-muted-foreground">© 2026 Zdrowa Odbudowa</p>
        </div>
      </footer>

      <a href={BOOKSY} {...ext} className="fixed bottom-5 right-5 z-40 rounded-full bg-primary px-6 py-3 font-narrow text-xl uppercase text-primary-foreground shadow-lg hover:bg-primary-hover sm:hidden">Zarezerwuj</a>
    </div>
  );
}

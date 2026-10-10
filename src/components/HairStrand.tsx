import { useEffect, useMemo, useRef } from "react";

/**
 * Ozdobne pasmo włosów, które "odbudowuje się" przy przewijaniu:
 * gdy pas wjeżdża na ekran, włosy są puszące się i poszarpane, a im wyżej na ekranie,
 * tym bardziej wygładzają się w lśniącą taflę. Czysty SVG, bez zdjęć i bibliotek.
 */

const W = 1200;
const H = 140;
const STRANDS = 26;
const STEP = 8;
const COLORS = ["var(--primary)", "#d9b98a", "var(--primary-hover)", "#e9d5b0", "#c9a068"];

// deterministyczny generator – te same kształty na serwerze i w przeglądarce
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Strand = { offset: number; a1: number; f1: number; p1: number; a2: number; f2: number; p2: number; a3: number; f3: number; p3: number; color: string; width: number };

function makeStrands(): Strand[] {
  const rnd = mulberry32(7);
  return Array.from({ length: STRANDS }, (_, i) => {
    const flyaway = i % 6 === 2; // co któryś włos mocno odstaje – "puch"
    return {
      offset: (i / (STRANDS - 1) - 0.5) * 2, // -1…1 względem środka pasma
      // długie, leniwe wygięcie
      a1: (flyaway ? 18 : 7) + rnd() * 9,
      f1: 0.006 + rnd() * 0.012,
      p1: rnd() * Math.PI * 2,
      // skręt
      a2: 4 + rnd() * 7,
      f2: 0.022 + rnd() * 0.03,
      p2: rnd() * Math.PI * 2,
      // drobne puszenie
      a3: 1 + rnd() * 2.5,
      f3: 0.07 + rnd() * 0.06,
      p3: rnd() * Math.PI * 2,
      color: COLORS[i % COLORS.length]!,
      width: 1.2 + rnd() * 1.1,
    };
  });
}

/** smooth: 0 = zniszczone, puszące się włosy; 1 = gładka tafla */
function strandPath(s: Strand, smooth: number) {
  const frizz = 1 - smooth;
  // zniszczone włosy rozchodzą się szerzej, zdrowe leżą ciasno obok siebie
  const base = H / 2 + s.offset * (20 + 16 * frizz);
  let d = "";
  for (let k = 0, x = 0; x <= W; k++, x += STEP) {
    const flow = Math.sin(x * 0.0052 + s.offset * 0.5) * 9; // łagodna fala całego pasma
    const mess = s.a1 * Math.sin(x * s.f1 + s.p1) + s.a2 * Math.sin(x * s.f2 + s.p2) + s.a3 * Math.sin(x * s.f3 + s.p3);
    d += `${k ? "L" : "M"}${x} ${(base + flow + mess * frizz).toFixed(1)}`;
  }
  return d;
}

export function HairStrand({ className = "" }: { className?: string }) {
  const svg = useRef<SVGSVGElement>(null);
  const strands = useMemo(makeStrands, []);

  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    const paths = Array.from(el.querySelectorAll<SVGPathElement>("path[data-strand]"));
    const shine = el.querySelector<SVGPathElement>("path[data-shine]");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let last = -1;

    const draw = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0, gdy pas pojawia się u dołu ekranu → 1, gdy dojedzie do ~35% wysokości ekranu
      const raw = reduced ? 1 : (vh - rect.top - rect.height * 0.3) / (vh * 0.65);
      const t = Math.min(1, Math.max(0, raw));
      const smooth = t * t * (3 - 2 * t);
      if (Math.abs(smooth - last) < 0.004) return;
      last = smooth;
      paths.forEach((p, i) => p.setAttribute("d", strandPath(strands[i]!, smooth)));
      if (shine) shine.style.opacity = String(Math.max(0, smooth - 0.55) * 1.3);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };

    draw();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [strands]);

  return (
    <svg
      ref={svg}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-hidden
      className={`block h-24 w-full overflow-visible md:h-36 ${className}`}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        <filter id="hair-shine-blur" x="-5%" y="-100%" width="110%" height="300%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      {strands.map((s, i) => (
        <path key={i} data-strand d={strandPath(s, 0)} stroke={s.color} strokeWidth={s.width} opacity={0.9} vectorEffect="non-scaling-stroke" />
      ))}
      {/* połysk zdrowych włosów – pojawia się, gdy pasmo jest już gładkie */}
      <path
        data-shine
        d={`M0 ${H / 2 - 8} ${Array.from({ length: Math.ceil(W / 60) + 1 }, (_, k) => `L${k * 60} ${(H / 2 - 8 + Math.sin(k * 60 * 0.0052) * 9).toFixed(1)}`).join(" ")}`}
        stroke="#fffaf0"
        strokeWidth={10}
        filter="url(#hair-shine-blur)"
        style={{ opacity: 0 }}
      />
    </svg>
  );
}

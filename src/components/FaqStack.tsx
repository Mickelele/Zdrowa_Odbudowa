import { useEffect, useRef, type ReactNode } from "react";

/**
 * FAQ jako stos kart: przy przewijaniu każda karta przykleja się u góry ekranu,
 * a następna wjeżdża na nią – poprzednie lekko się zmniejszają i chowają pod spodem.
 */
export function FaqStack({ items }: { items: [string, ReactNode][] }) {
  const list = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = list.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cards = Array.from(el.querySelectorAll<HTMLElement>("[data-faq-card]"));
    let frame = 0;

    const draw = () => {
      frame = 0;
      cards.forEach((card, i) => {
        const inner = card.firstElementChild as HTMLElement | null;
        const next = cards[i + 1];
        if (!inner) return;
        if (!next) {
          inner.style.transform = "";
          inner.style.filter = "";
          inner.style.clipPath = "";
          return;
        }
        // jak bardzo następna karta zakryła tę (0 – wcale, 1 – całkowicie)
        const a = card.getBoundingClientRect();
        const b = next.getBoundingClientRect();
        const covered = Math.min(1, Math.max(0, (a.bottom - b.top) / a.height));
        inner.style.transform = `scale(${(1 - covered * 0.06).toFixed(4)})`;
        inner.style.filter = covered > 0 ? `brightness(${(1 - covered * 0.06).toFixed(3)})` : "";
        // wysoka karta nie może wystawać spod niższej, która na nią wjechała – przycinamy ją do dołu następnej
        const hidden = Math.max(0, a.bottom - b.bottom);
        inner.style.clipPath = covered > 0 && hidden > 0 ? `inset(0 0 ${hidden.toFixed(0)}px 0 round 1.5rem)` : "";
      });
    };
    // karta wyższa niż ekran przykleja się dopiero, gdy widać jej dół – inaczej nie dałoby się jej doczytać
    const layout = () => {
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      cards.forEach((card, i) => {
        const wanted = 5.5 * rem + i * 0.5 * rem;
        const fit = window.innerHeight - card.offsetHeight - 1.5 * rem;
        card.style.top = `${Math.min(wanted, fit)}px`;
      });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const onResize = () => {
      layout();
      onScroll();
    };

    layout();
    draw();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [items.length]);

  return (
    <div ref={list} className="pb-10">
      {items.map(([q, a], i) => (
        <div
          key={q}
          data-faq-card
          className="sticky mb-6 last:mb-0"
          // każda kolejna karta przykleja się odrobinę niżej – widać krawędzie kart pod spodem
          style={{ top: `calc(5.5rem + ${i * 0.5}rem)`, zIndex: i + 1 }}
        >
          <article className="origin-top rounded-3xl border border-primary/20 bg-card p-6 shadow-[0_-12px_40px_-22px_rgba(92,74,54,0.45)] will-change-transform md:p-8">
            <div className="flex gap-4 md:gap-6">
              <span className="shrink-0 font-display text-2xl leading-none text-primary/45 md:text-3xl">{String(i + 1).padStart(2, "0")}</span>
              <div className="min-w-0">
                <h3 className="font-narrow text-2xl leading-tight text-primary">{q}</h3>
                <div className="mt-2 text-[15px] leading-relaxed text-foreground/85">{a}</div>
              </div>
            </div>
          </article>
        </div>
      ))}
    </div>
  );
}

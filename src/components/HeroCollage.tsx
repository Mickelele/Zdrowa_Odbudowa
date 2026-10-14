import { useEffect, useRef } from "react";

/**
 * Kolaż 3 zdjęć na górze strony. Przy przewijaniu w dół zdjęcia rozjeżdżają się na boki
 * (łuk w lewo, dwa pozostałe w prawo – w górę i w dół), a przy przewijaniu w górę wracają.
 */

// [przesunięcie X, przesunięcie Y] jako ułamek szerokości kolażu, [obrót w stopniach] – dla pełnego rozjechania
const MOVES: [number, number, number][] = [
  [-0.62, 0.04, -9], // łuk
  [0.55, -0.22, 11], // wnętrze
  [0.6, 0.24, -7], // włosy
];

export function HeroCollage() {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = box.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const imgs = Array.from(el.querySelectorAll<HTMLImageElement>("img"));
    let frame = 0;

    const draw = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const top = rect.top + window.scrollY;
      // na komputerze startuje od razu, na telefonie – gdy kolaż dojedzie do ~60% wysokości ekranu
      const start = Math.max(0, top - vh * 0.6);
      const t = Math.min(1, Math.max(0, (window.scrollY - start) / (rect.height * 0.85)));
      const p = t * t * (3 - 2 * t); // płynny start i koniec
      const w = rect.width;
      imgs.forEach((img, i) => {
        const [mx, my, rot] = MOVES[i] ?? [0, 0, 0];
        img.style.transform = `translate3d(${(mx * w * p).toFixed(1)}px, ${(my * w * p).toFixed(1)}px, 0) rotate(${(rot * p).toFixed(2)}deg)`;
        img.style.opacity = String(1 - p * 0.6);
      });
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
  }, []);

  const base = "w-full object-cover shadow-sm will-change-transform";
  return (
    <div ref={box} className="relative mx-auto grid w-full max-w-lg grid-cols-2 gap-3 sm:gap-4">
      {/* łuk jak lustra w salonie */}
      <img src="/salon/lustra.webp" alt="Lustra w kształcie łuków w salonie Zdrowa Odbudowa w Kobyłce" className={`${base} row-span-2 h-full rounded-b-3xl rounded-t-full`} />
      <img src="/salon/wnetrze-1.webp" alt="Wnętrze salonu Zdrowa Odbudowa – stanowiska fryzjerskie" className={`${base} aspect-[4/5] rounded-3xl`} />
      <img src="/cennik/airtouch/1.webp" alt="Efekt koloryzacji Air Touch – lśniące, zdrowe włosy" className={`${base} aspect-[4/5] rounded-3xl`} />
    </div>
  );
}

import { useEffect, useRef } from "react";

/**
 * Kolaż 3 zdjęć na górze strony. Na komputerze przy przewijaniu w dół zdjęcia rozjeżdżają się na boki
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
    // tylko na dużych ekranach (kolaż obok tekstu); na telefonie i tablecie kolaż jest pod tekstem
    // i rozjeżdżałby się akurat wtedy, gdy się go ogląda – tam zdjęcia stoją w miejscu
    const desktop = window.matchMedia("(min-width: 1024px)");
    let frame = 0;

    const draw = () => {
      frame = 0;
      if (!desktop.matches) {
        imgs.forEach((img) => {
          img.style.transform = "";
          img.style.opacity = "";
        });
        return;
      }
      const rect = el.getBoundingClientRect();
      const t = Math.min(1, Math.max(0, window.scrollY / (rect.height * 0.85)));
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
    desktop.addEventListener("change", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      desktop.removeEventListener("change", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const base = "w-full object-cover shadow-sm will-change-transform";
  return (
    <div ref={box} className="relative mx-auto grid w-full max-w-lg grid-cols-2 gap-3 sm:gap-4">
      {/* łuk jak lustra w salonie */}
      <img src="/salon/lustra.webp" alt="Lustra w kształcie łuków w salonie Zdrowa Odbudowa w Kobyłce" width={900} height={1200} fetchPriority="high" className={`${base} row-span-2 h-full rounded-b-3xl rounded-t-full`} />
      <img src="/salon/wnetrze-1.webp" alt="Wnętrze salonu Zdrowa Odbudowa – stanowiska fryzjerskie" width={750} height={1000} className={`${base} aspect-[4/5] rounded-3xl`} />
      <img src="/cennik/airtouch/1.webp" alt="Efekt koloryzacji Air Touch – lśniące, zdrowe włosy" width={900} height={900} className={`${base} aspect-[4/5] rounded-3xl`} />
    </div>
  );
}

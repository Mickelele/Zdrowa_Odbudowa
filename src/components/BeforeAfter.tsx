import { useState } from "react";
import { ChevronsLeftRight } from "lucide-react";

/** Zdjęcie "przed i po" z suwakiem: przeciągnij linię, żeby porównać włosy przed zabiegiem i po nim. */
export function BeforeAfter({ before, after, label }: { before: string; after: string; label: string }) {
  const [pos, setPos] = useState(50);

  return (
    <div className="relative aspect-[3/4] select-none overflow-hidden rounded-3xl bg-secondary">
      <img src={after} alt={`${label} – po zabiegu`} loading="lazy" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
      <img
        src={before}
        alt={`${label} – przed zabiegiem`}
        loading="lazy"
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      />
      <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-card/90 px-3 py-0.5 font-narrow text-base uppercase tracking-wide text-foreground">Przed</span>
      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-primary px-3 py-0.5 font-narrow text-base uppercase tracking-wide text-primary-foreground">Po</span>
      {/* linia i uchwyt */}
      <div className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-card shadow-[0_0_6px_rgba(0,0,0,0.35)]" style={{ left: `${pos}%` }}>
        <span className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-card text-primary shadow-md">
          <ChevronsLeftRight className="h-5 w-5" />
        </span>
      </div>
      {/* niewidoczny suwak obsługuje mysz, dotyk i klawiaturę; pan-y zostawia przewijanie strony w pionie */}
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label={`${label}: przesuń, aby porównać przed i po`}
        className="absolute inset-0 h-full w-full cursor-ew-resize touch-pan-y opacity-0"
      />
    </div>
  );
}

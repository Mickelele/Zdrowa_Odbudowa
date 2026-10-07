import { pricing as fallbackPricing, type PriceCategory, type PriceVariant } from "@/data/pricing";
import { supabase } from "@/lib/supabase";

export type CategoryRow = { id: string; label: string; sort: number };
export type ServiceRow = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  badge: string | null;
  discount: string | null;
  images: string[];
  variants: PriceVariant[];
  sort: number;
};

/** Cennik z pliku – najniższa cena z 30 dni = cena regularna (tak jak podaje Booksy). */
function staticPricing(): PriceCategory[] {
  return fallbackPricing.map((c) => ({
    ...c,
    items: c.items.map((it) => ({ ...it, variants: it.variants.map((v) => (v.old ? { ...v, lowest30: v.old } : v)) })),
  }));
}

/** 1100 → "1 100,00 zł"; tekst zostaje bez zmian. */
export function formatPln(value: number | string) {
  if (typeof value === "string") return value;
  const [int, dec] = value.toFixed(2).split(".");
  return `${int!.replace(/\B(?=(\d{3})+(?!\d))/g, " ")},${dec} zł`;
}

export async function fetchPricingRows() {
  if (!supabase) throw new Error("Brak konfiguracji Supabase (VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY).");
  const [cats, fromView] = await Promise.all([
    supabase.from("price_categories").select("*").order("sort"),
    // widok dodaje do wariantów automatyczną "najniższą cenę z 30 dni" (lowest30)
    supabase.from("price_services_public").select("*").order("sort"),
  ]);
  // gdy widoku jeszcze nie ma (nie uruchomiono migracji historii cen) – czytamy samą tabelę
  const services = fromView.error ? await supabase.from("price_services").select("*").order("sort") : fromView;
  if (cats.error) throw cats.error;
  if (services.error) throw services.error;
  return { categories: cats.data as CategoryRow[], services: services.data as ServiceRow[] };
}

/** Cennik na stronę: z Supabase, a gdy baza jest niedostępna lub pusta – z pliku src/data/pricing.ts. */
export async function loadPricing(): Promise<PriceCategory[]> {
  try {
    const { categories, services } = await fetchPricingRows();
    if (categories.length === 0) return staticPricing();
    return categories.map((c) => ({
      id: c.id,
      label: c.label,
      items: services
        .filter((s) => s.category_id === c.id)
        .map((s) => ({
          name: s.name,
          ...(s.description && { desc: s.description }),
          ...(s.badge && { badge: s.badge }),
          ...(s.discount && { discount: s.discount }),
          images: s.images ?? [],
          variants: s.variants ?? [],
        })),
    }));
  } catch (e) {
    console.error("Nie udało się pobrać cennika z Supabase – używam danych zapasowych.", e);
    return staticPricing();
  }
}

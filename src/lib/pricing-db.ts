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

export async function fetchPricingRows() {
  if (!supabase) throw new Error("Brak konfiguracji Supabase (VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY).");
  const [cats, services] = await Promise.all([
    supabase.from("price_categories").select("*").order("sort"),
    supabase.from("price_services").select("*").order("sort"),
  ]);
  if (cats.error) throw cats.error;
  if (services.error) throw services.error;
  return { categories: cats.data as CategoryRow[], services: services.data as ServiceRow[] };
}

/** Cennik na stronę: z Supabase, a gdy baza jest niedostępna lub pusta – z pliku src/data/pricing.ts. */
export async function loadPricing(): Promise<PriceCategory[]> {
  try {
    const { categories, services } = await fetchPricingRows();
    if (categories.length === 0) return fallbackPricing;
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
    return fallbackPricing;
  }
}

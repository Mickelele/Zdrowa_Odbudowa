import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const isBrowser = typeof window !== "undefined";

/** Klient Supabase z kluczem publicznym – uprawnienia pilnuje RLS w bazie. */
export const supabase =
  url && key
    ? createClient(url, key, {
        auth: { persistSession: isBrowser, autoRefreshToken: isBrowser, detectSessionInUrl: false },
      })
    : null;

export const STORAGE_BUCKET = "cennik";

import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  ArrowDown, ArrowUp, Copy, ImagePlus, Loader2, LogOut, Pencil, Plus, Trash2, X, ArrowLeft, ArrowRight, Percent,
} from "lucide-react";
import { toast } from "sonner";

import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PriceVariant } from "@/data/pricing";
import { fetchPricingRows, type CategoryRow, type ServiceRow } from "@/lib/pricing-db";
import { STORAGE_BUCKET, supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Panel administracyjny – Zdrowa Odbudowa" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminPage,
});

// ---------- pomocnicze ----------

const errMsg = (e: unknown) => (e instanceof Error ? e.message : typeof e === "object" && e && "message" in e ? String(e.message) : String(e));

function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ł/g, "l")
    .replace(/Ł/g, "l")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** "1 100,00 zł" → 1100 */
function parsePrice(s: string): number | null {
  const n = Number(s.replace(/[^\d,.-]/g, "").replace(",", "."));
  return Number.isFinite(n) && /\d/.test(s) ? n : null;
}

/** 935 → "935,00 zł", 1190 → "1 190,00 zł" */
function formatPrice(n: number, plus = false) {
  const [int, dec] = n.toFixed(2).split(".");
  return `${int!.replace(/\B(?=(\d{3})+(?!\d))/g, " ")},${dec} zł${plus ? "+" : ""}`;
}

/** Zmniejsza zdjęcie do max 1200 px i zapisuje jako WebP przed wysłaniem. */
async function compressImage(file: File): Promise<Blob> {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 1200 / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.8));
    return blob ?? file;
  } catch {
    return file;
  }
}

// ---------- strona ----------

function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!supabase) return setReady(true);
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-secondary">
      <Toaster position="top-center" richColors />
      {!supabase ? (
        <Centered>
          <p>Brak konfiguracji Supabase. Uzupełnij VITE_SUPABASE_URL i VITE_SUPABASE_PUBLISHABLE_KEY w pliku .env.</p>
        </Centered>
      ) : !ready ? (
        <Centered><Loader2 className="h-6 w-6 animate-spin text-primary" /></Centered>
      ) : !session ? (
        <LoginForm />
      ) : (
        <AdminGate session={session} />
      )}
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen items-center justify-center p-4 text-center">{children}</div>;
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase!.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) toast.error("Nie udało się zalogować", { description: error.message });
  };

  return (
    <Centered>
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl border border-border bg-card p-8 text-left shadow-sm">
        <div className="text-center">
          <img src="/logo.png" alt="" className="mx-auto h-16 w-16 rounded-full" />
          <h1 className="mt-3 font-display text-2xl uppercase text-primary">Panel admina</h1>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Hasło</Label>
          <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" className="w-full" disabled={busy}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Zaloguj
        </Button>
        <Link to="/" className="block text-center text-sm text-muted-foreground hover:text-primary">← Wróć na stronę</Link>
      </form>
    </Centered>
  );
}

function AdminGate({ session }: { session: Session }) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    supabase!.rpc("is_admin").then(({ data, error }) => setIsAdmin(!error && data === true));
  }, [session.user.id]);

  if (isAdmin === null) return <Centered><Loader2 className="h-6 w-6 animate-spin text-primary" /></Centered>;
  if (!isAdmin)
    return (
      <Centered>
        <div className="max-w-md space-y-4 rounded-2xl border border-border bg-card p-8">
          <p>Konto <b>{session.user.email}</b> nie ma uprawnień administratora.</p>
          <Button variant="outline" onClick={() => supabase!.auth.signOut()}>Wyloguj</Button>
        </div>
      </Centered>
    );
  return <Dashboard email={session.user.email ?? ""} />;
}

// ---------- panel ----------

function Dashboard({ email }: { email: string }) {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [editing, setEditing] = useState<Partial<ServiceRow> | null>(null);

  const reload = useCallback(async () => {
    try {
      const r = await fetchPricingRows();
      setCategories(r.categories);
      setServices(r.services);
      setSelected((s) => (s && r.categories.some((c) => c.id === s) ? s : (r.categories[0]?.id ?? null)));
    } catch (e) {
      toast.error("Nie udało się wczytać cennika", { description: errMsg(e) });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const catServices = useMemo(
    () => services.filter((s) => s.category_id === selected).sort((a, b) => a.sort - b.sort),
    [services, selected],
  );
  const currentCat = categories.find((c) => c.id === selected);

  const run = async (label: string, fn: () => Promise<{ error: unknown } | void>) => {
    const res = await fn();
    if (res && res.error) toast.error(label, { description: errMsg(res.error) });
    await reload();
  };

  /** Zamienia kolejność dwóch elementów i zapisuje nowe wartości sort. */
  const move = async (table: "price_categories" | "price_services", list: { id: string }[], index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= list.length) return;
    const order = [...list];
    [order[index], order[j]] = [order[j]!, order[index]!];
    await run("Nie udało się zmienić kolejności", async () => {
      const results = await Promise.all(order.map((row, sort) => supabase!.from(table).update({ sort }).eq("id", row.id)));
      return { error: results.find((r) => r.error)?.error ?? null };
    });
  };

  const addCategory = async () => {
    const label = window.prompt("Nazwa nowej kategorii (możesz dodać emoji):");
    if (!label?.trim()) return;
    let id = slugify(label) || "kategoria";
    while (categories.some((c) => c.id === id)) id += "-2";
    const sort = Math.max(-1, ...categories.map((c) => c.sort)) + 1;
    await run("Nie udało się dodać kategorii", async () => supabase!.from("price_categories").insert({ id, label: label.trim(), sort }));
    setSelected(id);
  };

  const renameCategory = async (c: CategoryRow) => {
    const label = window.prompt("Nowa nazwa kategorii:", c.label);
    if (!label?.trim() || label === c.label) return;
    await run("Nie udało się zmienić nazwy", async () => supabase!.from("price_categories").update({ label: label.trim() }).eq("id", c.id));
  };

  const deleteCategory = async (c: CategoryRow) => {
    const count = services.filter((s) => s.category_id === c.id).length;
    if (!window.confirm(`Usunąć kategorię „${c.label}”${count ? ` razem z ${count} usługami` : ""}? Tego nie da się cofnąć.`)) return;
    await run("Nie udało się usunąć kategorii", async () => supabase!.from("price_categories").delete().eq("id", c.id));
  };

  const deleteService = async (s: ServiceRow) => {
    if (!window.confirm(`Usunąć usługę „${s.name}”? Tego nie da się cofnąć.`)) return;
    await run("Nie udało się usunąć usługi", async () => supabase!.from("price_services").delete().eq("id", s.id));
    toast.success("Usunięto usługę");
  };

  const duplicateService = async (s: ServiceRow) => {
    const { id: _id, ...rest } = s;
    const sort = Math.max(-1, ...catServices.map((x) => x.sort)) + 1;
    await run("Nie udało się skopiować", async () => supabase!.from("price_services").insert({ ...rest, name: `${s.name} (kopia)`, sort }));
    toast.success("Skopiowano usługę");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="" className="h-10 w-10 rounded-full" />
          <h1 className="font-display text-2xl uppercase text-primary">Cennik – panel admina</h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="hidden sm:inline">{email}</span>
          <Button variant="outline" size="sm" asChild><a href="/#cennik" target="_blank" rel="noopener">Podgląd strony</a></Button>
          <Button variant="ghost" size="sm" onClick={() => supabase!.auth.signOut()}><LogOut className="h-4 w-4" /> Wyloguj</Button>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="grid gap-6 md:grid-cols-[260px_1fr]">
          {/* KATEGORIE */}
          <aside className="space-y-2">
            <h2 className="px-1 font-narrow text-lg uppercase tracking-wide text-muted-foreground">Kategorie</h2>
            {categories.map((c, i) => (
              <div
                key={c.id}
                className={`group flex items-center gap-1 rounded-xl border px-3 py-2 ${c.id === selected ? "border-primary bg-card" : "border-transparent hover:bg-card/60"}`}
              >
                <button className="min-w-0 flex-1 truncate text-left text-sm font-medium" onClick={() => setSelected(c.id)}>
                  {c.label}
                  <span className="ml-1 text-xs text-muted-foreground">({services.filter((s) => s.category_id === c.id).length})</span>
                </button>
                <IconBtn title="W górę" onClick={() => move("price_categories", categories, i, -1)} disabled={i === 0}><ArrowUp /></IconBtn>
                <IconBtn title="W dół" onClick={() => move("price_categories", categories, i, 1)} disabled={i === categories.length - 1}><ArrowDown /></IconBtn>
              </div>
            ))}
            <Button variant="outline" className="w-full" onClick={addCategory}><Plus className="h-4 w-4" /> Dodaj kategorię</Button>
          </aside>

          {/* USŁUGI */}
          <main className="min-w-0">
            {currentCat ? (
              <>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-display text-2xl uppercase text-primary">{currentCat.label}</h2>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="ghost" size="sm" onClick={() => renameCategory(currentCat)}><Pencil className="h-4 w-4" /> Zmień nazwę</Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteCategory(currentCat)}><Trash2 className="h-4 w-4" /> Usuń kategorię</Button>
                    <Button size="sm" onClick={() => setEditing({ category_id: currentCat.id, variants: [{ price: "" }], images: [] })}>
                      <Plus className="h-4 w-4" /> Dodaj usługę
                    </Button>
                  </div>
                </div>

                {catServices.length === 0 && (
                  <p className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">Brak usług w tej kategorii.</p>
                )}
                <ul className="space-y-3">
                  {catServices.map((s, i) => (
                    <li key={s.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
                      {s.images[0] ? (
                        <img src={s.images[0]} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                      ) : (
                        <div className="h-14 w-14 shrink-0 rounded-lg bg-secondary" />
                      )}
                      <button className="min-w-0 flex-1 text-left" onClick={() => setEditing(s)}>
                        <p className="truncate font-medium">{s.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {s.discount && <span className="mr-2 font-semibold text-primary">{s.discount}</span>}
                          {s.variants.map((v) => [v.label, v.price].filter(Boolean).join(": ")).join(" · ")}
                        </p>
                      </button>
                      <div className="flex shrink-0 items-center">
                        <IconBtn title="W górę" onClick={() => move("price_services", catServices, i, -1)} disabled={i === 0}><ArrowUp /></IconBtn>
                        <IconBtn title="W dół" onClick={() => move("price_services", catServices, i, 1)} disabled={i === catServices.length - 1}><ArrowDown /></IconBtn>
                        <IconBtn title="Edytuj" onClick={() => setEditing(s)}><Pencil /></IconBtn>
                        <IconBtn title="Duplikuj" onClick={() => duplicateService(s)}><Copy /></IconBtn>
                        <IconBtn title="Usuń" onClick={() => deleteService(s)} className="text-destructive"><Trash2 /></IconBtn>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
                Brak kategorii. Dodaj pierwszą kategorię po lewej.
              </p>
            )}
          </main>
        </div>
      )}

      {editing && (
        <ServiceDialog
          initial={editing}
          categories={categories}
          services={services}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await reload();
          }}
        />
      )}
    </div>
  );
}

function IconBtn({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`rounded-md p-1.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-30 [&_svg]:h-4 [&_svg]:w-4 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// ---------- edycja usługi ----------

type FormVariant = { label: string; old: string; price: string; time: string };
const toForm = (v: PriceVariant): FormVariant => ({ label: v.label ?? "", old: v.old ?? "", price: v.price, time: v.time ?? "" });
const fromForm = (v: FormVariant): PriceVariant => {
  const out: PriceVariant = { price: v.price.trim() };
  if (v.label.trim()) out.label = v.label.trim();
  if (v.old.trim()) out.old = v.old.trim();
  if (v.time.trim()) out.time = v.time.trim();
  return out;
};

function ServiceDialog({
  initial, categories, services, onClose, onSaved,
}: {
  initial: Partial<ServiceRow>;
  categories: CategoryRow[];
  services: ServiceRow[];
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [name, setName] = useState(initial.name ?? "");
  const [description, setDescription] = useState(initial.description ?? "");
  const [badge, setBadge] = useState(initial.badge ?? "");
  const [discount, setDiscount] = useState(initial.discount ?? "");
  const [categoryId, setCategoryId] = useState(initial.category_id ?? categories[0]?.id ?? "");
  const [variants, setVariants] = useState<FormVariant[]>((initial.variants ?? [{ price: "" }]).map(toForm));
  const [images, setImages] = useState<string[]>(initial.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const setVar = (i: number, patch: Partial<FormVariant>) => setVariants((vs) => vs.map((v, j) => (j === i ? { ...v, ...patch } : v)));

  /** Wylicza cenę promocyjną z ceny regularnej i rabatu, np. 100 zł i -15% → 85,00 zł. */
  const applyDiscount = () => {
    const pct = Math.abs(parsePrice(discount) ?? NaN);
    if (!Number.isFinite(pct) || pct <= 0 || pct >= 100) { toast.error("Wpisz rabat, np. -15%"); return; }
    let changed = 0;
    const next = variants.map((v) => {
      const base = parsePrice(v.old);
      if (base === null) return v;
      changed++;
      return { ...v, price: formatPrice(Math.round(base * (100 - pct)) / 100, v.old.trim().endsWith("+")) };
    });
    if (!changed) { toast.info("Uzupełnij najpierw „cenę regularną”."); return; }
    setVariants(next);
    toast.success(`Przeliczono ceny (-${pct}%)`);
  };

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const blob = await compressImage(file);
        const ext = blob.type === "image/webp" ? "webp" : (file.name.split(".").pop() ?? "jpg");
        const path = `${slugify(name) || "usluga"}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await supabase!.storage.from(STORAGE_BUCKET).upload(path, blob, { contentType: blob.type || file.type, cacheControl: "31536000" });
        if (error) throw error;
        urls.push(supabase!.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl);
      }
      setImages((im) => [...im, ...urls]);
      toast.success(`Dodano zdjęcia: ${urls.length}`);
    } catch (e) {
      toast.error("Nie udało się wysłać zdjęcia", { description: errMsg(e) });
    } finally {
      setUploading(false);
    }
  };

  const moveImage = (i: number, dir: -1 | 1) =>
    setImages((im) => {
      const j = i + dir;
      if (j < 0 || j >= im.length) return im;
      const n = [...im];
      [n[i], n[j]] = [n[j]!, n[i]!];
      return n;
    });

  const save = async (e: FormEvent) => {
    e.preventDefault();
    const cleanVariants = variants.filter((v) => v.price.trim() || v.label.trim()).map(fromForm);
    if (!name.trim()) { toast.error("Podaj nazwę usługi"); return; }
    if (cleanVariants.length === 0) { toast.error("Dodaj co najmniej jedną cenę"); return; }
    if (cleanVariants.some((v) => !v.price)) { toast.error("Każdy wariant musi mieć cenę (np. „Cena zmienna”)"); return; }

    const row = {
      name: name.trim(),
      description: description.trim() || null,
      badge: badge.trim() || null,
      discount: discount.trim() || null,
      category_id: categoryId,
      images,
      variants: cleanVariants,
      updated_at: new Date().toISOString(),
    };
    const movedOrNew = !initial.id || initial.category_id !== categoryId;
    const sort = movedOrNew
      ? Math.max(-1, ...services.filter((s) => s.category_id === categoryId).map((s) => s.sort)) + 1
      : initial.sort;

    setSaving(true);
    const { error } = initial.id
      ? await supabase!.from("price_services").update({ ...row, sort }).eq("id", initial.id)
      : await supabase!.from("price_services").insert({ ...row, sort });
    setSaving(false);
    if (error) { toast.error("Nie udało się zapisać", { description: errMsg(error) }); return; }
    toast.success(initial.id ? "Zapisano zmiany" : "Dodano usługę");
    await onSaved();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl uppercase text-primary">{initial.id ? "Edytuj usługę" : "Nowa usługa"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={save} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="name">Nazwa usługi *</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="np. Nanoplastia Basic" required />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="desc">Opis</Label>
              <Textarea id="desc" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Kategoria</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="discount">Rabat</Label>
                <Input id="discount" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="np. -15%" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="badge">Plakietka</Label>
                <Input id="badge" value={badge} onChange={(e) => setBadge(e.target.value)} placeholder="np. HIT" />
              </div>
            </div>
          </div>

          {/* CENY */}
          <section className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-narrow text-xl uppercase tracking-wide">Ceny</h3>
              <Button type="button" variant="outline" size="sm" onClick={applyDiscount} title="Wylicz cenę promocyjną z ceny regularnej i rabatu">
                <Percent className="h-4 w-4" /> Przelicz z rabatu
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              „Cena regularna” wyświetla się jako przekreślona (najniższa cena z 30 dni). Zostaw ją pustą, jeśli usługa nie jest w promocji.
            </p>
            <div className="space-y-2">
              {variants.map((v, i) => (
                <div key={i} className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-secondary/40 p-2 sm:grid-cols-[1.6fr_1fr_1fr_0.8fr_auto]">
                  <Input aria-label="Wariant" className="col-span-2 sm:col-span-1" placeholder="Wariant, np. Włosy do ramion" value={v.label} onChange={(e) => setVar(i, { label: e.target.value })} />
                  <Input aria-label="Cena regularna" placeholder="Regularna: 100,00 zł" value={v.old} onChange={(e) => setVar(i, { old: e.target.value })} />
                  <Input aria-label="Cena" placeholder="Cena: 85,00 zł" value={v.price} onChange={(e) => setVar(i, { price: e.target.value })} />
                  <Input aria-label="Czas" placeholder="Czas: 40 min" value={v.time} onChange={(e) => setVar(i, { time: e.target.value })} />
                  <IconBtn title="Usuń wariant" className="justify-self-end text-destructive" onClick={() => setVariants((vs) => vs.filter((_, j) => j !== i))}><X /></IconBtn>
                </div>
              ))}
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => setVariants((vs) => [...vs, { label: "", old: "", price: "", time: "" }])}>
              <Plus className="h-4 w-4" /> Dodaj wariant ceny
            </Button>
          </section>

          {/* ZDJĘCIA */}
          <section className="space-y-2">
            <h3 className="font-narrow text-xl uppercase tracking-wide">Zdjęcia</h3>
            <p className="text-xs text-muted-foreground">Pierwsze 4 zdjęcia widać w karcie, resztę po kliknięciu. Zdjęcia są automatycznie zmniejszane.</p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {images.map((src, i) => (
                <div key={src} className="group relative aspect-square overflow-hidden rounded-lg border border-border">
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 flex justify-between bg-foreground/60 p-1 text-background opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                    <IconBtn title="W lewo" className="text-background hover:bg-transparent hover:text-background" onClick={() => moveImage(i, -1)} disabled={i === 0}><ArrowLeft /></IconBtn>
                    <IconBtn title="Usuń zdjęcie" className="text-background hover:bg-transparent hover:text-background" onClick={() => setImages((im) => im.filter((_, j) => j !== i))}><Trash2 /></IconBtn>
                    <IconBtn title="W prawo" className="text-background hover:bg-transparent hover:text-background" onClick={() => moveImage(i, 1)} disabled={i === images.length - 1}><ArrowRight /></IconBtn>
                  </div>
                </div>
              ))}
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border text-xs text-muted-foreground hover:border-primary hover:text-primary">
                {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6" />}
                {uploading ? "Wysyłanie…" : "Dodaj zdjęcia"}
                <input type="file" accept="image/*" multiple className="sr-only" disabled={uploading} onChange={(e) => { void upload(e.target.files); e.target.value = ""; }} />
              </label>
            </div>
          </section>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Anuluj</Button>
            <Button type="submit" disabled={saving || uploading}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} Zapisz
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

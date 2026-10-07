-- Cennik: kategorie, usługi, administratorzy i bucket na zdjęcia.
-- Uruchom w Supabase: SQL Editor → New query → wklej całość → Run.

-- ============ Tabele ============

create table if not exists public.price_categories (
  id text primary key,
  label text not null,
  sort integer not null default 0
);

create table if not exists public.price_services (
  id uuid primary key default gen_random_uuid(),
  category_id text not null references public.price_categories (id) on update cascade on delete cascade,
  name text not null,
  description text,
  badge text,
  discount text,
  images text[] not null default '{}',
  -- [{ "label": "Włosy do ramion", "old": "100,00 zł", "price": "85,00 zł", "time": "40 min" }]
  variants jsonb not null default '[]'::jsonb,
  sort integer not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists price_services_category_sort_idx on public.price_services (category_id, sort);

create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

-- ============ Uprawnienia ============

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

grant execute on function public.is_admin() to anon, authenticated;

alter table public.price_categories enable row level security;
alter table public.price_services enable row level security;
alter table public.admins enable row level security;

grant select on public.price_categories, public.price_services to anon, authenticated;
grant insert, update, delete on public.price_categories, public.price_services to authenticated;
grant select on public.admins to authenticated;

-- Każdy może czytać cennik
drop policy if exists "cennik: odczyt publiczny" on public.price_categories;
create policy "cennik: odczyt publiczny" on public.price_categories for select using (true);
drop policy if exists "cennik: odczyt publiczny" on public.price_services;
create policy "cennik: odczyt publiczny" on public.price_services for select using (true);

-- Tylko administratorzy mogą zmieniać cennik
drop policy if exists "cennik: zapis admin" on public.price_categories;
create policy "cennik: zapis admin" on public.price_categories for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists "cennik: zapis admin" on public.price_services;
create policy "cennik: zapis admin" on public.price_services for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Zalogowany użytkownik widzi tylko swój wpis w admins (lista adminów zarządzana z dashboardu)
drop policy if exists "admins: własny wpis" on public.admins;
create policy "admins: własny wpis" on public.admins for select to authenticated
  using (user_id = auth.uid());

-- ============ Zdjęcia (Storage) ============

insert into storage.buckets (id, name, public)
values ('cennik', 'cennik', true)
on conflict (id) do update set public = true;

drop policy if exists "cennik: upload admin" on storage.objects;
create policy "cennik: upload admin" on storage.objects for insert to authenticated
  with check (bucket_id = 'cennik' and public.is_admin());
drop policy if exists "cennik: update admin" on storage.objects;
create policy "cennik: update admin" on storage.objects for update to authenticated
  using (bucket_id = 'cennik' and public.is_admin());
drop policy if exists "cennik: delete admin" on storage.objects;
create policy "cennik: delete admin" on storage.objects for delete to authenticated
  using (bucket_id = 'cennik' and public.is_admin());

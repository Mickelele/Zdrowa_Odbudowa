-- Historia cen i automatyczna "najniższa cena z 30 dni przed obniżką" (dyrektywa Omnibus).
-- Uruchom w Supabase: SQL Editor → New query → wklej całość → Run. Można uruchomić ponownie.
--
-- Jak to działa:
--  * przy każdym zapisie usługi trigger zapisuje do price_history cenę każdego wariantu, jeśli się zmieniła,
--  * widok price_services_public dodaje do wariantów pole "lowest30" – najniższą cenę obowiązującą
--    w 30 dniach przed wprowadzeniem aktualnej (niższej) ceny. Gdy aktualna cena nie jest obniżką, pola nie ma.
--  * warianty rozpoznawane są po nazwie (label) – zmiana nazwy wariantu zaczyna jego historię od nowa.

-- ============ Historia ============

create table if not exists public.price_history (
  id bigint generated always as identity primary key,
  service_id uuid not null references public.price_services (id) on delete cascade,
  variant_key text not null,
  price numeric(10, 2) not null,
  valid_from timestamptz not null default now()
);

create index if not exists price_history_lookup_idx on public.price_history (service_id, variant_key, valid_from desc);

alter table public.price_history enable row level security;
grant select on public.price_history to anon, authenticated;
drop policy if exists "historia: odczyt publiczny" on public.price_history;
create policy "historia: odczyt publiczny" on public.price_history for select using (true);

-- "1 100,00 zł" → 1100.00, "Cena zmienna" → null
create or replace function public.parse_price(t text)
returns numeric
language plpgsql
immutable
set search_path = ''
as $$
declare
  s text;
begin
  if t is null or t !~ '\d' then
    return null;
  end if;
  s := replace(regexp_replace(t, '[^0-9,]', '', 'g'), ',', '.');
  return s::numeric;
exception when others then
  return null;
end;
$$;

-- ============ Zapisywanie zmian cen ============

create or replace function public.record_price_history()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v jsonb;
  k text;
  p numeric;
  prev numeric;
begin
  for v in select value from jsonb_array_elements(coalesce(new.variants, '[]'::jsonb)) loop
    k := coalesce(v ->> 'label', '');
    p := public.parse_price(v ->> 'price');
    continue when p is null;

    select h.price into prev
    from public.price_history h
    where h.service_id = new.id and h.variant_key = k
    order by h.valid_from desc, h.id desc
    limit 1;

    if prev is distinct from p then
      insert into public.price_history (service_id, variant_key, price) values (new.id, k, p);
    end if;
  end loop;
  return new;
end;
$$;

drop trigger if exists price_services_history on public.price_services;
create trigger price_services_history
  after insert or update of variants on public.price_services
  for each row execute function public.record_price_history();

-- ============ Najniższa cena z 30 dni przed obniżką ============

create or replace function public.lowest_price_30d(p_service uuid, p_key text)
returns numeric
language sql
stable
set search_path = ''
as $$
  with cur as (
    select h.price, h.valid_from
    from public.price_history h
    where h.service_id = p_service and h.variant_key = p_key
    order by h.valid_from desc, h.id desc
    limit 1
  ),
  win as (
    -- ceny wprowadzone w ciągu 30 dni przed obecną ceną
    select h.price
    from public.price_history h, cur
    where h.service_id = p_service and h.variant_key = p_key
      and h.valid_from < cur.valid_from
      and h.valid_from >= cur.valid_from - interval '30 days'
    union all
    -- cena, która obowiązywała na początku tego okna
    select b.price from (
      select h.price
      from public.price_history h, cur
      where h.service_id = p_service and h.variant_key = p_key
        and h.valid_from < cur.valid_from - interval '30 days'
      order by h.valid_from desc, h.id desc
      limit 1
    ) b
  )
  select case when min(win.price) > (select price from cur) then min(win.price) end
  from win;
$$;

grant execute on function public.lowest_price_30d(uuid, text) to anon, authenticated;

create or replace view public.price_services_public
with (security_invoker = true)
as
select
  s.id,
  s.category_id,
  s.name,
  s.description,
  s.badge,
  s.discount,
  s.images,
  coalesce((
    select jsonb_agg(
      case when l.low is not null then (e.value - 'lowest30') || jsonb_build_object('lowest30', l.low) else e.value - 'lowest30' end
      order by e.ord
    )
    from jsonb_array_elements(s.variants) with ordinality as e(value, ord)
    cross join lateral (select public.lowest_price_30d(s.id, coalesce(e.value ->> 'label', '')) as low) l
  ), '[]'::jsonb) as variants,
  s.sort,
  s.updated_at
from public.price_services s;

grant select on public.price_services_public to anon, authenticated;

-- ============ Historia startowa ============
-- Obecne promocje: cena regularna obowiązywała wcześniej (jak podaje Booksy), cena promocyjna od dziś.
-- Usługi bez promocji: obecna cena obowiązuje od dawna. Wykonuje się tylko, gdy historia jest pusta.

do $$
begin
  if exists (select 1 from public.price_history) then
    return;
  end if;

  insert into public.price_history (service_id, variant_key, price, valid_from)
  select s.id, coalesce(e ->> 'label', ''), public.parse_price(e ->> 'old'), now() - interval '60 days'
  from public.price_services s, jsonb_array_elements(s.variants) e
  where public.parse_price(e ->> 'old') is not null
    and public.parse_price(e ->> 'price') is not null;

  insert into public.price_history (service_id, variant_key, price, valid_from)
  select
    s.id,
    coalesce(e ->> 'label', ''),
    public.parse_price(e ->> 'price'),
    case when public.parse_price(e ->> 'old') is not null then now() else now() - interval '60 days' end
  from public.price_services s, jsonb_array_elements(s.variants) e
  where public.parse_price(e ->> 'price') is not null;
end;
$$;

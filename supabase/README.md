# Panel admina – konfiguracja Supabase

Panel jest pod adresem **`/admin`** (np. `https://twoja-domena.pl/admin`).

## 1. Utwórz tabele (jednorazowo)

Supabase → **SQL Editor** → **New query** → wklej całą zawartość pliku
[`migrations/20261007120000_cennik.sql`](migrations/20261007120000_cennik.sql) → **Run**.

## 2. Wgraj obecny cennik (jednorazowo)

Nowe zapytanie → wklej [`seed.sql`](seed.sql) → **Run**.
Jeśli w bazie są już usługi, skrypt nic nie zrobi.

## 3. Załóż konto administratora

1. **Authentication → Users → Add user → Create new user** – wpisz e-mail i hasło, zaznacz *Auto Confirm User*.
2. W **SQL Editor** nadaj mu uprawnienia (podmień e-mail):

   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'twoj@email.pl';
   ```

3. Zalecane: **Authentication → Sign In / Providers → Email** – wyłącz *Allow new users to sign up*,
   żeby nikt obcy nie mógł założyć konta (i tak nie miałby uprawnień, ale tak jest czyściej).

## Jak to działa

- Strona czyta cennik z tabel `price_categories` i `price_services`. Gdy baza jest niedostępna
  lub pusta, pokazuje cennik zapasowy z `src/data/pricing.ts`.
- Zmieniać dane mogą tylko użytkownicy wpisani do tabeli `admins` (pilnują tego reguły RLS w bazie).
- Zdjęcia dodane w panelu trafiają do publicznego bucketu Storage `cennik`.
- W projekcie jest tylko klucz **publiczny** (`.env`). Klucza `sb_secret_…` nie wpisuj do kodu ani do `.env`.

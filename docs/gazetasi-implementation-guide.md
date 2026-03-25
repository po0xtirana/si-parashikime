# Udhezues Implementimi: Si Parashikime per Gazeta Si

Ky dokument shpjegon hap pas hapi si te merret projekti, si te lidhet me databazen e re, si te behet deploy, dhe si te implementohet hyrja me te njejtin account mes `www.gazetasi.al` dhe `market.gazetasi.al`.

Ky dokument eshte shkruar qe te jete praktik. Qellimi nuk eshte teoria, por cfare duhet bere realisht.

## 1. Cfare po implementoni

Ky projekt eshte nje prediction market i ndertuar me:

- `React + Vite + TypeScript`
- `Tailwind + shadcn/ui`
- `Supabase` per databaze, role, auth dhe SQL functions

Funksionalitetet kryesore:

- faqja kryesore me tregje `Po / Jo`
- tregje individuale me mundesi basti
- panel admin te ` /admin `
- aktivitet live
- artikull i lidhur me tregun
- role `admin`

## 2. Cfare ju duhet para se te filloni

Duhet t'i keni gati keto:

1. akses ne repo:
   - `https://github.com/po0xtirana/si-parashikime`
2. nje projekt te ri `Supabase`
3. nje domain ose subdomain:
   - rekomandohet `market.gazetasi.al`
4. akses ne WordPress te `www.gazetasi.al`
5. nje plugin `OAuth` ose `OpenID Connect` server ne WordPress, nese do SSO

## 3. Cilet skedare duhen ndryshuar

Skedaret kryesore qe duhen prekur kur e merrni projektin:

- `.env`
- `supabase/config.toml`
- `src/integrations/supabase/types.ts`

Nese do implementoni SSO me WordPress, do duhen prekur edhe:

- `src/pages/Auth.tsx`
- `src/hooks/useAuth.tsx`
- `src/App.tsx`

Me shume gjasa do shtohet edhe nje endpoint callback ne backend.

## 4. Hapi 1: Shkarkoni dhe nisni projektin

Ne terminal:

```powershell
git clone https://github.com/po0xtirana/si-parashikime.git
cd si-parashikime
npm install
```

Per ta nisur lokalisht:

```powershell
npm run dev
```

Per build:

```powershell
npm run build
```

Per test:

```powershell
npm test
```

## 5. Hapi 2: Krijoni dhe lidhni Supabase-in e ri

Krijoni nje projekt te ri ne `Supabase`.

Pastaj merrni keto vlera nga dashboard:

1. `Project URL`
2. `Publishable key`
3. `Project ref`

Mos perdorni ne frontend:

- `sb_secret_*`
- `service_role`

Keto duhen vetem per backend ose scripts te brendshme.

## 6. Hapi 3: Mbushni `.env`

Kopjoni:

- `.env.example` -> `.env`

Pastaj ndryshoni vlerat:

```env
VITE_SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="YOUR_PUBLISHABLE_KEY"
```

Rregull i rendesishem:

- cdo gje qe fillon me `VITE_` shkon ne frontend
- pra aty futen vetem vlera publike

## 7. Hapi 4: Ndryshoni `supabase/config.toml`

Hapni skedarin:

- `supabase/config.toml`

Ndryshoni:

```toml
project_id = "your-supabase-project-ref"
```

me:

```toml
project_id = "REAL_PROJECT_REF"
```

## 8. Hapi 5: Aplikoni databazen

Ne terminal ekzekutoni:

```powershell
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

Kjo ben:

1. lidh projektin lokal me Supabase-in e ri
2. ekzekuton te gjitha SQL migrations qe jane ne repo
3. krijon tabelat, funksionet dhe ndryshimet e nevojshme

Migrimet ndodhen ne:

- `supabase/migrations/`

## 9. Hapi 6: Rigjeneroni tipet TypeScript

Pas migrimeve, ekzekutoni:

```powershell
npx supabase gen types typescript --linked --schema public > src/integrations/supabase/types.ts
```

Kjo siguron qe frontend-i te perdore tipet e sakta sipas databazes reale.

## 10. Cfare ka ne databaze

Tabelat kryesore:

- `profiles`
  - te dhenat baze te perdoruesit
- `user_roles`
  - role si `admin`
- `markets`
  - tregjet
- `bets`
  - bastet
- `price_history`
  - te dhenat e grafikut

Kolona te rendesishme:

- `markets.article_url`
  - link opsional drejt artikullit te Gazeta Si
- `bets.is_public`
  - nese emri i perdoruesit shfaqet te aktiviteti live

## 11. Hapi 7: Krijoni adminin e pare

Paneli admin ndodhet te:

- `/admin`

Qe nje user ta hape kete faqe, duhet te kete rolin `admin`.

Rrjedha e sakte:

1. krijoni nje account normal ne website
2. hapni `Supabase SQL Editor`
3. ekzekutoni kete query per te gjetur user-in:

```sql
select id, email
from auth.users
order by created_at desc;
```

4. merrni `id` e user-it
5. jepini rolin `admin`:

```sql
insert into public.user_roles (user_id, role)
values ('USER_ID_KETU', 'admin')
on conflict do nothing;
```

Pas kesaj, ai user mund te hape:

- `https://market.gazetasi.al/admin`

ose lokalisht:

- `http://localhost:8080/admin`

## 12. Si perdoret paneli admin

Nga `/admin` mund te:

- krijoni tregje
- vendosni titullin
- pershkrimin
- kategorine
- daten e mbylljes
- vleren fillestare `Po / Jo`
- nje imazh, nese deshironi
- nje `article_url`, nese deshironi artikull te lidhur

Pra workflow editorial eshte:

1. botohet nje artikull ne Gazeta Si
2. krijohet nje treg ne `/admin`
3. artikulli lidhet me `article_url`
4. tregu del ne homepage dhe ne faqen individuale

## 13. Si behet deploy

Rekomandohet:

- `www.gazetasi.al` te mbetet WordPress
- `market.gazetasi.al` te jete prediction market

Settings e deploy-it:

- `Build command`: `npm run build`
- `Output directory`: `dist`

Variablat e ambientit qe duhen vendosur edhe ne platformen e deploy-it:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Opsione te mira per deploy:

1. `Vercel`
2. `Netlify`
3. `Cloudflare Pages`
4. `VPS me Nginx`

## 14. Si behet hyrja me te njejtin account me WordPress

Objektivi:

- user logon ne `www.gazetasi.al`
- pastaj hap `market.gazetasi.al`
- dhe futet pa login te dyte

### Cfare nuk duhet bere

Mos u mundoni te ndani cookie-te e WordPress direkt me React app.

Kjo krijon probleme me:

- sigurine
- sesionet
- skadimin e login-it
- mirembajtjen afatgjate

### Qasja e sakte

Përdorni:

- `WordPress` si burim kryesor i identitetit
- `OAuth 2.0 / OpenID Connect`
- `market.gazetasi.al` si klient qe ben login te WordPress

## 15. Implementimi i sakte i SSO

### Ne WordPress duhen bere keto

1. instaloni nje plugin qe e ben WordPress `OAuth/OIDC Server`
2. krijoni nje client per market-in
3. vendosni `redirect URI`:

```text
https://market.gazetasi.al/auth/callback
```

4. aktivizoni `scopes`:

```text
openid email profile
```

5. ruani keto vlera:

- `client_id`
- `client_secret`
- `issuer`
- `authorize_url`
- `token_url`
- `userinfo_url` nese ekziston

### Ne aplikacion duhen bere keto

Duhet ndryshuar login-i aktual.

Aktualisht projekti perdor login me email/password ne Supabase.

Per versionin final me Gazeta Si duhet:

1. te hiqet regjistrimi klasik ose te fshihet nga UI
2. te shtohet butoni `Hyr me Gazeta Si`
3. te shtohet route:
   - `/auth/callback`
4. ne callback te merret `code` nga WordPress
5. ky `code` te shkembyhet me token te WordPress
6. te merret profili i user-it nga WordPress
7. te krijohet ose gjendet user-i perkates ne Supabase
8. te krijohet sesion ne market

## 16. Si lidhet user-i i WordPress me user-in e market-it

Ne Supabase shtoni nje tabele te re:

```sql
create table if not exists public.external_accounts (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  external_user_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (provider, external_user_id)
);
```

Kjo tabele ben lidhjen:

- `external_user_id` nga WordPress
- `user_id` nga Supabase

Rrjedha e hyrjes:

1. user logon ne WordPress
2. vjen ne market callback
3. callback kontrollon nese ekziston `external_accounts`
4. nese po, gjen user-in ekzistues
5. nese jo, krijon user te ri ne Supabase
6. krijon row ne `external_accounts`
7. hap sesionin ne market

## 17. Cfare duhet ne backend per SSO

Per SSO nuk mjafton vetem frontend.

Duhet nje endpoint backend, p.sh.:

- `https://market.gazetasi.al/api/auth/wordpress/callback`

Ky backend ben:

1. shkembimin `code -> token`
2. merr profilin e user-it nga WordPress
3. kontrollon ose krijon user ne Supabase
4. ruan mapimin ne `external_accounts`
5. kthen user-in ne aplikacion me sesion aktiv

Per kete pike do ju duhet:

- `SUPABASE_SERVICE_ROLE_KEY`

Kjo **nuk** futet ne frontend. Kjo mbahet vetem ne backend ose ne server functions.

## 18. Cfare duhet ndryshuar ne kod

Pikat me te mundshme qe duhen prekur:

- `src/pages/Auth.tsx`
  - hiq login-in klasik dhe shto `Hyr me Gazeta Si`
- `src/hooks/useAuth.tsx`
  - ndrysho menyren si menaxhohet hyrja
- `src/App.tsx`
  - shto route per callback

Me shume gjasa do shtohen edhe:

- nje komponent i ri per butonin e login-it
- nje callback page
- nje endpoint backend per SSO

## 19. Rrjedha e rekomanduar e punes

Punoni ne kete rend:

### Faza 1

1. merrni repo-n
2. lidhni Supabase-in e ri
3. aplikoni migrimet
4. verifikoni qe homepage punon
5. krijoni nje admin
6. verifikoni `/admin`

### Faza 2

1. deploy ne `market.gazetasi.al`
2. vendosni env vars ne prodhim
3. krijoni disa tregje prove
4. testoni login normal dhe admin panel

### Faza 3

1. konfiguroni plugin-in OAuth/OIDC ne WordPress
2. shtoni callback route
3. shtoni tabelen `external_accounts`
4. ndertoni backend callback
5. hiqni login-in klasik nga UI
6. testoni nese user i loguar ne `www.gazetasi.al` futet direkt ne market

## 20. Kontrolli final para prodhimit

Para launch-it kontrolloni:

1. a punon homepage
2. a hapen tregjet
3. a funksionon vendosja e bastit
4. a funksionon `/admin`
5. a funksionon `article_url`
6. a shfaqet aktiviteti live
7. a funksionon login-i
8. a funksionon SSO
9. a nuk ka kredenciale sekrete ne repo

## 21. Gjerat qe nuk duhen futur ne Git

Kurre mos komitoni:

- `.env`
- `sb_secret_*`
- `service_role`
- `SUPABASE_ACCESS_TOKEN`
- `client_secret` te WordPress
- `SMTP credentials`

Repo-ja aktuale eshte pergatitur qe:

- `.env` te mos perfshihet
- `.env.example` te jete shembull

## 22. Rekomandimi perfundimtar

Modeli me i mire per kete projekt eshte:

1. WordPress per gazetasi.al
2. `market.gazetasi.al` si prediction market me kete kod
3. Supabase per databaze dhe role
4. WordPress si burim identiteti
5. OAuth/OIDC per hyrje me te njejtin account

Nese ndiqni kete rruge:

- do keni te njejtin user ne te dy produktet
- eksperienca do duket si nje platforme e vetme
- databaza e market-it do mbetet e paster dhe e menaxhueshme

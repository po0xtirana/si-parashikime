# Si Parashikime: Handoff dhe Implementim per Gazeta Si

## 1. Si te ndahet repo-ja me IT

Repo-ja aktuale eshte publikuar ne GitHub si nje repo private ne profilin e pronarit:

- `https://github.com/po0xtirana/si-parashikime`

Menyra me e mire per ta ndare me ekipin e Gazeta Si:

1. Hape repo-n ne GitHub.
2. Shko te `Settings -> Collaborators and teams`.
3. Shto email-in ose username-in e personit te IT.
4. Jepi akses `Write` ose `Admin`, sipas nevojes.

Nese repo-ja duhet t'i kaloje organizates se Gazeta Si:

1. Krijoni nje organizate ose nje repo te re nen account-in e organizates.
2. Transferoni repo-n:
   - `Settings -> General -> Transfer`
3. Si emer destinacioni rekomandohet:
   - `gazetasi/si-parashikime`

## 2. Cfare eshte ky projekt

Ky projekt eshte nje aplikacion prediction market i ndertuar me:

- `React + Vite + TypeScript`
- `Tailwind + shadcn/ui`
- `Supabase` per databaze, auth, RLS dhe logjike SQL

Funksionalitetet kryesore aktuale:

- regjistrim / hyrje perdoruesish
- tregje me `Po / Jo`
- vendosje bastesh
- feed i aktivitetit live
- panel admin per krijimin dhe mbylljen e tregjeve
- link opsional me artikullin e Gazeta Si ne cdo treg

## 3. Cfare duhet te ndryshoje Gazeta Si

Per implementim real, Gazeta Si duhet te fuse te dhenat e veta ne vend te atyre lokale:

### 3.1 Variablat e ambientit

Skedari qe duhet kopjuar:

- `.env.example` -> `.env`

Vlerat qe duhen vendosur:

```env
VITE_SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="YOUR_PUBLISHABLE_KEY"
```

Kujdes:

- mos vendosni kurre `sb_secret_*` ne `VITE_*`
- cdo gje me `VITE_` del ne frontend dhe konsiderohet publike

### 3.2 Lidhja e projektit Supabase per CLI

Skedari:

- `supabase/config.toml`

Vlera qe duhet ndryshuar:

```toml
project_id = "your-supabase-project-ref"
```

### 3.3 Migrimet e databazes

Repo-ja permban migrimet SQL ne:

- `supabase/migrations/`

Per t'i aplikuar ne projektin e Gazeta Si:

```powershell
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

### 3.4 Rigjenerimi i tipeve TypeScript

Pas migrimeve:

```powershell
npx supabase gen types typescript --linked --schema public > src/integrations/supabase/types.ts
```

## 4. Struktura e databazes qe duhet kuptuar

Tabelat kryesore jane:

- `profiles`
  - te dhenat publike te perdoruesit
- `user_roles`
  - role si `admin`
- `markets`
  - tregjet e prediction market
- `bets`
  - bastet e perdoruesve
- `price_history`
  - historia e pikave te grafikut

Kolona te rendesishme:

- `markets.article_url`
  - link opsional drejt artikullit te Gazeta Si
- `bets.is_public`
  - percakton nese emri i perdoruesit del te aktiviteti live

## 5. Si krijohen adminat / editorat

Aktualisht aplikacioni ka kontroll me role permes tabeles `user_roles`.

Per te bere nje perdorues admin:

```sql
insert into public.user_roles (user_id, role)
values ('SUPABASE_AUTH_USER_ID', 'admin')
on conflict do nothing;
```

Rekomandim per Gazeta Si:

- te shtohet edhe roli `editor`
- `editor` te lejohet:
  - krijim tregjesh
  - modifikim tregjesh
  - mbyllje / zgjidhje tregjesh
- `admin` te mbetet per menaxhim rolesh dhe konfigurime me sensitive

## 6. Si behet deploy ne domenin e Gazeta Si

Rekomandim:

- website aktual: `www.gazetasi.al`
- prediction market: `market.gazetasi.al`

Pse ky variant eshte i mire:

- branding i qarte
- ndarje e paster teknike
- SSO me i thjeshte
- mund te kete deploy dhe scaling me vete

Opsione deploy:

1. `Vercel`
2. `Netlify`
3. `Cloudflare Pages`
4. `Nginx + VPS`

Per shumicen e rasteve:

- frontend-i deploy ne `market.gazetasi.al`
- Supabase hostohet vec

## 7. Si ta bejne WordPress dhe prediction market me te njejtin account

Objektivi i Gazeta Si eshte:

- nese nje perdorues eshte i loguar ne `www.gazetasi.al`
- kur hap `market.gazetasi.al`
- te mos kerkohet login i dyte

Kjo **nuk** duhet bere duke ndare cookie-t e WordPress direkt me aplikacionin React.

Rruga e rekomanduar eshte:

### 7.1 WordPress si Identity Provider

WordPress duhet te sillet si burimi kryesor i identitetit.

Sugjerim plugin-esh:

- OpenID Connect / OAuth server plugin per WordPress
- qellimi eshte qe WordPress te nxjerre login me `Authorization Code + PKCE`

### 7.2 Prediction market si aplikacion klient

Prediction market duhet te kete:

- buton `Hyr me Gazeta Si`
- route callback, p.sh.:
  - `/auth/callback`

Kur perdoruesi klikon:

1. dergohet te WordPress per autentikim
2. nese eshte tashme i loguar ne Gazeta Si, WordPress e kthen menjehere
3. market app krijon sesionin e vet lokal
4. perdoruesi hyn pa vene re nje login te dyte

Ky eshte SSO i sakte.

### 7.3 Cfare duhet te ndryshoje ne aplikacion

Aktualisht aplikacioni perdor Supabase Auth me email/password.

Per SSO me WordPress duhen bere keto ndryshime:

1. te hiqet ose te fshihet regjistrimi klasik me email/password
2. te shtohet `Login with Gazeta Si`
3. te shtohet nje route callback:
   - `/auth/callback`
4. te krijohet nje mekanizem per mapim:
   - `wordpress_user_id` -> `supabase_user_id`
5. ne hyrjen e pare te krijohet automatikisht `profile`
6. logout te behet i sinkronizuar ose te menaxhohet qarte

### 7.4 Dy menyra implementimi

#### Variante e rekomanduar praktikisht

WordPress eshte burim identiteti, por prediction market mban profilin dhe te dhenat e veta ne Supabase.

Rrjedha:

1. WordPress ben autentikimin
2. market app merr token / code
3. nje backend callback e verifikon
4. backend gjen ose krijon perdoruesin perkates ne Supabase
5. krijohet sesion ne market

Ky variant ruan:

- kontot ekzistuese te Gazeta Si
- te dhenat e market-it ne Supabase
- eksperience pa nderprerje ne login

#### Variante me pak e rekomanduar

Te tentohet perdorimi i cookie-ve te WordPress direkt ne market app.

Kjo nuk sugjerohet sepse:

- eshte me fragile
- me veshtire per t'u siguruar
- nuk shkallezohet mire
- krijon varesi te forta mes dy sistemeve

## 8. Cfare i duhet ekipit teknik per SSO

### Ne WordPress

Duhet:

- plugin OAuth/OIDC server
- konfigurim i `redirect URI`
- konfigurim i `client id`
- konfigurim i `scopes`
- endpoint per `authorize`, `token`, dhe idealisht `userinfo`

### Ne market app

Duhet:

- faqe e re login me `Hyr me Gazeta Si`
- route `/auth/callback`
- logjike per exchange te code -> session
- ruajtje / krijim profili ne Supabase

### Ne Supabase

Duhet:

- tabele per mapimin e identiteteve te jashtme, p.sh.:

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

Kjo lejon:

- lidhjen e nje llogarie WordPress me nje user ne market
- hyrje te qendrueshme ne hyrjet e ardhshme

## 9. Rrjedha e rekomanduar e implementimit

### Faza 1: Marrja ne dore e projektit

1. klono repo-n
2. krijo `.env` nga `.env.example`
3. krijo projektin e ri Supabase
4. bej `supabase link`
5. bej `supabase db push`
6. rigjenero `types.ts`
7. starto aplikacionin me `npm install` dhe `npm run dev`

### Faza 2: Kalimi ne infrastrukturen e Gazeta Si

1. deploy frontend-in ne `market.gazetasi.al`
2. vendos env vars ne platformen e deploy-it
3. krijo te pakten nje admin
4. verifiko krijimin e tregjeve nga `/admin`

### Faza 3: SSO me WordPress

1. zgjidh plugin-in OIDC/OAuth ne WordPress
2. krijo aplikacion klient per market-in
3. shto route callback ne market
4. krijo tabele `external_accounts`
5. ndrysho UX e login-it ne market
6. testo hyrjen e qete nese perdoruesi eshte loguar ne `www.gazetasi.al`

### Faza 4: Hardening para prodhimit

1. verifiko RLS ne te gjitha tabelat
2. kufizo rolet editor/admin
3. vendos rate limiting
4. vendos SMTP te dedikuar per email
5. monitorim per error logs dhe auth failures

## 10. Komandat baze per ekipin e IT

Install:

```powershell
npm install
```

Start lokal:

```powershell
npm run dev
```

Build:

```powershell
npm run build
```

Test:

```powershell
npm test
```

Supabase link:

```powershell
npx supabase link --project-ref YOUR_PROJECT_REF
```

Supabase migrations:

```powershell
npx supabase db push
```

Types:

```powershell
npx supabase gen types typescript --linked --schema public > src/integrations/supabase/types.ts
```

## 11. Gjerat qe nuk duhen komituar

Mos duhen futur ne Git:

- `.env`
- `sb_secret_*`
- `service_role`
- `SUPABASE_ACCESS_TOKEN`
- WordPress client secrets
- SMTP credentials

Repo-ja aktuale eshte pergatitur qe:

- `.env` te jete i perjashtuar
- `.env.example` te jete i ndare me ekipin

## 12. Rekomandim final

Per Gazeta Si, kombinimi me i shendetshem eshte:

1. `market.gazetasi.al` si frontend i prediction market
2. `Supabase` si datastore dhe autorizim i roleve te market-it
3. `WordPress` si identity source per perdoruesit e gazetasi.al
4. `OAuth/OIDC + callback` si mekanizem SSO

Rezultati:

- i njejti account ne te dy sistemet
- eksperience e qete per perdoruesin
- ndarje e paster mes CMS dhe market-it
- menaxhim me i mire teknik afatgjate

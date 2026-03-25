# Si Parashikime

Prediction market platform for Gazeta Si, built with `React`, `Vite`, `Tailwind CSS`, and `Supabase`.

This repository is prepared as a handoff-safe codebase:
- no private credentials are included
- local environment files are ignored by Git
- Gazeta Si IT can insert their own Supabase and infrastructure settings

## Features

- Homepage with trading-dashboard style market grid
- Admin panel for creating and resolving markets
- Optional related article link per market
- Live activity feed
- Public or anonymous bet visibility
- Supabase-backed auth, profiles, roles, bets, and market resolution

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create local environment values based on `.env.example`.

Required values:

```env
VITE_SUPABASE_PROJECT_ID="your-supabase-project-ref"
VITE_SUPABASE_PUBLISHABLE_KEY="your-supabase-publishable-key"
VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
```

3. Link Supabase CLI to the correct project:

```bash
supabase link --project-ref your-supabase-project-ref
supabase db push
supabase gen types typescript --linked --schema public > src/integrations/supabase/types.ts
```

4. Start the app:

```bash
npm run dev
```

Default local URL:

```txt
http://127.0.0.1:8080
```

## Admin Access

The admin interface is available at:

```txt
/admin
```

Users must have the `admin` role in `public.user_roles`.

## Supabase Notes

The database schema is managed through the SQL files in:

```txt
supabase/migrations/
```

Important schema areas:
- `markets`
- `bets`
- `profiles`
- `user_roles`
- `price_history`

The project currently expects Supabase auth and row-level security.

## WordPress / GazetaSi Integration Direction

This codebase is compatible with a future shared-login flow between:
- `www.gazetasi.al`
- the prediction market

Recommended approach for Gazeta Si IT:
- keep WordPress as identity source, or
- move both WordPress and the market to a shared OAuth / OIDC identity provider

## Files Important For IT

- `src/pages/Index.tsx` - homepage / dashboard
- `src/pages/MarketDetail.tsx` - market detail page
- `src/pages/Admin.tsx` - editor/admin market creation page
- `src/components/MarketCard.tsx` - market card UI
- `src/components/QuickBetDialog.tsx` - quick bet UX
- `src/components/BettingPanel.tsx` - full bet panel
- `src/components/ActivityFeed.tsx` - live activity sidebar
- `src/hooks/useAuth.tsx` - auth handling
- `src/hooks/useMarkets.ts` - market and bet queries
- `src/integrations/supabase/client.ts` - Supabase client setup
- `src/integrations/supabase/types.ts` - generated database types

## Security

This repository intentionally does not include:
- Supabase access tokens
- secret keys
- service role keys
- private SMTP credentials
- private WordPress / OAuth secrets

Before deploying, Gazeta Si IT should insert their own:
- Supabase project settings
- auth provider configuration
- production domain configuration
- any future SSO / WordPress integration secrets

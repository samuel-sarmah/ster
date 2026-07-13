# Sterz

**Performance-based creator marketing with verified payouts.**

Sterz is a two-sided marketplace for influencer campaigns. Brands deposit a budget
into escrow and set a CPM (e.g. $4 per 1,000 views). Creators browse funded
campaigns, post on TikTok / Instagram / YouTube / X, and submit the URL. Sterz reads
the real view counts straight from each platform's API, runs fraud-velocity checks,
and releases earnings through Stripe Connect the moment views are verified.

The whole idea: **money moves on proof, not on trust** — no upfront handshakes, no
screenshot chasing, no invoices.

## Tech stack

- **Framework:** Next.js 16 (App Router, Turbopack) · React 19
- **Styling:** Tailwind CSS 4 · shadcn (Base UI variant) · Inter + Geist Mono
- **Data & auth:** Supabase (Postgres, Auth, Row-Level Security)
- **Payments:** Stripe Connect (escrow via PaymentIntents, payouts via Transfers)
- **Background jobs:** BullMQ + Redis (view tracking, weekly payouts)
- **Social APIs:** TikTok, Instagram, YouTube, X adapters (`lib/social/`)

## Project layout

```
app/
  (auth)/         Login / signup (Google, X, Discord OAuth)
  brand/          Campaign wizard, escrow deposit, spend tracking
  creator/        Campaign discovery, submissions, earnings, payout setup
  admin/          Dashboard stats, user moderation, submission review
  campaigns/      Public campaign detail pages
  api/            Route handlers (zod-validated)
  page.tsx        Marketing landing page
components/
  landing/        Landing-page sections (hero, manifesto, steps, bento, …)
  ui/             shadcn primitives
lib/              Supabase/Stripe clients, auth guards, social adapters, crypto
workers/          view-tracker.ts, payout-processor.ts
supabase/migrations/   Schema + RLS policies (001–005)
scripts/          seed-campaigns.ts
proxy.ts          Next.js 16 middleware (auth/session routing)
```

> Next.js 16 renamed the middleware convention to `proxy.ts` — that file is the
> active request interceptor, not dead code.

## Getting started

### 1. Install

```bash
npm install
```

### 2. Configure environment

Copy the example and fill in your keys:

```bash
cp .env.local.example .env.local
```

Required to run locally:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` | Supabase project + keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Stripe Connect |
| `REDIS_URL` | BullMQ queue for workers |
| `TOKEN_ENCRYPTION_KEY` | 32-byte hex key for social-token encryption at rest — generate with `openssl rand -hex 32` |
| `NEXT_PUBLIC_APP_URL` | Base URL for OAuth callbacks |

Optional: `PIXABAY_API_KEY` (landing-page campaign imagery) and the social API
credentials (`TIKTOK_*`, `INSTAGRAM_*`, `YOUTUBE_*`, `X_*`) needed before the view
trackers can go live.

### 3. Apply the database schema

Run the migrations in `supabase/migrations/` against your Supabase project (via the
Supabase CLI or the SQL editor).

### 4. Seed demo campaigns (optional)

```bash
npm run seed          # insert demo campaigns
npm run seed:reset    # wipe and reseed
```

### 5. Run

```bash
npm run dev           # app on http://localhost:3000
```

Run the background workers in separate terminals:

```bash
npm run worker:view-tracker   # polls platform APIs, verifies views (every 6h)
npm run worker:payout         # weekly Stripe Connect transfers
```

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Next.js dev server |
| `npm run build` / `npm run start` | Production build / serve |
| `npm run worker:view-tracker` | View-verification worker |
| `npm run worker:payout` | Payout-processing worker |
| `npm run seed` / `npm run seed:reset` | Seed / reset demo campaign data |

## Deployment

- **App:** Vercel (env vars configured in the Vercel dashboard)
- **Workers:** Railway (or any long-running Node host)
- **Database:** Supabase
- **Redis:** Upstash / Railway

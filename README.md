# Monarch — Location-Based Social Discovery

Gamified real-world exploration. Claim Points of Interest as your **Kingdom** by submitting a live photo and review.

## Live app (permanent)

**https://agrima2024.github.io/monarch-app/**

This URL is hosted on GitHub Pages and stays online 24/7 — no tunnel or local machine required.

## Features

- **Login** — Sign up / Sign in with username and password (or Supabase email when configured)
- **Friends** — Send requests by username; both people must accept before sharing a Friends Circle
- **Reputation & dethroning** — Endorse or rebel on claims; negative reputation starts a 30-day grace period before the land is unclaimed
- **Dual-tab map** — Community (all explorers on this device) and Friends (you + accepted friends only)
- **Venue-sized kingdom zones** — colored footprints per monarch
- **Claim Crown flow** — Live photo + review with Royal Guard validation
- **Monarch profiles** — tap a person icon to see conquered land
- **Mobile-first PWA** — Responsive layout with manifest

## Cross-device sign in (phone + laptop)

Accounts use **email + password**. To sign in on multiple devices with the same account:

1. Create a free project at [supabase.com](https://supabase.com)
2. Run both SQL migrations in `supabase/migrations/`
3. In GitHub → Settings → Secrets → Actions, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Push to `main` (or re-run the deploy workflow)

Without Supabase, accounts are stored **only in the browser** on each device.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy updates

Push to `main` — GitHub Actions automatically rebuilds and deploys to Pages.

Repository: https://github.com/agrima2024/monarch-app

### Alternative hosts

- [Deploy to Vercel](https://vercel.com/new/clone?repository-url=https://github.com/agrima2024/monarch-app) (supports server-side Gemini API)
- [Deploy to Render](https://render.com) using `render.yaml`

## Tech Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS 4
- Leaflet + OpenStreetMap
- GitHub Pages (production hosting)

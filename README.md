# Monarch — Location-Based Social Discovery

Gamified real-world exploration. Claim Points of Interest as your **Kingdom** by submitting an AI-verified live photo and review.

## Live demo

**Public URL:** https://missile-ent-longitude-andrews.trycloudflare.com

Anyone with the link can open the app in a browser (phone or desktop). Allow location access for the best experience.

> This demo runs from a Cloudflare tunnel. For a permanent 24/7 URL, deploy to Vercel or Render (see below).

## Features

- **Dual-tab map** — Community (global monarchs) and Friends (inner-circle monarchs)
- **Venue-sized kingdom zones** — colored footprints per monarch
- **Claim Crown flow** — Live photo + review with Gemini AI validation
- **Monarch profiles** — tap a person icon to see conquered land
- **Mobile-first PWA** — Responsive layout with manifest

## Quick Start (local)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Share on your network (temporary public link)

```bash
npm run start:public
```

This builds the app, starts production mode, and prints a public `trycloudflare.com` URL you can share.

## Deploy permanently (recommended)

Code is on GitHub: https://github.com/agrima2024/monarch-app

### Option A — Vercel (easiest for Next.js)

1. Go to [vercel.com/new/clone?repository-url=https://github.com/agrima2024/monarch-app](https://vercel.com/new/clone?repository-url=https://github.com/agrima2024/monarch-app)
2. Click **Deploy** (free tier)
3. Share your `*.vercel.app` URL

Optional env vars: `GEMINI_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Option B — Render

1. Go to [render.com](https://render.com) → **New** → **Blueprint**
2. Connect the `agrima2024/monarch-app` repo (uses `render.yaml`)
3. Deploy and share your `*.onrender.com` URL

## Environment variables

Copy `.env.example` to `.env.local` for local development:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `GEMINI_API_KEY` | [Google Gemini API key](https://aistudio.google.com/apikey) |

Without API keys, the app runs in demo mode with dummy data and fallback validation.

## Tech Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS 4
- Leaflet + OpenStreetMap
- Supabase (PostgreSQL, Auth, Storage) — schema included
- Google Gemini API (structured outputs)

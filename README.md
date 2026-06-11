# Monarch — Location-Based Social Discovery

Gamified real-world exploration. Claim Points of Interest as your **Kingdom** by submitting a live photo and review.

## Live app (permanent)

**https://agrima2024.github.io/monarch-app/**

This URL is hosted on GitHub Pages and stays online 24/7 — no tunnel or local machine required.

## Features

- **Login** — email/password via Supabase, or demo username login on GitHub Pages
- **Dual-tab map** — Community (global monarchs) and Friends (inner-circle monarchs)
- **Venue-sized kingdom zones** — colored footprints per monarch
- **Claim Crown flow** — Live photo + review with Royal Guard validation
- **Monarch profiles** — tap a person icon to see conquered land
- **Mobile-first PWA** — Responsive layout with manifest

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

# Monarch — Location-Based Social Discovery

Gamified real-world exploration. Claim Points of Interest as your **Kingdom** by submitting an AI-verified live photo and review.

## Features (Phase 1)

- **Dual-tab map** — Community (global monarchs) and Friends (inner-circle monarchs)
- **Claim Crown flow** — Live photo + review with Gemini AI validation
- **Supabase schema** — Profiles, locations, claims, friendships
- **Mobile-first PWA** — Responsive layout with manifest

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env.local` and fill in your keys:

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_MAPBOX_TOKEN` | [Mapbox access token](https://account.mapbox.com/) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `GEMINI_API_KEY` | [Google Gemini API key](https://aistudio.google.com/apikey) |

> Without API keys, the app runs in demo mode with dummy data and fallback validation.

### 3. Set up Supabase (optional for demo)

Run the migration in your Supabase SQL editor:

```
supabase/migrations/001_initial_schema.sql
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── api/validate-claim/   # Gemini AI gatekeeper
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── MapView.tsx           # Mapbox map + markers
│   ├── TabToggle.tsx         # Community / Friends switch
│   ├── ClaimCrownModal.tsx   # Photo + review submission
│   ├── LocationPanel.tsx     # POI detail bottom sheet
│   └── Header.tsx
└── lib/
    ├── types.ts
    ├── dummy-data.ts         # Demo POIs & claims
    ├── geo.ts                # Distance calculations
    └── supabase/             # Client helpers
```

## How It Works

### Community vs Friends

- **Community tab:** One global Monarch per POI (first claim wins worldwide)
- **Friends tab:** Among you and people you follow, whoever claimed first is crowned

### Claim Flow

1. Select an unclaimed POI within 150m of your location
2. Capture a live photo and write a review
3. Gemini validates image quality and review substance
4. On approval, the claim is saved; on rejection, the Royal Guard explains why

## Tech Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS 4
- Mapbox GL JS
- Supabase (PostgreSQL, Auth, Storage)
- Google Gemini API (structured outputs)

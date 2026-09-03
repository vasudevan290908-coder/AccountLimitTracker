# AI Limits Tracker

Real-time dashboard to track Gemini and Claude rate limit status across multiple accounts — syncs instantly across all your devices via Supabase Realtime.

![Dashboard](https://img.shields.io/badge/stack-React%20%2B%20Supabase%20%2B%20Tailwind-0ea5e9?style=flat-square)
![Deploy](https://img.shields.io/badge/deploy-GitHub%20Pages-222?style=flat-square&logo=github)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

## Features

- ✅ Track multiple Gmail / email accounts in one place
- 🟢 Live **Available / Limited** status per service (Gemini + Claude)
- ⏱️ Real-time countdown timers — auto-reset to Available when time expires
- ⚡ Cross-device sync via Supabase Realtime (≤ 1–2 s latency)
- 📋 Smart paste parser — paste any date/time text and it auto-fills the reset time
- 📱 Mobile-responsive glassmorphism dark UI with animated starfield background
- 💾 Offline-first — works without Supabase using localStorage fallback

## Tech Stack

| Layer | Tool |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS v3 |
| Backend / DB | Supabase (Postgres + Realtime) |
| Deployment | GitHub Pages (via GitHub Actions) |
| CI/CD | GitHub Actions — auto-deploy on push to `main` |

## Setup

### 1. Supabase (optional — for real-time cross-device sync)

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor → New query**, paste and run `supabase/schema.sql`
3. Go to **Database → Replication** → enable realtime for `limit_trackers` table
4. Copy your **Project URL** and **anon key** from **Project Settings → API**

### 2. Local Development

```bash
# Clone the repo
git clone https://github.com/vasudevan290908-coder/AccountLimitTracker.git
cd AccountLimitTracker

# Install dependencies
npm install

# Set up environment (optional — only needed for Supabase sync)
cp .env.example .env
# Edit .env and paste your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# Start dev server
npm run dev
# → http://localhost:5173
```

> **Note:** The app works fully offline using `localStorage` — Supabase is only needed for cross-device real-time sync.

### 3. Deploy to GitHub Pages

**Automatic (recommended):**
1. Push to `main` — GitHub Actions will build and deploy automatically

**Manual:**
1. Run `npm run build`
2. Deploy the `dist/` folder to your hosting of choice

> The GitHub Actions workflow (`.github/workflows/deploy-gh-pages.yml`) runs TypeScript check + Vite build + deploys to GitHub Pages on every push to `main`.

## Usage

| Action | How |
|---|---|
| Add account | Click **+ Add Email** in the top-right of the header |
| Edit / update limits | Click any row (email or status cells) to open the edit modal |
| Mark as Limited | In edit modal → toggle to **Limited** → paste or pick the reset date/time |
| Smart paste | Paste any format: `"8:08 PM"`, `"03-09-2026 08:08 PM"`, `"3h"`, `"in 2 hours"` |
| Mark as Available | In edit modal → toggle to **Available** |
| Delete account | In edit modal → click **Delete Row** |
| Auto-reset | When countdown reaches 0, status flips to Available automatically |
| Refresh | Click the **↺** icon in the top-right to force-reload from Supabase |

## Project Structure

```
src/
├── components/
│   ├── SpreadsheetTable.tsx    # Main table UI + real-time auto-reset logic
│   ├── AddRowModal.tsx         # Modal to add a new email account
│   ├── EditRowModal.tsx        # Modal to edit status, paste timestamps
│   └── StarfieldBackground.tsx # Animated canvas starfield
├── hooks/
│   ├── useTrackers.ts          # Core state + Supabase sync + localStorage fallback
│   └── useAuth.ts              # Supabase auth helpers (signIn / signUp / signOut)
├── lib/
│   └── supabase.ts             # Supabase client (env vars + localStorage config)
├── types/
│   └── tracker.ts              # LimitTracker, NewTracker, UpdateTracker types
├── utils/
│   └── dateUtils.ts            # formatLimitDateTime, parsePastedDate, calculateRemainingTime
├── data/
│   └── defaultTrackers.ts      # Seed data shown when no Supabase / localStorage data
└── App.tsx                     # Root component
supabase/
└── schema.sql                  # Postgres schema + RLS disabled + realtime enabled
.github/
└── workflows/
    └── deploy-gh-pages.yml     # CI/CD — TypeScript check + build + GitHub Pages deploy
```

## Realtime Architecture

```
You update a row in the app
       ↓
Supabase Postgres UPDATE
       ↓
Supabase Realtime broadcasts postgres_changes event
       ↓             ↓
  Your phone    Your laptop
(subscribed)  (subscribed)
→ React state updates instantly — no manual refresh needed
```

## Smart Date Parser — Supported Formats

The paste input in the edit modal accepts virtually any date/time format:

| Input | Interpretation |
|---|---|
| `8:08 PM` | Today at 8:08 PM (tomorrow if already past) |
| `20:08` | Today at 20:08 (24-hour) |
| `03-09-2026 08:08 PM` | Sep 3 2026 at 8:08 PM |
| `3h` / `3 hours` | 3 hours from now |
| `45m` / `45 minutes` | 45 minutes from now |
| `1d` | 1 day from now |
| `Sep 3, 2026 8:08 PM` | Standard English date |
| `2026-09-03T20:08` | ISO 8601 |

## License

MIT

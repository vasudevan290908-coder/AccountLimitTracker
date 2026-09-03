# AI Limits Tracker

Real-time dashboard to track Gemini and Claude rate limit status across multiple accounts — syncs instantly across all your devices.

![Dashboard](https://img.shields.io/badge/stack-React%20%2B%20Supabase%20%2B%20Tailwind-0ea5e9?style=flat-square)
![Deploy](https://img.shields.io/badge/deploy-Vercel-black?style=flat-square)

## Features

- ✅ Track multiple accounts (Personal Gmail, Work, etc.)
- 🟢🟡🔴 Color-coded status per service (Gemini + Claude)
- ⏱️ Live countdown timer — resets automatically when time expires
- ⚡ Real-time cross-device sync via Supabase Realtime (≤1-2s)
- 🔒 Single-user auth (email/password)
- 📱 Mobile-responsive dark theme

## Tech Stack

| | Tool |
|---|---|
| Frontend | React + Vite + TypeScript |
| Styling | Tailwind CSS |
| Backend/DB | Supabase (Postgres + Realtime + Auth) |
| Deployment | Vercel (frontend) |
| CI/CD | GitHub Actions |

## Setup

### 1. Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor → New query**, paste and run `supabase/schema.sql`
3. Go to **Authentication → Providers** → enable **Email** provider
4. Go to **Database → Replication** → enable realtime for `limit_trackers` table
5. Copy your **Project URL** and **anon key** from **Project Settings → API**

### 2. Local development

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/ai-limits-tracker.git
cd ai-limits-tracker

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env and paste your Supabase URL + anon key

# Start dev server
npm run dev
# → http://localhost:5173
```

### 3. Create your account

1. Open the app, click Sign In
2. In Supabase Dashboard → **Authentication → Users** → **Invite user** with your email
3. Follow the email link to set your password
4. *(Optional)* Disable new signups: **Authentication → Settings** → turn off "Enable signups"

### 4. Deploy to Vercel

**Option A — Vercel Dashboard (easiest)**
1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → Import your repo
3. Add environment variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
4. Deploy!

**Option B — GitHub Actions (auto-deploy on push)**
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project root to link it
3. Add `VERCEL_TOKEN` secret to GitHub repo → Settings → Secrets
4. Push to `main` — Actions will deploy automatically

## Usage

| Action | How |
|---|---|
| Add account | Click **+ Add Account** in header |
| Mark as limited | Hover a row → **⋮** → **Edit / Update** → toggle to "Limited" + set reset time |
| Mark as available | Same as above → toggle to "Available" |
| Delete account | Hover → **⋮** → **Delete** |
| Auto-reset | When countdown hits 0, status flips to Available automatically |

## Project Structure

```
src/
├── components/      # UI components
├── hooks/           # useAuth, useTrackers (realtime)
├── lib/             # Supabase client
├── types/           # TypeScript types
└── App.tsx          # Root: auth gate → dashboard or login
supabase/
└── schema.sql       # Database schema + RLS + realtime
```

## Realtime Architecture

```
You update a row on your phone
       ↓
Supabase Postgres UPDATE
       ↓
Supabase Realtime broadcasts postgres_changes
       ↓        ↓
  Your laptop  Your tablet
(subscribed)  (subscribed)
→ React state updates instantly, no refresh needed
```

## License

MIT

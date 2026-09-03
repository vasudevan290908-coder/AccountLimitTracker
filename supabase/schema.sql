-- =============================================================
-- AI Limits Tracker — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- =============================================================

-- ── Table ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.limit_trackers (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label            TEXT        NOT NULL,                         -- e.g. "Personal Gmail"
  gemini_status    TEXT        NOT NULL DEFAULT 'available'
                               CHECK (gemini_status IN ('available', 'limited')),
  gemini_reset_at  TIMESTAMPTZ NULL,                             -- null = no reset scheduled
  claude_status    TEXT        NOT NULL DEFAULT 'available'
                               CHECK (claude_status IN ('available', 'limited')),
  claude_reset_at  TIMESTAMPTZ NULL,
  notes            TEXT,
  sort_order       INTEGER     NOT NULL DEFAULT 0,               -- drag-to-reorder (future)
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Index ─────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS limit_trackers_user_id_idx
  ON public.limit_trackers (user_id, sort_order);

-- ── Auto-update updated_at ─────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_limit_trackers_updated_at ON public.limit_trackers;
CREATE TRIGGER trg_limit_trackers_updated_at
  BEFORE UPDATE ON public.limit_trackers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Row Level Security ─────────────────────────────────────────
ALTER TABLE public.limit_trackers ENABLE ROW LEVEL SECURITY;

-- Users can only see and modify their own rows
CREATE POLICY "owner_all" ON public.limit_trackers
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Enable Realtime ───────────────────────────────────────────
-- (Also enable via Supabase Dashboard → Database → Replication → limit_trackers toggle)
ALTER PUBLICATION supabase_realtime ADD TABLE public.limit_trackers;

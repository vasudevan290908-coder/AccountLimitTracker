-- =============================================================
-- AI Limits Tracker — Public Real-time Schema (No Login Required)
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- =============================================================

CREATE TABLE IF NOT EXISTS public.limit_trackers (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  label            TEXT        NOT NULL,
  gemini_status    TEXT        NOT NULL DEFAULT 'available'
                               CHECK (gemini_status IN ('available', 'limited')),
  gemini_reset_at  TIMESTAMPTZ NULL,
  claude_status    TEXT        NOT NULL DEFAULT 'available'
                               CHECK (claude_status IN ('available', 'limited')),
  claude_reset_at  TIMESTAMPTZ NULL,
  notes            TEXT,
  sort_order       INTEGER     NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Disable RLS so any visitor can view and update in real-time without login
ALTER TABLE public.limit_trackers DISABLE ROW LEVEL SECURITY;

-- Auto-update updated_at on row modification
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

-- Enable Realtime broadcast
ALTER PUBLICATION supabase_realtime ADD TABLE public.limit_trackers;

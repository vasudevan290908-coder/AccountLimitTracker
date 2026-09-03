import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { LimitTracker, NewTracker, UpdateTracker } from '../types/tracker'
import { DEFAULT_TRACKERS } from '../data/defaultTrackers'

const STORAGE_KEY = 'ai_limit_trackers_v1'

function getInitialTrackers(): LimitTracker[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (err) {
    console.error('Error reading localStorage trackers', err)
  }
  return DEFAULT_TRACKERS
}

export function useTrackers() {
  const [trackers, setTrackers] = useState<LimitTracker[]>(getInitialTrackers)
  const [isLiveSync, setIsLiveSync] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const channelRef = useRef<any>(null)

  // Save to localStorage whenever trackers change
  const persistLocal = useCallback((items: LimitTracker[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch (e) {
      console.error('Failed to save to localStorage', e)
    }
  }, [])

  // ── Sync with Supabase if configured ──────────────────────────
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLiveSync(false)
      return
    }

    let isMounted = true

    async function loadFromSupabase() {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
          .from('limit_trackers')
          .select('*')
          .order('sort_order', { ascending: true })

        if (error) throw error

        if (isMounted) {
          if (data && data.length > 0) {
            setTrackers(data as LimitTracker[])
            persistLocal(data as LimitTracker[])
          } else {
            // Seed initial data to Supabase so other devices see the default rows immediately
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any).from('limit_trackers').insert(DEFAULT_TRACKERS)
          }
          setIsLiveSync(true)
          setSyncError(null)
        }
      } catch (err: unknown) {
        console.warn('Supabase sync notice:', err)
        if (isMounted) {
          setSyncError(err instanceof Error ? err.message : 'Database sync pending')
          setIsLiveSync(false)
        }
      }
    }

    loadFromSupabase()

    // Realtime channel
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const channel: any = supabase.channel('public_limit_trackers')

      channel
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'limit_trackers' },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (payload: any) => {
            if (payload.eventType === 'INSERT') {
              setTrackers((prev) => {
                if (prev.some((t) => t.id === payload.new.id)) return prev
                const next = [...prev, payload.new as LimitTracker].sort(
                  (a, b) => a.sort_order - b.sort_order
                )
                persistLocal(next)
                return next
              })
            } else if (payload.eventType === 'UPDATE') {
              setTrackers((prev) => {
                const next = prev.map((t) => (t.id === payload.new.id ? (payload.new as LimitTracker) : t))
                persistLocal(next)
                return next
              })
            } else if (payload.eventType === 'DELETE') {
              setTrackers((prev) => {
                const next = prev.filter((t) => t.id !== payload.old.id)
                persistLocal(next)
                return next
              })
            }
          }
        )
        .subscribe((status: string) => {
          if (status === 'SUBSCRIBED') {
            setIsLiveSync(true)
          }
        })

      channelRef.current = channel
    } catch (e) {
      console.warn('Realtime subscription setup error', e)
    }

    return () => {
      isMounted = false
      if (channelRef.current) {
        channelRef.current.unsubscribe()
      }
    }
  }, [persistLocal])

  // ── Mutations ─────────────────────────────────────────────────
  const addTracker = useCallback(
    async (data: NewTracker) => {
      const newRow: LimitTracker = {
        id: 'row-' + Date.now(),
        label: data.label,
        gemini_status: data.gemini_status || 'available',
        gemini_reset_at: data.gemini_reset_at || null,
        claude_status: data.claude_status || 'available',
        claude_reset_at: data.claude_reset_at || null,
        sort_order: data.sort_order ?? trackers.length + 1,
      }

      setTrackers((prev) => {
        const next = [...prev, newRow]
        persistLocal(next)
        return next
      })

      if (isSupabaseConfigured) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any).from('limit_trackers').insert(newRow)
        } catch (e) {
          console.error('Error inserting tracker to cloud', e)
        }
      }
    },
    [trackers.length, persistLocal]
  )

  const updateTracker = useCallback(
    async (id: string, data: UpdateTracker) => {
      setTrackers((prev) => {
        const next = prev.map((t) => (t.id === id ? { ...t, ...data } : t))
        persistLocal(next)
        return next
      })

      if (isSupabaseConfigured) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any).from('limit_trackers').update(data).eq('id', id)
        } catch (e) {
          console.error('Error updating tracker on cloud', e)
        }
      }
    },
    [persistLocal]
  )

  const deleteTracker = useCallback(
    async (id: string) => {
      setTrackers((prev) => {
        const next = prev.filter((t) => t.id !== id)
        persistLocal(next)
        return next
      })

      if (isSupabaseConfigured) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any).from('limit_trackers').delete().eq('id', id)
        } catch (e) {
          console.error('Error deleting tracker from cloud', e)
        }
      }
    },
    [persistLocal]
  )

  const resetToDefault = useCallback(() => {
    setTrackers(DEFAULT_TRACKERS)
    persistLocal(DEFAULT_TRACKERS)
  }, [persistLocal])

  return {
    trackers,
    isLiveSync,
    syncError,
    addTracker,
    updateTracker,
    deleteTracker,
    resetToDefault,
  }
}

import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { LimitTracker, NewTracker, UpdateTracker } from '../types/tracker'

interface UseTrackersReturn {
  trackers: LimitTracker[]
  loading: boolean
  error: string | null
  addTracker: (data: NewTracker) => Promise<void>
  updateTracker: (id: string, data: UpdateTracker) => Promise<void>
  deleteTracker: (id: string) => Promise<void>
}

export function useTrackers(userId: string | undefined): UseTrackersReturn {
  const [trackers, setTrackers] = useState<LimitTracker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  // ── Initial fetch ─────────────────────────────────────────────
  const fetchTrackers = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error: fetchError } = await (supabase as any)
      .from('limit_trackers')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (fetchError) {
      setError((fetchError as { message: string }).message)
    } else {
      setTrackers((data as LimitTracker[]) ?? [])
      setError(null)
    }
    setLoading(false)
  }, [userId])

  // ── Realtime subscription ─────────────────────────────────────
  useEffect(() => {
    if (!userId) return

    fetchTrackers()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const channel: any = supabase.channel(`limit_trackers:${userId}`)

    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'limit_trackers',
          filter: `user_id=eq.${userId}`,
        },
        (payload: any) => {
          const eventType = payload.eventType as string
          if (eventType === 'INSERT') {
            const newRow = payload.new as LimitTracker
            setTrackers((prev) => {
              if (prev.some((t) => t.id === newRow.id)) return prev
              return [...prev, newRow].sort(
                (a, b) => a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at)
              )
            })
          } else if (eventType === 'UPDATE') {
            const updatedRow = payload.new as LimitTracker
            setTrackers((prev) =>
              prev.map((t) => (t.id === updatedRow.id ? updatedRow : t))
            )
          } else if (eventType === 'DELETE') {
            const oldRow = payload.old as { id: string }
            setTrackers((prev) => prev.filter((t) => t.id !== oldRow.id))
          }
        }
      )
      .subscribe((status: string) => {
        if (status === 'CHANNEL_ERROR') {
          setError('Realtime connection error — updates may be delayed')
        }
      })

    channelRef.current = channel

    return () => {
      channel.unsubscribe()
    }
  }, [userId, fetchTrackers])

  // ── Mutations ─────────────────────────────────────────────────
  const addTracker = useCallback(
    async (data: NewTracker) => {
      if (!userId) return
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: insertError } = await (supabase as any)
        .from('limit_trackers')
        .insert({
          ...data,
          user_id: userId,
          gemini_status: 'available',
          claude_status: 'available',
        })
      if (insertError) throw new Error((insertError as { message: string }).message)
    },
    [userId]
  )

  const updateTracker = useCallback(async (id: string, data: UpdateTracker) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
      .from('limit_trackers')
      .update(data)
      .eq('id', id)
    if (updateError) throw new Error((updateError as { message: string }).message)
  }, [])

  const deleteTracker = useCallback(async (id: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: deleteError } = await (supabase as any)
      .from('limit_trackers')
      .delete()
      .eq('id', id)
    if (deleteError) throw new Error((deleteError as { message: string }).message)
  }, [])

  return { trackers, loading, error, addTracker, updateTracker, deleteTracker }
}

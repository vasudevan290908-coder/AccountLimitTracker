// ── Domain types ──────────────────────────────────────────────

export type ServiceStatus = 'available' | 'limited'

export interface LimitTracker {
  id: string
  user_id: string
  label: string
  gemini_status: ServiceStatus
  gemini_reset_at: string | null  // ISO 8601 timestamp or null
  claude_status: ServiceStatus
  claude_reset_at: string | null
  notes: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export type NewTracker = Pick<LimitTracker, 'label' | 'notes' | 'sort_order'>

export type UpdateTracker = Partial<
  Pick<
    LimitTracker,
    | 'label'
    | 'gemini_status'
    | 'gemini_reset_at'
    | 'claude_status'
    | 'claude_reset_at'
    | 'notes'
    | 'sort_order'
  >
>

export type Service = 'gemini' | 'claude'

// ── Countdown state returned by useCountdown ──────────────────

export interface CountdownState {
  label: string         // "Available", "3h 22m 05s", etc.
  urgency: 'none' | 'warning' | 'critical'  // drives color
  expired: boolean
}

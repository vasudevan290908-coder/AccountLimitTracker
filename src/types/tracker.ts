// ── Domain types ──────────────────────────────────────────────

export type ServiceStatus = 'available' | 'limited'

export interface LimitTracker {
  id: string
  label: string
  gemini_status: ServiceStatus
  gemini_reset_at: string | null  // ISO 8601 timestamp or null
  claude_status: ServiceStatus
  claude_reset_at: string | null
  notes?: string | null
  sort_order: number
  created_at?: string
  updated_at?: string
}

export type NewTracker = {
  label: string
  gemini_status?: ServiceStatus
  gemini_reset_at?: string | null
  claude_status?: ServiceStatus
  claude_reset_at?: string | null
  notes?: string | null
  sort_order?: number
}

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

export interface CountdownState {
  label: string
  urgency: 'none' | 'warning' | 'critical'
  expired: boolean
}

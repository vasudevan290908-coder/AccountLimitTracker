// Minimal hand-written Supabase DB type that replaces the generated one.
// If you later run `supabase gen types typescript`, you can replace this file.

export type Database = {
  public: {
    Tables: {
      limit_trackers: {
        Row: {
          id: string
          user_id: string
          label: string
          gemini_status: 'available' | 'limited'
          gemini_reset_at: string | null
          claude_status: 'available' | 'limited'
          claude_reset_at: string | null
          notes: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          label: string
          gemini_status?: 'available' | 'limited'
          gemini_reset_at?: string | null
          claude_status?: 'available' | 'limited'
          claude_reset_at?: string | null
          notes?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['limit_trackers']['Insert']>
      }
    }
  }
}

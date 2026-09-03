import { createClient } from '@supabase/supabase-js'

// Try reading from Vite environment variables, then fallback to localStorage
const envUrl = (import.meta.env.VITE_SUPABASE_URL as string) || ''
const envAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || ''

export function getStoredSupabaseConfig() {
  const localUrl = localStorage.getItem('supabase_url') || ''
  const localAnonKey = localStorage.getItem('supabase_anon_key') || ''
  const url = envUrl || localUrl
  const anonKey = envAnonKey || localAnonKey
  return { url, anonKey, isConfigured: Boolean(url && anonKey) }
}

export function saveSupabaseConfig(url: string, anonKey: string) {
  localStorage.setItem('supabase_url', url.trim())
  localStorage.setItem('supabase_anon_key', anonKey.trim())
  window.location.reload()
}

export function clearSupabaseConfig() {
  localStorage.removeItem('supabase_url')
  localStorage.removeItem('supabase_anon_key')
  window.location.reload()
}

const config = getStoredSupabaseConfig()

// Initialize client with fallback placeholder to prevent crash before user inputs keys
const activeUrl = config.isConfigured ? config.url : 'https://placeholder.supabase.co'
const activeAnonKey = config.isConfigured ? config.anonKey : 'placeholder'

export const isSupabaseConfigured = config.isConfigured

export const supabase = createClient(activeUrl, activeAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

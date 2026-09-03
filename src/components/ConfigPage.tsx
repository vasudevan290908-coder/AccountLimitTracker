import { useState } from 'react'
import { Database, KeyRound, ExternalLink, ArrowRight } from 'lucide-react'
import { saveSupabaseConfig } from '../lib/supabase'

export default function ConfigPage() {
  const [url, setUrl] = useState('')
  const [anonKey, setAnonKey] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim() || !anonKey.trim()) {
      setError('Please provide both Project URL and Anon Key')
      return
    }

    if (!url.startsWith('https://')) {
      setError('Project URL must start with https://')
      return
    }

    saveSupabaseConfig(url, anonKey)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-950">
      <div className="relative w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-600/20 border border-sky-600/30 mb-3">
            <Database className="w-7 h-7 text-sky-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Connect Supabase</h1>
          <p className="mt-1 text-sm text-gray-400">
            Enter your Supabase project credentials to enable real-time sync
          </p>
        </div>

        <form onSubmit={handleSave} className="card p-6 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-900/30 border border-red-700/50 px-3 py-2.5 text-xs text-red-300">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5" htmlFor="supabase-url">
              Supabase Project URL
            </label>
            <input
              id="supabase-url"
              type="url"
              className="input"
              placeholder="https://your-project.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5" htmlFor="supabase-anon-key">
              Supabase Anon / Public Key
            </label>
            <div className="relative">
              <input
                id="supabase-anon-key"
                type="password"
                className="input"
                placeholder="eyJh..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                required
              />
              <KeyRound className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full mt-2">
            Save & Connect
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 rounded-xl border border-gray-800 bg-gray-900/50 p-4 text-xs text-gray-400 space-y-2">
          <p className="font-semibold text-gray-300 flex items-center gap-1.5">
            How to get these keys:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-gray-400">
            <li>Log in to <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-sky-400 hover:underline inline-flex items-center gap-0.5">supabase.com <ExternalLink className="w-3 h-3" /></a></li>
            <li>Select your project → go to <strong>Project Settings → API</strong></li>
            <li>Copy the <strong>Project URL</strong> and <strong>anon public key</strong></li>
          </ol>
        </div>
      </div>
    </div>
  )
}

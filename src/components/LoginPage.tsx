import { useState } from 'react'
import { Zap, Eye, EyeOff, AlertCircle, Settings2 } from 'lucide-react'
import { signIn, signUp } from '../hooks/useAuth'
import { clearSupabaseConfig } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)
    setLoading(true)

    try {
      if (isSignUp) {
        const data = await signUp(email, password)
        if (data.session) {
          toast.success('Account created and signed in!')
        } else {
          setSuccessMsg('Account created! If email confirmation is enabled, check your inbox to confirm.')
          toast.success('Account created!')
        }
      } else {
        await signIn(email, password)
        toast.success('Signed in!')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Authentication failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-950">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-sky-900/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-600/20 border border-sky-600/30 mb-4">
            <Zap className="w-7 h-7 text-sky-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">AI Limits Tracker</h1>
          <p className="mt-1 text-sm text-gray-400">Real-time rate limit dashboard</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div className="flex border-b border-gray-800 pb-3 mb-2">
            <button
              type="button"
              onClick={() => { setIsSignUp(false); setError(null); setSuccessMsg(null) }}
              className={`flex-1 text-center py-1.5 text-sm font-medium border-b-2 -mb-3 transition-colors ${
                !isSignUp
                  ? 'border-sky-500 text-sky-400 font-semibold'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsSignUp(true); setError(null); setSuccessMsg(null) }}
              className={`flex-1 text-center py-1.5 text-sm font-medium border-b-2 -mb-3 transition-colors ${
                isSignUp
                  ? 'border-sky-500 text-sky-400 font-semibold'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-red-900/30 border border-red-700/50 px-3 py-2.5 text-sm text-red-300">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="rounded-lg bg-emerald-900/30 border border-emerald-700/50 px-3 py-2.5 text-sm text-emerald-300">
              {successMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                className="input pr-10"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                {isSignUp ? 'Creating account…' : 'Signing in…'}
              </>
            ) : isSignUp ? (
              'Create Account'
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-xs text-gray-600 px-1">
          <span>Single-user dashboard</span>
          <button
            onClick={() => {
              if (confirm('Change or reset Supabase keys?')) {
                clearSupabaseConfig()
              }
            }}
            className="flex items-center gap-1 text-gray-500 hover:text-sky-400 transition-colors"
          >
            <Settings2 className="w-3.5 h-3.5" />
            Edit Supabase keys
          </button>
        </div>
      </div>
    </div>
  )
}

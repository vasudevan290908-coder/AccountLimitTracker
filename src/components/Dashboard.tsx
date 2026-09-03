import { useState } from 'react'
import {
  Plus,
  RefreshCw,
  LogOut,
  Zap,
  Wifi,
  WifiOff,
  Settings2,
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { useTrackers } from '../hooks/useTrackers'
import { signOut } from '../hooks/useAuth'
import { clearSupabaseConfig } from '../lib/supabase'
import type { UpdateTracker } from '../types/tracker'
import TrackerRow from './TrackerRow'
import AddTrackerModal from './AddTrackerModal'
import toast from 'react-hot-toast'

interface DashboardProps {
  user: User
}

export default function Dashboard({ user }: DashboardProps) {
  const { trackers, loading, error, addTracker, updateTracker, deleteTracker } = useTrackers(
    user.id
  )
  const [addOpen, setAddOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    try {
      await signOut()
    } catch {
      toast.error('Sign-out failed')
      setSigningOut(false)
    }
  }

  async function handleUpdate(id: string, data: UpdateTracker) {
    try {
      await updateTracker(id, data)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed')
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteTracker(id)
      toast.success('Deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  const availableCount = trackers.filter(
    (t) => t.gemini_status === 'available' && t.claude_status === 'available'
  ).length

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-gray-800 bg-gray-950/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Left: Logo + title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-sky-600/20 border border-sky-600/30">
              <Zap className="w-4 h-4 text-sky-400" />
            </div>
            <span className="font-semibold text-white text-sm hidden sm:block">
              AI Limits Tracker
            </span>
          </div>

          {/* Center: stats pill */}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            {error ? (
              <span className="flex items-center gap-1.5 text-yellow-400">
                <WifiOff className="w-3.5 h-3.5" />
                Sync error
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Wifi className="w-3.5 h-3.5" />
                Live
              </span>
            )}
            <span className="text-gray-600">·</span>
            <span>
              <span className="text-white font-medium">{availableCount}</span>
              <span className="text-gray-600">/{trackers.length} fully available</span>
            </span>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAddOpen(true)}
              className="btn-primary text-xs px-3 py-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Account</span>
            </button>
            <button
              onClick={() => {
                if (confirm('Change or reset Supabase keys?')) {
                  clearSupabaseConfig()
                }
              }}
              className="btn-ghost text-xs px-2 py-1.5 text-gray-500 hover:text-sky-400"
              title="Edit Supabase Keys"
            >
              <Settings2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="btn-ghost text-xs px-2 py-1.5"
              title="Sign out"
            >
              {signingOut ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <LogOut className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ────────────────────────────────────────── */}
      <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-6 flex-1">
        {/* Error banner */}
        {error && (
          <div className="mb-4 rounded-lg border border-yellow-700/50 bg-yellow-900/20 px-4 py-3 text-sm text-yellow-300">
            ⚠️ {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && trackers.length === 0 && (
          <div className="card overflow-hidden">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-4 border-b border-gray-800 animate-pulse">
                <div className="h-4 w-32 bg-gray-800 rounded" />
                <div className="h-5 w-20 bg-gray-800 rounded-full" />
                <div className="h-4 w-24 bg-gray-800 rounded" />
                <div className="h-5 w-20 bg-gray-800 rounded-full ml-4" />
                <div className="h-4 w-24 bg-gray-800 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && trackers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mb-4">
              <Zap className="w-8 h-8 text-gray-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-300 mb-1">No accounts tracked yet</h2>
            <p className="text-sm text-gray-500 mb-6 max-w-xs">
              Add your Gmail accounts to track Gemini and Claude rate limit status in real time.
            </p>
            <button onClick={() => setAddOpen(true)} className="btn-primary">
              <Plus className="w-4 h-4" />
              Add your first account
            </button>
          </div>
        )}

        {/* Table */}
        {trackers.length > 0 && (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Account
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />
                      Gemini
                    </span>
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Gemini Reset
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-violet-400 inline-block" />
                      Claude
                    </span>
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Claude Reset
                  </th>
                  <th className="py-3 px-4 w-12" />
                </tr>
              </thead>
              <tbody>
                {trackers.map((tracker) => (
                  <TrackerRow
                    key={tracker.id}
                    tracker={tracker}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer hint */}
        {trackers.length > 0 && (
          <p className="mt-3 text-center text-xs text-gray-600">
            Updates sync instantly across all your devices · Countdowns are computed locally every second
          </p>
        )}
      </main>

      {/* Add modal */}
      {addOpen && (
        <AddTrackerModal
          onAdd={addTracker}
          onClose={() => setAddOpen(false)}
          nextSortOrder={trackers.length}
        />
      )}
    </div>
  )
}

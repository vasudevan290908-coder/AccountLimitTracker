import { useState, useEffect } from 'react'
import { Plus, Edit2, Wifi, WifiOff, Settings2, RotateCcw, Clock } from 'lucide-react'
import type { LimitTracker, UpdateTracker, NewTracker } from '../types/tracker'
import { formatLimitDateTime, calculateRemainingTime } from '../utils/dateUtils'
import EditRowModal from './EditRowModal'
import AddRowModal from './AddRowModal'
import { clearSupabaseConfig, isSupabaseConfigured } from '../lib/supabase'

interface SpreadsheetTableProps {
  trackers: LimitTracker[]
  isLiveSync: boolean
  onAdd: (data: NewTracker) => void
  onUpdate: (id: string, data: UpdateTracker) => void
  onDelete: (id: string) => void
  onReset: () => void
}

export default function SpreadsheetTable({
  trackers,
  isLiveSync,
  onAdd,
  onUpdate,
  onDelete,
  onReset,
}: SpreadsheetTableProps) {
  const [nowMs, setNowMs] = useState<number>(Date.now())
  const [editingTracker, setEditingTracker] = useState<LimitTracker | null>(null)
  const [isAddOpen, setIsAddOpen] = useState(false)

  // 1-second live ticker for real-time countdowns
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now()
      setNowMs(now)

      // Auto-expire timers that hit 0
      trackers.forEach((t) => {
        let changed = false
        const patch: UpdateTracker = {}

        if (t.gemini_status === 'limited' && t.gemini_reset_at) {
          if (new Date(t.gemini_reset_at).getTime() <= now) {
            patch.gemini_status = 'available'
            patch.gemini_reset_at = null
            changed = true
          }
        }

        if (t.claude_status === 'limited' && t.claude_reset_at) {
          if (new Date(t.claude_reset_at).getTime() <= now) {
            patch.claude_status = 'available'
            patch.claude_reset_at = null
            changed = true
          }
        }

        if (changed) {
          onUpdate(t.id, patch)
        }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [trackers, onUpdate])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-3 sm:p-6 select-none font-sans">
      {/* Top Toolbar */}
      <div className="w-full max-w-5xl mb-4 flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-base sm:text-lg font-black tracking-wide text-white">
              AI LIMITS TRACKER
            </h1>
          </div>

          <span className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 font-medium border bg-slate-800 border-slate-700 text-slate-300">
            {isSupabaseConfigured && isLiveSync ? (
              <>
                <Wifi className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Cloud Live Sync</span>
              </>
            ) : isSupabaseConfigured ? (
              <>
                <WifiOff className="w-3 h-3 text-yellow-400" />
                <span className="text-yellow-400">Connecting…</span>
              </>
            ) : (
              <>
                <Clock className="w-3 h-3 text-sky-400" />
                <span className="text-sky-400">Local Instant</span>
              </>
            )}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-all shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Email
          </button>

          <button
            onClick={() => {
              if (confirm('Reset table rows back to default accounts?')) {
                onReset()
              }
            }}
            title="Reset to default accounts"
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              if (confirm('Change or enter Supabase Cloud credentials?')) {
                clearSupabaseConfig()
              }
            }}
            title="Configure Cloud Sync Keys"
            className="p-2 text-slate-400 hover:text-sky-400 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs transition-colors"
          >
            <Settings2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Spreadsheet Table Container */}
      <div className="w-full max-w-5xl overflow-x-auto shadow-2xl rounded-sm border-2 border-black bg-white">
        <table className="w-full border-collapse text-black text-xs sm:text-sm font-sans">
          {/* Table Header matching user's red banner */}
          <thead>
            <tr className="bg-[#e60000] text-black font-extrabold text-center border-b-2 border-black">
              <th className="py-3 px-3 sm:px-4 border-r border-black tracking-tight">
                Email ID
              </th>
              <th className="py-3 px-3 sm:px-4 border-r border-black tracking-tight">
                Gemini Time Limit
              </th>
              <th className="py-3 px-3 sm:px-4 border-r border-black tracking-tight">
                Cloaud Time Limit
              </th>
              <th className="py-3 px-3 sm:px-4 border-r border-black tracking-tight">
                Real Time
                <br />
                Limit <span className="underline">Of</span> Gemini
              </th>
              <th className="py-3 px-3 sm:px-4 border-r border-black tracking-tight">
                Real Time
                <br />
                Limit <span className="underline">Of</span> Cloaud
              </th>
              <th className="py-3 px-2 w-12 text-center text-xs">
                Edit
              </th>
            </tr>
          </thead>

          {/* Table Rows matching user's yellow and green cells */}
          <tbody>
            {trackers.map((t) => {
              const geminiRemaining = calculateRemainingTime(
                t.gemini_status,
                t.gemini_reset_at,
                nowMs
              )
              const claudeRemaining = calculateRemainingTime(
                t.claude_status,
                t.claude_reset_at,
                nowMs
              )

              const isGeminiAvailable = t.gemini_status === 'available'
              const isClaudeAvailable = t.claude_status === 'available'

              return (
                <tr
                  key={t.id}
                  className="border-b border-black text-center font-medium hover:brightness-95 transition-all group"
                >
                  {/* Column 1: Email ID (Yellow) */}
                  <td className="py-2.5 px-3 border-r border-black bg-[#ffff00] text-black font-semibold text-left sm:text-center truncate max-w-[180px]">
                    {t.label}
                  </td>

                  {/* Column 2: Gemini Time Limit (Green if Available, Yellow if date) */}
                  <td
                    onClick={() => setEditingTracker(t)}
                    title="Click to update Gemini status"
                    className={`py-2.5 px-3 border-r border-black cursor-pointer ${
                      isGeminiAvailable
                        ? 'bg-[#00b050] text-black font-bold'
                        : 'bg-[#ffff00] text-black text-xs sm:text-sm'
                    }`}
                  >
                    {isGeminiAvailable
                      ? 'Available'
                      : formatLimitDateTime(t.gemini_reset_at)}
                  </td>

                  {/* Column 3: Cloaud Time Limit (Green if Available, Yellow if date) */}
                  <td
                    onClick={() => setEditingTracker(t)}
                    title="Click to update Claude status"
                    className={`py-2.5 px-3 border-r border-black cursor-pointer ${
                      isClaudeAvailable
                        ? 'bg-[#00b050] text-black font-bold'
                        : 'bg-[#ffff00] text-black text-xs sm:text-sm'
                    }`}
                  >
                    {isClaudeAvailable
                      ? 'Available'
                      : formatLimitDateTime(t.claude_reset_at)}
                  </td>

                  {/* Column 4: Real Time Limit Of Gemini (Yellow with live ticking countdown) */}
                  <td className="py-2.5 px-3 border-r border-black bg-[#ffff00] text-black font-mono font-bold text-center">
                    {geminiRemaining.text}
                  </td>

                  {/* Column 5: Real Time Limit Of Cloaud (Yellow with live ticking countdown) */}
                  <td className="py-2.5 px-3 border-r border-black bg-[#ffff00] text-black font-mono font-bold text-center">
                    {claudeRemaining.text}
                  </td>

                  {/* Action: Edit Button */}
                  <td className="py-2.5 px-2 bg-[#ffff00] text-center">
                    <button
                      onClick={() => setEditingTracker(t)}
                      className="p-1 rounded bg-black/10 hover:bg-black/20 text-black transition-colors"
                      title="Edit this account"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="w-full max-w-5xl mt-3 flex flex-wrap items-center justify-between text-xs text-slate-400 px-2">
        <p>
          💡 <strong>Tip:</strong> Click on any cell or click the <Edit2 className="w-3 h-3 inline mx-0.5" /> icon to update Available / Limited times.
        </p>
        <p>Countdowns update live every second.</p>
      </div>

      {/* Edit Modal */}
      {editingTracker && (
        <EditRowModal
          tracker={editingTracker}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onClose={() => setEditingTracker(null)}
        />
      )}

      {/* Add Modal */}
      {isAddOpen && (
        <AddRowModal
          onAdd={onAdd}
          onClose={() => setIsAddOpen(false)}
        />
      )}
    </div>
  )
}

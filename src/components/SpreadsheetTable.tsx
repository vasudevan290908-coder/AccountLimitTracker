import { useState, useEffect } from 'react'
import { Plus, Edit2, RotateCcw } from 'lucide-react'
import type { LimitTracker, UpdateTracker, NewTracker } from '../types/tracker'
import { formatLimitDateTime, calculateRemainingTime } from '../utils/dateUtils'
import EditRowModal from './EditRowModal'
import AddRowModal from './AddRowModal'

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
  onAdd,
  onUpdate,
  onDelete,
  onReset,
}: SpreadsheetTableProps) {
  const [nowMs, setNowMs] = useState<number>(Date.now())
  const [editingTracker, setEditingTracker] = useState<LimitTracker | null>(null)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [resetToast, setResetToast] = useState(false)

  function handleReset() {
    onReset()
    setResetToast(true)
    setTimeout(() => setResetToast(false), 2500)
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now()
      setNowMs(now)

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

        if (changed) onUpdate(t.id, patch)
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [trackers, onUpdate])

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start p-4 sm:p-8 select-none bg-white text-black"
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      {/* ── Minimalist Transparent Card Table ── */}
      <div
        className="w-full max-w-6xl rounded-2xl overflow-hidden border border-black/10 shadow-sm"
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* ── Top Bar ── */}
        <div className="px-5 py-3.5 flex items-center justify-between border-b border-black/10 bg-neutral-50/50">
          <h1 className="text-sm font-bold tracking-tight text-black">
            AI Limits Tracker
          </h1>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-black text-white hover:bg-neutral-800 transition-all active:scale-95 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Email
            </button>

            <button
              onClick={handleReset}
              title="Reset table"
              className="p-1.5 rounded-lg border border-black/15 hover:bg-black/5 text-black transition-all active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ── Clean Table ── */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs sm:text-sm text-black">
            <thead>
              <tr className="border-b border-black/10 bg-neutral-50 font-bold uppercase tracking-wider text-[11px] text-center">
                <th className="py-3 px-2 border-r border-black/10 w-12 text-center">
                  Sl No
                </th>
                <th className="py-3 px-3 sm:px-4 border-r border-black/10 text-left">
                  Email ID
                </th>
                <th className="py-3 px-3 sm:px-4 border-r border-black/10 text-center">
                  Gemini Time Limit
                </th>
                <th className="py-3 px-3 sm:px-4 border-r border-black/10 text-center">
                  Cloaud Time Limit
                </th>
                <th className="py-3 px-3 sm:px-4 border-r border-black/10 text-center">
                  Real Time Limit Of Gemini
                </th>
                <th className="py-3 px-3 sm:px-4 border-r border-black/10 text-center">
                  Real Time Limit Of Cloaud
                </th>
                <th className="py-3 px-2 w-12 text-center">
                  Edit
                </th>
              </tr>
            </thead>

            <tbody>
              {trackers.map((t, index) => {
                const geminiRemaining = calculateRemainingTime(t.gemini_status, t.gemini_reset_at, nowMs)
                const claudeRemaining = calculateRemainingTime(t.claude_status, t.claude_reset_at, nowMs)
                const isGeminiAvailable = t.gemini_status === 'available'
                const isClaudeAvailable = t.claude_status === 'available'

                return (
                  <tr
                    key={t.id}
                    className="border-b border-black/5 hover:bg-neutral-50 transition-colors"
                  >
                    {/* Sl No */}
                    <td className="py-3 px-2 text-center font-bold text-black border-r border-black/10">
                      {index + 1}
                    </td>

                    {/* Email ID */}
                    <td className="py-3 px-3 sm:px-4 font-semibold text-left text-black truncate max-w-[220px] border-r border-black/10">
                      {t.label}
                    </td>

                    {/* Gemini Time Limit */}
                    <td
                      onClick={() => setEditingTracker(t)}
                      title="Click to edit Gemini limit"
                      className="py-3 px-3 sm:px-4 text-center cursor-pointer border-r border-black/10 hover:underline"
                    >
                      {isGeminiAvailable ? (
                        <span className="font-bold text-black">
                          Available
                        </span>
                      ) : (
                        <span className="text-black font-medium">
                          {formatLimitDateTime(t.gemini_reset_at)}
                        </span>
                      )}
                    </td>

                    {/* Claude Time Limit */}
                    <td
                      onClick={() => setEditingTracker(t)}
                      title="Click to edit Claude limit"
                      className="py-3 px-3 sm:px-4 text-center cursor-pointer border-r border-black/10 hover:underline"
                    >
                      {isClaudeAvailable ? (
                        <span className="font-bold text-black">
                          Available
                        </span>
                      ) : (
                        <span className="text-black font-medium">
                          {formatLimitDateTime(t.claude_reset_at)}
                        </span>
                      )}
                    </td>

                    {/* Real Time Gemini Countdown */}
                    <td
                      className="py-3 px-3 sm:px-4 text-center font-bold text-black border-r border-black/10"
                      style={{
                        fontFamily: "'SF Mono', 'Cascadia Code', 'Fira Code', 'Consolas', monospace",
                        fontSize: '0.78rem',
                      }}
                    >
                      {geminiRemaining.text}
                    </td>

                    {/* Real Time Claude Countdown */}
                    <td
                      className="py-3 px-3 sm:px-4 text-center font-bold text-black border-r border-black/10"
                      style={{
                        fontFamily: "'SF Mono', 'Cascadia Code', 'Fira Code', 'Consolas', monospace",
                        fontSize: '0.78rem',
                      }}
                    >
                      {claudeRemaining.text}
                    </td>

                    {/* Edit Action */}
                    <td className="py-3 px-2 text-center">
                      <button
                        onClick={() => setEditingTracker(t)}
                        className="p-1 rounded-md hover:bg-black/10 text-black transition-colors"
                        title="Edit account"
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
      </div>

      {/* ── In-page Toast Notification ── */}
      {resetToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-black shadow-xl animate-bounce">
          <span>✓</span>
          <span>Table refreshed to default accounts</span>
        </div>
      )}

      {/* ── Modals ── */}
      {editingTracker && (
        <EditRowModal
          tracker={editingTracker}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onClose={() => setEditingTracker(null)}
        />
      )}

      {isAddOpen && (
        <AddRowModal
          onAdd={onAdd}
          onClose={() => setIsAddOpen(false)}
        />
      )}
    </div>
  )
}

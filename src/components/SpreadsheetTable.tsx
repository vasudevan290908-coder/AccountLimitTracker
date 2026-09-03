import { useState, useEffect } from 'react'
import { Plus, RotateCcw } from 'lucide-react'
import type { LimitTracker, UpdateTracker, NewTracker } from '../types/tracker'
import { formatLimitDateTime, calculateRemainingTime } from '../utils/dateUtils'
import StarfieldBackground from './StarfieldBackground'
import EditRowModal from './EditRowModal'
import AddRowModal from './AddRowModal'

interface SpreadsheetTableProps {
  trackers: LimitTracker[]
  isLiveSync: boolean
  onAdd: (data: NewTracker) => void
  onUpdate: (id: string, data: UpdateTracker) => void
  onDelete: (id: string) => void
  onRefresh: () => Promise<void> | void
}

export default function SpreadsheetTable({
  trackers,
  onAdd,
  onUpdate,
  onDelete,
  onRefresh,
}: SpreadsheetTableProps) {
  const [nowMs, setNowMs] = useState<number>(Date.now())
  const [editingTracker, setEditingTracker] = useState<LimitTracker | null>(null)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshToast, setRefreshToast] = useState(false)

  async function handleRefresh() {
    setIsRefreshing(true)
    try {
      await onRefresh()
      setRefreshToast(true)
      setTimeout(() => setRefreshToast(false), 2000)
    } finally {
      setTimeout(() => setIsRefreshing(false), 500)
    }
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
      className="min-h-screen flex flex-col items-center justify-start p-3 sm:p-6 md:p-10 select-none relative overflow-x-hidden text-slate-200"
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      {/* ── Framer Video Starfield Space Canvas ── */}
      <StarfieldBackground />

      {/* ── Transparent Glass Card Table ── */}
      <div
        className="relative z-10 w-full max-w-6xl rounded-2xl overflow-hidden transition-all duration-300"
        style={{
          background: 'rgba(4, 6, 14, 0.16)',
          backdropFilter: 'blur(12px) saturate(140%)',
          WebkitBackdropFilter: 'blur(12px) saturate(140%)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* ── Top Bar ── */}
        <div
          className="px-5 py-4 flex items-center justify-between border-b"
          style={{
            background: 'rgba(255, 255, 255, 0.01)',
            borderColor: 'rgba(255, 255, 255, 0.05)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-[#38bdf8] opacity-80 animate-pulse" />
            <h1
              className="text-sm font-semibold tracking-wide text-[#f1f5f9]"
              style={{ letterSpacing: '0.04em' }}
            >
              AI Limits Tracker
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[#f1f5f9] transition-all hover:bg-white/10 active:scale-95 shadow-sm"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.10)',
              }}
            >
              <Plus className="w-3.5 h-3.5 text-[#cbd5e1]" />
              <span>Add Email</span>
            </button>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh table"
              className="p-1.5 rounded-xl text-[#cbd5e1] hover:text-[#f1f5f9] transition-all hover:bg-white/10 active:scale-95 disabled:opacity-50"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <RotateCcw className={`w-3.5 h-3.5 transition-transform duration-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* ── Transparent Table ── */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs sm:text-sm">
            <thead>
              <tr
                className="font-semibold uppercase tracking-wider text-[11px] border-b text-center text-[#cbd5e1]"
                style={{
                  background: 'rgba(255, 255, 255, 0.01)',
                  borderColor: 'rgba(255, 255, 255, 0.05)',
                }}
              >
                <th className="py-3 px-2 border-r border-white/[0.04] w-12 text-center text-[#94a3b8]">
                  Sl No
                </th>
                <th className="py-3 px-3 sm:px-4 border-r border-white/[0.04] text-left text-[#cbd5e1]">
                  Email ID
                </th>
                <th className="py-3 px-3 sm:px-4 border-r border-white/[0.04] text-center text-[#cbd5e1]">
                  Gemini Time Limit
                </th>
                <th className="py-3 px-3 sm:px-4 border-r border-white/[0.04] text-center text-[#cbd5e1]">
                  Cloaud Time Limit
                </th>
                <th className="py-3 px-3 sm:px-4 border-r border-white/[0.04] text-center text-[#cbd5e1]">
                  Real Time Limit Of Gemini
                </th>
                <th className="py-3 px-3 sm:px-4 text-center text-[#cbd5e1]">
                  Real Time Limit Of Cloaud
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
                    className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors group"
                  >
                    {/* Sl No */}
                    <td className="py-3 px-2 text-center font-medium text-[#94a3b8] border-r border-white/[0.04] text-xs">
                      {index + 1}
                    </td>

                    {/* Email ID (Clickable to Edit) */}
                    <td
                      onClick={() => setEditingTracker(t)}
                      title="Click to edit account"
                      className="py-3 px-3 sm:px-4 font-medium text-left text-[#f1f5f9] truncate max-w-[220px] border-r border-white/[0.04] cursor-pointer hover:text-white transition-colors"
                    >
                      {t.label}
                    </td>

                    {/* Gemini Time Limit */}
                    <td
                      onClick={() => setEditingTracker(t)}
                      title="Click to edit Gemini limit"
                      className="py-3 px-3 sm:px-4 text-center cursor-pointer border-r border-white/[0.04] transition-colors hover:text-[#f8fafc]"
                    >
                      {isGeminiAvailable ? (
                        <span className="font-medium text-[#f1f5f9] inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#cbd5e1] opacity-90 shadow-sm" />
                          Available
                        </span>
                      ) : (
                        <span className="text-[#cbd5e1] font-normal text-xs sm:text-[13px]">
                          {formatLimitDateTime(t.gemini_reset_at)}
                        </span>
                      )}
                    </td>

                    {/* Claude Time Limit */}
                    <td
                      onClick={() => setEditingTracker(t)}
                      title="Click to edit Claude limit"
                      className="py-3 px-3 sm:px-4 text-center cursor-pointer border-r border-white/[0.04] transition-colors hover:text-[#f8fafc]"
                    >
                      {isClaudeAvailable ? (
                        <span className="font-medium text-[#f1f5f9] inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#cbd5e1] opacity-90 shadow-sm" />
                          Available
                        </span>
                      ) : (
                        <span className="text-[#cbd5e1] font-normal text-xs sm:text-[13px]">
                          {formatLimitDateTime(t.claude_reset_at)}
                        </span>
                      )}
                    </td>

                    {/* Real Time Gemini Countdown */}
                    <td
                      className="py-3 px-3 sm:px-4 text-center font-medium text-[#f1f5f9] border-r border-white/[0.04]"
                      style={{
                        fontFamily: "'SF Mono', 'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
                        fontSize: '0.78rem',
                        letterSpacing: '0.03em',
                      }}
                    >
                      {geminiRemaining.text === '-' ? (
                        <span className="text-[#64748b] font-normal">-</span>
                      ) : (
                        geminiRemaining.text
                      )}
                    </td>

                    {/* Real Time Claude Countdown */}
                    <td
                      className="py-3 px-3 sm:px-4 text-center font-medium text-[#f1f5f9]"
                      style={{
                        fontFamily: "'SF Mono', 'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
                        fontSize: '0.78rem',
                        letterSpacing: '0.03em',
                      }}
                    >
                      {claudeRemaining.text === '-' ? (
                        <span className="text-[#64748b] font-normal">-</span>
                      ) : (
                        claudeRemaining.text
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── In-page Toast Notification ── */}
      {refreshToast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-medium text-[#f1f5f9] shadow-2xl transition-all animate-bounce"
          style={{
            background: 'rgba(10, 14, 26, 0.85)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
          }}
        >
          <span className="text-[#38bdf8]">✓</span>
          <span>Table refreshed</span>
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

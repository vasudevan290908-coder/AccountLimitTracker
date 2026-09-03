import { useState, useEffect } from 'react'
import { Plus, Edit2, RotateCcw, Settings2, Clock, Wifi, WifiOff } from 'lucide-react'
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
      className="min-h-screen flex flex-col items-center justify-start p-3 sm:p-6 md:p-10 select-none bg-[#f8fafc] text-black"
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      {/* ── Minimalist Light Transparent Card Window ── */}
      <div
        className="w-full max-w-6xl rounded-2xl overflow-hidden shadow-xl transition-all duration-200"
        style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
        }}
      >
        {/* ── Top Bar ── */}
        <div
          className="px-4 sm:px-6 py-3.5 flex items-center justify-between border-b"
          style={{
            background: 'rgba(0, 0, 0, 0.02)',
            borderColor: 'rgba(0, 0, 0, 0.06)',
          }}
        >
          {/* Traffic Lights + Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block border border-black/10" />
              <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block border border-black/10" />
              <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block border border-black/10" />
            </div>

            <h1 className="text-xs sm:text-sm font-bold tracking-tight text-black ml-2">
              AI Limits Tracker
            </h1>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Sync Pill */}
            <div
              className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border text-black"
              style={{
                background: 'rgba(0, 0, 0, 0.03)',
                borderColor: 'rgba(0, 0, 0, 0.08)',
              }}
            >
              {isSupabaseConfigured && isLiveSync ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-black" />
                  <span className="text-[11px] font-medium hidden sm:inline text-black">Live Cloud</span>
                </>
              ) : isSupabaseConfigured ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-black" />
                  <span className="text-[11px] font-medium hidden sm:inline text-black">Connecting</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 text-black" />
                  <span className="text-[11px] font-medium hidden sm:inline text-black">Local</span>
                </>
              )}
            </div>

            {/* Add Email Button */}
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-black text-white hover:bg-neutral-800 transition-all shadow-sm active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Email</span>
            </button>

            {/* Reset Button */}
            <button
              onClick={handleReset}
              title="Refresh / reset table"
              className="p-1.5 rounded-lg border border-black/10 bg-black/5 hover:bg-black/10 text-black transition-all active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Cloud Config Settings Button */}
            <button
              onClick={() => clearSupabaseConfig()}
              title="Configure Cloud Sync Keys"
              className="p-1.5 rounded-lg border border-black/10 bg-black/5 hover:bg-black/10 text-black transition-all active:scale-95"
            >
              <Settings2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ── Clean Transparent Table ── */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs sm:text-sm text-black">
            {/* Header */}
            <thead>
              <tr
                className="text-black font-bold uppercase tracking-wider text-[11px] border-b text-center"
                style={{
                  background: 'rgba(0, 0, 0, 0.03)',
                  borderColor: 'rgba(0, 0, 0, 0.08)',
                }}
              >
                <th className="py-3 px-2 border-r border-black/5 w-12 text-center">
                  Sl No
                </th>
                <th className="py-3 px-3 sm:px-4 border-r border-black/5 text-left">
                  Email ID
                </th>
                <th className="py-3 px-3 sm:px-4 border-r border-black/5 text-center">
                  Gemini Time Limit
                </th>
                <th className="py-3 px-3 sm:px-4 border-r border-black/5 text-center">
                  Cloaud Time Limit
                </th>
                <th className="py-3 px-3 sm:px-4 border-r border-black/5 text-center">
                  Real Time Limit Of Gemini
                </th>
                <th className="py-3 px-3 sm:px-4 border-r border-black/5 text-center">
                  Real Time Limit Of Cloaud
                </th>
                <th className="py-3 px-2 w-12 text-center">
                  Edit
                </th>
              </tr>
            </thead>

            {/* Rows */}
            <tbody>
              {trackers.map((t, index) => {
                const geminiRemaining = calculateRemainingTime(t.gemini_status, t.gemini_reset_at, nowMs)
                const claudeRemaining = calculateRemainingTime(t.claude_status, t.claude_reset_at, nowMs)
                const isGeminiAvailable = t.gemini_status === 'available'
                const isClaudeAvailable = t.claude_status === 'available'

                return (
                  <tr
                    key={t.id}
                    className="border-b border-black/5 hover:bg-black/[0.02] transition-colors"
                  >
                    {/* Column 0: Sl No */}
                    <td className="py-3 px-2 text-center font-bold text-black border-r border-black/5">
                      {index + 1}
                    </td>

                    {/* Column 1: Email ID */}
                    <td className="py-3 px-3 sm:px-4 font-semibold text-left text-black truncate max-w-[220px] border-r border-black/5">
                      {t.label}
                    </td>

                    {/* Column 2: Gemini Time Limit */}
                    <td
                      onClick={() => setEditingTracker(t)}
                      title="Click to edit Gemini limit"
                      className="py-3 px-3 sm:px-4 text-center cursor-pointer border-r border-black/5 hover:underline"
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

                    {/* Column 3: Claude Time Limit */}
                    <td
                      onClick={() => setEditingTracker(t)}
                      title="Click to edit Claude limit"
                      className="py-3 px-3 sm:px-4 text-center cursor-pointer border-r border-black/5 hover:underline"
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

                    {/* Column 4: Real Time Gemini Countdown */}
                    <td
                      className="py-3 px-3 sm:px-4 text-center font-bold text-black border-r border-black/5"
                      style={{
                        fontFamily: "'SF Mono', 'Cascadia Code', 'Fira Code', 'Consolas', monospace",
                        fontSize: '0.78rem',
                      }}
                    >
                      {geminiRemaining.text}
                    </td>

                    {/* Column 5: Real Time Claude Countdown */}
                    <td
                      className="py-3 px-3 sm:px-4 text-center font-bold text-black border-r border-black/5"
                      style={{
                        fontFamily: "'SF Mono', 'Cascadia Code', 'Fira Code', 'Consolas', monospace",
                        fontSize: '0.78rem',
                      }}
                    >
                      {claudeRemaining.text}
                    </td>

                    {/* Column 6: Edit Action */}
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

        {/* ── Status Bar ── */}
        <div
          className="px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between text-[11px] text-neutral-500 border-t"
          style={{
            background: 'rgba(0, 0, 0, 0.01)',
            borderColor: 'rgba(0, 0, 0, 0.05)',
          }}
        >
          <span>💡 Click any cell to update time</span>
          <span style={{ fontFamily: "'SF Mono', monospace" }}>
            Live Ticker · 1s
          </span>
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

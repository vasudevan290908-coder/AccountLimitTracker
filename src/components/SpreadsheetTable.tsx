import { useState, useEffect } from 'react'
import type { LimitTracker, UpdateTracker, NewTracker } from '../types/tracker'
import { formatLimitDateTime, calculateRemainingTime } from '../utils/dateUtils'
import EditRowModal from './EditRowModal'
import AddRowModal from './AddRowModal'
import { clearSupabaseConfig, isSupabaseConfigured } from '../lib/supabase'
import {
  AppleLogoIcon,
  GoldenGateBadgeIcon,
  MacAddIcon,
  MacEditIcon,
  MacResetIcon,
  MacSettingsIcon,
  MacWifiIcon,
  MacWifiOffIcon,
  MacClockIcon,
} from './icons/MacIcons'

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
      className="min-h-screen flex flex-col items-center justify-start p-3 sm:p-6 md:p-10 select-none relative overflow-x-hidden text-slate-100"
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
        background: 'radial-gradient(circle at 50% 10%, #2a1538 0%, #160d26 40%, #0c0b17 80%, #05050d 100%)',
      }}
    >
      {/* ── macOS Golden Gate Atmospheric Ambient Glows ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Golden Gate Sunset Amber Glow */}
        <div
          className="absolute rounded-full blur-[120px] opacity-35"
          style={{
            width: '650px',
            height: '450px',
            top: '-60px',
            left: '20%',
            background: 'radial-gradient(circle, #ff6b35 0%, #e11d48 45%, transparent 70%)',
          }}
        />
        {/* Pacific Deep Violet Glow */}
        <div
          className="absolute rounded-full blur-[140px] opacity-25"
          style={{
            width: '700px',
            height: '500px',
            bottom: '-80px',
            right: '5%',
            background: 'radial-gradient(circle, #7c3aed 0%, #3b82f6 50%, transparent 70%)',
          }}
        />
        {/* Marin Headlands Cyan Mist Glow */}
        <div
          className="absolute rounded-full blur-[100px] opacity-20"
          style={{
            width: '450px',
            height: '450px',
            top: '35%',
            left: '-100px',
            background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)',
          }}
        />
      </div>

      {/* ── macOS 27 Golden Gate Main App Window ── */}
      <div
        className="relative z-10 w-full max-w-6xl rounded-2xl overflow-hidden transition-all duration-300"
        style={{
          background: 'rgba(18, 16, 28, 0.42)',
          backdropFilter: 'blur(45px) saturate(210%)',
          WebkitBackdropFilter: 'blur(45px) saturate(210%)',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.22)',
        }}
      >
        {/* ── macOS Window Chrome / Titlebar ── */}
        <div
          className="px-4 sm:px-6 py-3.5 flex items-center justify-between border-b"
          style={{
            background: 'rgba(255, 255, 255, 0.035)',
            borderColor: 'rgba(255, 255, 255, 0.08)',
          }}
        >
          {/* Traffic Lights + App Title */}
          <div className="flex items-center gap-4">
            {/* macOS Window Traffic Lights */}
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full cursor-pointer transition-transform hover:scale-110"
                style={{
                  background: '#ff5f56',
                  boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.4), 0 1px 2px rgba(0,0,0,0.3)',
                  border: '0.5px solid rgba(0,0,0,0.2)',
                }}
                title="Close"
              />
              <span
                className="w-3 h-3 rounded-full cursor-pointer transition-transform hover:scale-110"
                style={{
                  background: '#ffbd2e',
                  boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.4), 0 1px 2px rgba(0,0,0,0.3)',
                  border: '0.5px solid rgba(0,0,0,0.2)',
                }}
                title="Minimize"
              />
              <span
                className="w-3 h-3 rounded-full cursor-pointer transition-transform hover:scale-110"
                style={{
                  background: '#27c93f',
                  boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.4), 0 1px 2px rgba(0,0,0,0.3)',
                  border: '0.5px solid rgba(0,0,0,0.2)',
                }}
                title="Zoom"
              />
            </div>

            {/* Title with Golden Gate Badge */}
            <div className="flex items-center gap-2.5 ml-2">
              <GoldenGateBadgeIcon size={24} />
              <div className="flex items-center gap-1.5">
                <AppleLogoIcon size={13} className="text-white/80" />
                <h1 className="text-xs sm:text-sm font-semibold tracking-wide text-white/95">
                  AI Limits Tracker <span className="text-white/40 font-normal ml-1">macOS Golden Gate</span>
                </h1>
              </div>
            </div>
          </div>

          {/* Sync Status Badge + Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Sync Pill */}
            <div
              className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium transition-all"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
              }}
            >
              {isSupabaseConfigured && isLiveSync ? (
                <>
                  <MacWifiIcon size={14} />
                  <span className="text-cyan-300 text-[11px] font-medium">Live Cloud</span>
                </>
              ) : isSupabaseConfigured ? (
                <>
                  <MacWifiOffIcon size={14} />
                  <span className="text-amber-300 text-[11px] font-medium">Connecting</span>
                </>
              ) : (
                <>
                  <MacClockIcon size={14} />
                  <span className="text-purple-300 text-[11px] font-medium">Local Fast</span>
                </>
              )}
            </div>

            {/* Add Email Button */}
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all duration-150 hover:brightness-110 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.28), rgba(16, 185, 129, 0.16))',
                border: '1px solid rgba(52, 211, 153, 0.4)',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.15)',
              }}
            >
              <MacAddIcon size={15} />
              <span className="hidden sm:inline">Add Email</span>
            </button>

            {/* Reset Button */}
            <button
              onClick={handleReset}
              title="Refresh / reset table"
              className="p-1.5 rounded-lg transition-all duration-150 hover:brightness-125 active:scale-95"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
              }}
            >
              <MacResetIcon size={16} />
            </button>

            {/* Cloud Config Settings Button */}
            <button
              onClick={() => clearSupabaseConfig()}
              title="Configure Cloud Sync Keys"
              className="p-1.5 rounded-lg transition-all duration-150 hover:brightness-125 active:scale-95"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
              }}
            >
              <MacSettingsIcon size={16} />
            </button>
          </div>
        </div>

        {/* ── Transparent Glass Table Container ── */}
        <div className="overflow-x-auto p-2 sm:p-4">
          <table
            className="w-full border-separate border-spacing-y-1.5 text-xs sm:text-sm"
            style={{
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
            }}
          >
            {/* Table Header with Glassmorphism */}
            <thead>
              <tr className="text-white/80 font-semibold tracking-wider text-[11px] uppercase">
                <th
                  className="py-2.5 px-2 text-center rounded-l-xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.28), rgba(225, 29, 72, 0.18))',
                    border: '1px solid rgba(244, 63, 94, 0.35)',
                    borderRight: 'none',
                    width: '46px',
                  }}
                >
                  Sl No
                </th>
                <th
                  className="py-2.5 px-3 text-left"
                  style={{
                    background: 'rgba(255, 255, 255, 0.045)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.10)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.10)',
                  }}
                >
                  Email ID
                </th>
                <th
                  className="py-2.5 px-3 text-center"
                  style={{
                    background: 'rgba(255, 255, 255, 0.045)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.10)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.10)',
                  }}
                >
                  Gemini Time Limit
                </th>
                <th
                  className="py-2.5 px-3 text-center"
                  style={{
                    background: 'rgba(255, 255, 255, 0.045)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.10)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.10)',
                  }}
                >
                  Cloaud Time Limit
                </th>
                <th
                  className="py-2.5 px-3 text-center"
                  style={{
                    background: 'rgba(255, 255, 255, 0.045)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.10)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.10)',
                  }}
                >
                  Real Time Limit <span className="text-white/40">Of Gemini</span>
                </th>
                <th
                  className="py-2.5 px-3 text-center"
                  style={{
                    background: 'rgba(255, 255, 255, 0.045)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.10)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.10)',
                  }}
                >
                  Real Time Limit <span className="text-white/40">Of Cloaud</span>
                </th>
                <th
                  className="py-2.5 px-2 text-center rounded-r-xl"
                  style={{
                    background: 'rgba(255, 255, 255, 0.045)',
                    border: '1px solid rgba(255, 255, 255, 0.10)',
                    borderLeft: 'none',
                    width: '44px',
                  }}
                >
                  Action
                </th>
              </tr>
            </thead>

            {/* Table Rows — Highly Transparent Glass Cards */}
            <tbody>
              {trackers.map((t, index) => {
                const geminiRemaining = calculateRemainingTime(t.gemini_status, t.gemini_reset_at, nowMs)
                const claudeRemaining = calculateRemainingTime(t.claude_status, t.claude_reset_at, nowMs)
                const isGeminiAvailable = t.gemini_status === 'available'
                const isClaudeAvailable = t.claude_status === 'available'

                return (
                  <tr
                    key={t.id}
                    className="group transition-all duration-200"
                  >
                    {/* Column 0: Sl No — Golden Gate Crimson Squircle */}
                    <td
                      className="py-2.5 px-2 text-center font-bold rounded-l-xl text-xs"
                      style={{
                        background: 'linear-gradient(135deg, rgba(225, 29, 72, 0.22), rgba(190, 18, 60, 0.14))',
                        border: '1px solid rgba(244, 63, 94, 0.28)',
                        borderRight: 'none',
                        color: '#fda4af',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {index + 1}
                    </td>

                    {/* Column 1: Email ID — Transparent Amber Tint */}
                    <td
                      className="py-2.5 px-3 font-medium text-left truncate max-w-[210px]"
                      style={{
                        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.08), rgba(245, 158, 11, 0.04))',
                        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        color: '#fef3c7',
                      }}
                    >
                      {t.label}
                    </td>

                    {/* Column 2: Gemini Time Limit — Emerald Crystal / Amber Glow */}
                    <td
                      onClick={() => setEditingTracker(t)}
                      title="Click to edit Gemini limit"
                      className="py-2.5 px-3 text-center font-semibold cursor-pointer transition-all duration-150 hover:brightness-125"
                      style={{
                        background: isGeminiAvailable
                          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.18), rgba(5, 150, 105, 0.10))'
                          : 'linear-gradient(135deg, rgba(245, 158, 11, 0.16), rgba(217, 119, 6, 0.08))',
                        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        color: isGeminiAvailable ? '#34d399' : '#fde68a',
                        fontSize: '0.74rem',
                      }}
                    >
                      {isGeminiAvailable ? (
                        <span className="inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Available
                        </span>
                      ) : (
                        formatLimitDateTime(t.gemini_reset_at)
                      )}
                    </td>

                    {/* Column 3: Claude Time Limit — Emerald Crystal / Amber Glow */}
                    <td
                      onClick={() => setEditingTracker(t)}
                      title="Click to edit Claude limit"
                      className="py-2.5 px-3 text-center font-semibold cursor-pointer transition-all duration-150 hover:brightness-125"
                      style={{
                        background: isClaudeAvailable
                          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.18), rgba(5, 150, 105, 0.10))'
                          : 'linear-gradient(135deg, rgba(245, 158, 11, 0.16), rgba(217, 119, 6, 0.08))',
                        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        color: isClaudeAvailable ? '#34d399' : '#fde68a',
                        fontSize: '0.74rem',
                      }}
                    >
                      {isClaudeAvailable ? (
                        <span className="inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Available
                        </span>
                      ) : (
                        formatLimitDateTime(t.claude_reset_at)
                      )}
                    </td>

                    {/* Column 4: Real Time Gemini Countdown — SF Mono Glowing Counter */}
                    <td
                      className="py-2.5 px-3 text-center font-bold"
                      style={{
                        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.09), rgba(245, 158, 11, 0.03))',
                        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        color: geminiRemaining.text === '-' ? 'rgba(255, 255, 255, 0.25)' : '#fef08a',
                        fontFamily: "'SF Mono', 'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
                        fontSize: '0.76rem',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {geminiRemaining.text}
                    </td>

                    {/* Column 5: Real Time Claude Countdown — SF Mono Glowing Counter */}
                    <td
                      className="py-2.5 px-3 text-center font-bold"
                      style={{
                        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.09), rgba(245, 158, 11, 0.03))',
                        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        color: claudeRemaining.text === '-' ? 'rgba(255, 255, 255, 0.25)' : '#fef08a',
                        fontFamily: "'SF Mono', 'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
                        fontSize: '0.76rem',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {claudeRemaining.text}
                    </td>

                    {/* Column 6: Edit Action */}
                    <td
                      className="py-2.5 px-2 text-center rounded-r-xl"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.02))',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderLeft: 'none',
                      }}
                    >
                      <button
                        onClick={() => setEditingTracker(t)}
                        className="p-1 rounded-lg transition-all duration-150 opacity-60 hover:opacity-100 hover:scale-105 active:scale-95"
                        title="Edit account details"
                      >
                        <MacEditIcon size={16} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* ── Window Footer / Status Bar ── */}
        <div
          className="px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between text-[11px] border-t"
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            borderColor: 'rgba(255, 255, 255, 0.06)',
            color: 'rgba(255, 255, 255, 0.45)',
          }}
        >
          <div className="flex items-center gap-2">
            <span>💡 Click any limit cell or icon to update times</span>
          </div>
          <div className="flex items-center gap-1.5" style={{ fontFamily: "'SF Mono', monospace" }}>
            <span>Live Ticker</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
          </div>
        </div>
      </div>

      {/* ── In-page Toast Notification (No Browser Popup) ── */}
      {resetToast && (
        <div
          className="fixed bottom-6 left-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl text-xs font-medium text-white transition-all shadow-2xl animate-bounce"
          style={{
            transform: 'translateX(-50%)',
            background: 'rgba(18, 16, 28, 0.85)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            border: '1px solid rgba(52, 211, 153, 0.5)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(16, 185, 129, 0.25)',
          }}
        >
          <MacResetIcon size={16} />
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

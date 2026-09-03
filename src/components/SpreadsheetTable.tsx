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
      className="min-h-screen flex flex-col items-center p-4 sm:p-8 select-none"
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
        background: 'linear-gradient(135deg, #0d0d1a 0%, #0a1628 30%, #0f0a1e 60%, #1a0a2e 100%)',
        minHeight: '100vh',
      }}
    >
      {/* Ambient background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute rounded-full blur-3xl opacity-20"
          style={{
            width: '600px', height: '600px',
            top: '-100px', left: '-100px',
            background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute rounded-full blur-3xl opacity-15"
          style={{
            width: '500px', height: '500px',
            bottom: '-50px', right: '-50px',
            background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute rounded-full blur-3xl opacity-10"
          style={{
            width: '400px', height: '400px',
            top: '40%', left: '50%',
            background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Top Toolbar — glass card */}
      <div
        className="relative z-10 w-full max-w-6xl mb-6 flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 rounded-2xl"
        style={{
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <span
              className="w-2.5 h-2.5 rounded-full animate-pulse"
              style={{ background: 'linear-gradient(135deg, #34d399, #10b981)' }}
            />
            <h1
              className="text-base sm:text-lg font-bold tracking-widest text-white"
              style={{ letterSpacing: '0.12em', fontWeight: 700 }}
            >
              AI LIMITS TRACKER
            </h1>
          </div>

          <span
            className="text-xs px-3 py-1 rounded-full flex items-center gap-1.5 font-medium"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.14)',
              color: isSupabaseConfigured && isLiveSync ? '#6ee7b7' : isSupabaseConfigured ? '#fcd34d' : '#93c5fd',
            }}
          >
            {isSupabaseConfigured && isLiveSync ? (
              <><Wifi className="w-3 h-3" /><span>Cloud Live</span></>
            ) : isSupabaseConfigured ? (
              <><WifiOff className="w-3 h-3" /><span>Connecting…</span></>
            ) : (
              <><Clock className="w-3 h-3" /><span>Local Instant</span></>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 font-semibold text-xs px-4 py-2 rounded-xl text-white transition-all"
            style={{
              background: 'linear-gradient(135deg, rgba(52,211,153,0.3), rgba(16,185,129,0.2))',
              border: '1px solid rgba(52,211,153,0.4)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <Plus className="w-3.5 h-3.5" /> Add Email
          </button>

          <button
            onClick={() => { if (confirm('Reset table rows back to default accounts?')) onReset() }}
            title="Reset to default accounts"
            className="p-2 rounded-xl transition-all"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.6)',
            }}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => { if (confirm('Change or enter Supabase Cloud credentials?')) clearSupabaseConfig() }}
            title="Configure Cloud Sync Keys"
            className="p-2 rounded-xl transition-all"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.6)',
            }}
          >
            <Settings2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Table — glass card */}
      <div
        className="relative z-10 w-full max-w-6xl overflow-x-auto rounded-2xl"
        style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        <table
          className="w-full border-collapse text-xs sm:text-sm"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
        >
          {/* Header */}
          <thead>
            <tr
              style={{
                background: 'linear-gradient(135deg, rgba(220,38,38,0.55) 0%, rgba(185,28,28,0.45) 100%)',
                borderBottom: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              {['Sl No', 'Email ID', 'Gemini Time Limit', 'Cloaud Time Limit', 'Real Time Limit Of Gemini', 'Real Time Limit Of Cloaud', ''].map((col, i) => (
                <th
                  key={i}
                  className="py-4 px-3 text-center font-semibold text-white tracking-wide"
                  style={{
                    fontSize: i === 0 ? '0.7rem' : '0.75rem',
                    letterSpacing: '0.07em',
                    borderRight: i < 6 ? '1px solid rgba(255,255,255,0.10)' : undefined,
                    width: i === 0 ? '52px' : i === 6 ? '48px' : undefined,
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          {/* Rows */}
          <tbody>
            {trackers.map((t, index) => {
              const geminiRemaining = calculateRemainingTime(t.gemini_status, t.gemini_reset_at, nowMs)
              const claudeRemaining = calculateRemainingTime(t.claude_status, t.claude_reset_at, nowMs)
              const isGeminiAvailable = t.gemini_status === 'available'
              const isClaudeAvailable = t.claude_status === 'available'
              const isEven = index % 2 === 0

              const rowBg = isEven
                ? 'rgba(255,255,255,0.03)'
                : 'rgba(255,255,255,0.015)'

              const borderStyle = '1px solid rgba(255,255,255,0.07)'

              return (
                <tr
                  key={t.id}
                  className="transition-all duration-150 group"
                  style={{
                    background: rowBg,
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
                  onMouseLeave={e => (e.currentTarget.style.background = rowBg)}
                >
                  {/* Sl No */}
                  <td
                    className="py-3 px-2 text-center font-bold"
                    style={{
                      borderRight: borderStyle,
                      background: 'linear-gradient(135deg, rgba(220,38,38,0.35), rgba(185,28,28,0.25))',
                      color: '#fca5a5',
                      fontSize: '0.75rem',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {index + 1}
                  </td>

                  {/* Email ID */}
                  <td
                    className="py-3 px-3 font-medium text-left truncate max-w-[200px]"
                    style={{
                      borderRight: borderStyle,
                      background: 'linear-gradient(135deg, rgba(251,191,36,0.18), rgba(245,158,11,0.10))',
                      color: '#fde68a',
                      fontWeight: 500,
                    }}
                  >
                    {t.label}
                  </td>

                  {/* Gemini Time Limit */}
                  <td
                    onClick={() => setEditingTracker(t)}
                    title="Click to update Gemini status"
                    className="py-3 px-3 text-center font-semibold cursor-pointer transition-all"
                    style={{
                      borderRight: borderStyle,
                      background: isGeminiAvailable
                        ? 'linear-gradient(135deg, rgba(16,185,129,0.30), rgba(5,150,105,0.20))'
                        : 'linear-gradient(135deg, rgba(251,191,36,0.25), rgba(245,158,11,0.15))',
                      color: isGeminiAvailable ? '#6ee7b7' : '#fde68a',
                      fontSize: '0.72rem',
                    }}
                  >
                    {isGeminiAvailable ? '✦ Available' : formatLimitDateTime(t.gemini_reset_at)}
                  </td>

                  {/* Claude Time Limit */}
                  <td
                    onClick={() => setEditingTracker(t)}
                    title="Click to update Claude status"
                    className="py-3 px-3 text-center font-semibold cursor-pointer transition-all"
                    style={{
                      borderRight: borderStyle,
                      background: isClaudeAvailable
                        ? 'linear-gradient(135deg, rgba(16,185,129,0.30), rgba(5,150,105,0.20))'
                        : 'linear-gradient(135deg, rgba(251,191,36,0.25), rgba(245,158,11,0.15))',
                      color: isClaudeAvailable ? '#6ee7b7' : '#fde68a',
                      fontSize: '0.72rem',
                    }}
                  >
                    {isClaudeAvailable ? '✦ Available' : formatLimitDateTime(t.claude_reset_at)}
                  </td>

                  {/* Real Time Limit Of Gemini */}
                  <td
                    className="py-3 px-3 text-center font-bold"
                    style={{
                      borderRight: borderStyle,
                      background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.08))',
                      color: geminiRemaining.text === '-' ? 'rgba(255,255,255,0.3)' : '#fcd34d',
                      fontFamily: "'SF Mono', 'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
                      fontSize: '0.75rem',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {geminiRemaining.text}
                  </td>

                  {/* Real Time Limit Of Claude */}
                  <td
                    className="py-3 px-3 text-center font-bold"
                    style={{
                      borderRight: borderStyle,
                      background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.08))',
                      color: claudeRemaining.text === '-' ? 'rgba(255,255,255,0.3)' : '#fcd34d',
                      fontFamily: "'SF Mono', 'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
                      fontSize: '0.75rem',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {claudeRemaining.text}
                  </td>

                  {/* Edit */}
                  <td className="py-3 px-2 text-center">
                    <button
                      onClick={() => setEditingTracker(t)}
                      className="p-1.5 rounded-lg transition-all opacity-40 group-hover:opacity-100"
                      title="Edit this account"
                      style={{
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: 'rgba(255,255,255,0.9)',
                      }}
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="relative z-10 w-full max-w-6xl mt-4 flex flex-wrap items-center justify-between text-xs px-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
        <p>💡 Click any row or <Edit2 className="w-3 h-3 inline mx-0.5" /> to update Available / Limited times.</p>
        <p style={{ fontFamily: "'SF Mono', monospace" }}>Countdowns update every second</p>
      </div>

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

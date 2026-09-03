import { useState } from 'react'
import { X, Check, Clock, Trash2 } from 'lucide-react'
import type { LimitTracker, UpdateTracker } from '../types/tracker'
import { formatLimitDateTime } from '../utils/dateUtils'

interface EditRowModalProps {
  tracker: LimitTracker
  onUpdate: (id: string, data: UpdateTracker) => Promise<void> | void
  onDelete: (id: string) => Promise<void> | void
  onClose: () => void
}

function toDatetimeLocal(isoString: string | null | undefined): string {
  if (!isoString) return ''
  const d = new Date(isoString)
  if (isNaN(d.getTime())) return ''
  // Format for <input type="datetime-local"> YYYY-MM-DDTHH:mm
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function EditRowModal({
  tracker,
  onUpdate,
  onDelete,
  onClose,
}: EditRowModalProps) {
  const [label, setLabel] = useState(tracker.label)

  const [geminiStatus, setGeminiStatus] = useState<'available' | 'limited'>(tracker.gemini_status)
  const [geminiReset, setGeminiReset] = useState<string>(toDatetimeLocal(tracker.gemini_reset_at))

  const [claudeStatus, setClaudeStatus] = useState<'available' | 'limited'>(tracker.claude_status)
  const [claudeReset, setClaudeReset] = useState<string>(toDatetimeLocal(tracker.claude_reset_at))

  function applyQuickTime(service: 'gemini' | 'claude', hours: number) {
    const future = new Date(Date.now() + hours * 3600 * 1000)
    const pad = (n: number) => String(n).padStart(2, '0')
    const val = `${future.getFullYear()}-${pad(future.getMonth() + 1)}-${pad(future.getDate())}T${pad(future.getHours())}:${pad(future.getMinutes())}`

    if (service === 'gemini') {
      setGeminiStatus('limited')
      setGeminiReset(val)
    } else {
      setClaudeStatus('limited')
      setClaudeReset(val)
    }
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()

    const update: UpdateTracker = {
      label: label.trim(),
      gemini_status: geminiStatus,
      gemini_reset_at:
        geminiStatus === 'limited' && geminiReset
          ? new Date(geminiReset).toISOString()
          : null,
      claude_status: claudeStatus,
      claude_reset_at:
        claudeStatus === 'limited' && claudeReset
          ? new Date(claudeReset).toISOString()
          : null,
    }

    onUpdate(tracker.id, update)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-lg rounded-xl border border-gray-700 bg-gray-900 shadow-2xl p-6 text-gray-100">
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div>
            <h3 className="text-lg font-bold text-white">Edit Account Status</h3>
            <p className="text-xs text-gray-400">
              Update limit status and countdown timers
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-5 mt-4">
          {/* Email ID */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Email ID / Account Label
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-sky-500 focus:outline-none"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
            />
          </div>

          {/* Gemini Section */}
          <div className="rounded-lg border border-gray-800 bg-gray-800/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-sky-400">
                Gemini Time Limit
              </span>
              <span className="text-xs text-gray-400">
                Current: {geminiStatus === 'available' ? 'Available' : formatLimitDateTime(tracker.gemini_reset_at)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setGeminiStatus('available')
                  setGeminiReset('')
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  geminiStatus === 'available'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <Check className="w-4 h-4" />
                Available (Green)
              </button>

              <button
                type="button"
                onClick={() => {
                  setGeminiStatus('limited')
                  if (!geminiReset) applyQuickTime('gemini', 3)
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  geminiStatus === 'limited'
                    ? 'bg-yellow-500 text-black shadow font-black'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <Clock className="w-4 h-4" />
                Limited (Yellow Countdown)
              </button>
            </div>

            {geminiStatus === 'limited' && (
              <div className="space-y-2 pt-2 border-t border-gray-700/60">
                <label className="block text-xs text-gray-300">
                  Reset Date & Time:
                </label>
                <input
                  type="datetime-local"
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-1.5 text-xs text-white focus:border-sky-500 focus:outline-none"
                  value={geminiReset}
                  onChange={(e) => setGeminiReset(e.target.value)}
                  required
                />
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[11px] text-gray-400 mr-1 self-center">
                    Quick:
                  </span>
                  {[1, 3, 5, 12, 24, 48].map((hrs) => (
                    <button
                      key={hrs}
                      type="button"
                      onClick={() => applyQuickTime('gemini', hrs)}
                      className="px-2 py-0.5 rounded bg-gray-700 hover:bg-gray-600 text-[11px] text-gray-200"
                    >
                      +{hrs}h
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Claude Section */}
          <div className="rounded-lg border border-gray-800 bg-gray-800/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-violet-400">
                Cloaud / Claude Time Limit
              </span>
              <span className="text-xs text-gray-400">
                Current: {claudeStatus === 'available' ? 'Available' : formatLimitDateTime(tracker.claude_reset_at)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setClaudeStatus('available')
                  setClaudeReset('')
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  claudeStatus === 'available'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <Check className="w-4 h-4" />
                Available (Green)
              </button>

              <button
                type="button"
                onClick={() => {
                  setClaudeStatus('limited')
                  if (!claudeReset) applyQuickTime('claude', 3)
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  claudeStatus === 'limited'
                    ? 'bg-yellow-500 text-black shadow font-black'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <Clock className="w-4 h-4" />
                Limited (Yellow Countdown)
              </button>
            </div>

            {claudeStatus === 'limited' && (
              <div className="space-y-2 pt-2 border-t border-gray-700/60">
                <label className="block text-xs text-gray-300">
                  Reset Date & Time:
                </label>
                <input
                  type="datetime-local"
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-1.5 text-xs text-white focus:border-sky-500 focus:outline-none"
                  value={claudeReset}
                  onChange={(e) => setClaudeReset(e.target.value)}
                  required
                />
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[11px] text-gray-400 mr-1 self-center">
                    Quick:
                  </span>
                  {[1, 3, 5, 12, 24, 48].map((hrs) => (
                    <button
                      key={hrs}
                      type="button"
                      onClick={() => applyQuickTime('claude', hrs)}
                      className="px-2 py-0.5 rounded bg-gray-700 hover:bg-gray-600 text-[11px] text-gray-200"
                    >
                      +{hrs}h
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => {
                if (confirm(`Delete row for "${tracker.label}"?`)) {
                  onDelete(tracker.id)
                  onClose()
                }
              }}
              className="px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Row
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-gray-300 hover:bg-gray-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

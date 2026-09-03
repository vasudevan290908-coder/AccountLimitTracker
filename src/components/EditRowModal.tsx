import { useState } from 'react'
import { X, Check, Clock, Trash2, Clipboard, Sparkles } from 'lucide-react'
import type { LimitTracker, UpdateTracker } from '../types/tracker'
import { formatLimitDateTime, parsePastedDate, toDatetimeLocal } from '../utils/dateUtils'

interface EditRowModalProps {
  tracker: LimitTracker
  onUpdate: (id: string, data: UpdateTracker) => Promise<void> | void
  onDelete: (id: string) => Promise<void> | void
  onClose: () => void
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
  const [geminiPasteText, setGeminiPasteText] = useState('')
  const [geminiPasteFeedback, setGeminiPasteFeedback] = useState('')

  const [claudeStatus, setClaudeStatus] = useState<'available' | 'limited'>(tracker.claude_status)
  const [claudeReset, setClaudeReset] = useState<string>(toDatetimeLocal(tracker.claude_reset_at))
  const [claudePasteText, setClaudePasteText] = useState('')
  const [claudePasteFeedback, setClaudePasteFeedback] = useState('')

  function handlePasteInput(service: 'gemini' | 'claude', text: string) {
    if (service === 'gemini') {
      setGeminiPasteText(text)
      const parsed = parsePastedDate(text)
      if (parsed) {
        setGeminiReset(parsed)
        setGeminiStatus('limited')
        setGeminiPasteFeedback(`✓ Set: ${formatLimitDateTime(parsed)}`)
      } else if (text.trim()) {
        setGeminiPasteFeedback('⚠️ Unrecognized date/time')
      } else {
        setGeminiPasteFeedback('')
      }
    } else {
      setClaudePasteText(text)
      const parsed = parsePastedDate(text)
      if (parsed) {
        setClaudeReset(parsed)
        setClaudeStatus('limited')
        setClaudePasteFeedback(`✓ Set: ${formatLimitDateTime(parsed)}`)
      } else if (text.trim()) {
        setClaudePasteFeedback('⚠️ Unrecognized date/time')
      } else {
        setClaudePasteFeedback('')
      }
    }
  }

  async function handleClipboardPaste(service: 'gemini' | 'claude') {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        handlePasteInput(service, text)
      }
    } catch {
      // ignore
    }
  }

  function applyQuickTime(service: 'gemini' | 'claude', hours: number) {
    const future = new Date(Date.now() + hours * 3600 * 1000)
    const val = toDatetimeLocal(future)

    if (service === 'gemini') {
      setGeminiStatus('limited')
      setGeminiReset(val)
      setGeminiPasteText(`+${hours}h`)
      setGeminiPasteFeedback(`✓ Set: ${formatLimitDateTime(val)}`)
    } else {
      setClaudeStatus('limited')
      setClaudeReset(val)
      setClaudePasteText(`+${hours}h`)
      setClaudePasteFeedback(`✓ Set: ${formatLimitDateTime(val)}`)
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border border-black/10 bg-white shadow-2xl p-5 sm:p-6 text-black my-8"
        style={{
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', sans-serif",
        }}
      >
        <div className="flex items-center justify-between pb-3 border-b border-black/10">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-black">Edit Account Status</h3>
            <p className="text-xs text-neutral-500">
              Update limit status, paste timestamps, or set countdowns
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-black hover:bg-black/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 mt-4 text-xs sm:text-sm">
          {/* Email ID */}
          <div>
            <label className="block text-xs font-semibold text-black mb-1">
              Email ID / Account Label
            </label>
            <input
              type="text"
              className="w-full rounded-xl border border-black/15 bg-neutral-50 px-3 py-2 text-xs sm:text-sm text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
            />
          </div>

          {/* Gemini Section */}
          <div className="rounded-xl border border-black/10 bg-neutral-50/70 p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-black flex items-center gap-1.5">
                Gemini Time Limit
              </span>
              <span className="text-[11px] text-neutral-500">
                {geminiStatus === 'available' ? 'Available' : formatLimitDateTime(tracker.gemini_reset_at)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setGeminiStatus('available')
                  setGeminiReset('')
                  setGeminiPasteText('')
                  setGeminiPasteFeedback('')
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                  geminiStatus === 'available'
                    ? 'bg-black text-white border-black shadow'
                    : 'bg-white text-black border-black/15 hover:bg-neutral-100'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                Available
              </button>

              <button
                type="button"
                onClick={() => {
                  setGeminiStatus('limited')
                  if (!geminiReset) applyQuickTime('gemini', 3)
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                  geminiStatus === 'limited'
                    ? 'bg-black text-white border-black shadow'
                    : 'bg-white text-black border-black/15 hover:bg-neutral-100'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Limited (Countdown)
              </button>
            </div>

            {geminiStatus === 'limited' && (
              <div className="space-y-2 pt-2 border-t border-black/10">
                {/* Direct Paste Box */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-black flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-black" />
                      Paste Any Date / Time:
                    </label>
                    <button
                      type="button"
                      onClick={() => handleClipboardPaste('gemini')}
                      className="flex items-center gap-1 text-[11px] text-black font-semibold px-2 py-0.5 rounded bg-black/5 hover:bg-black/10 border border-black/10 transition-colors"
                    >
                      <Clipboard className="w-3 h-3" />
                      Paste Clipboard
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. 03-09-2026 08:08 PM, 8:08 PM, or 3h"
                    className="w-full rounded-xl border border-black/15 bg-white px-3 py-1.5 text-xs text-black placeholder-neutral-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                    value={geminiPasteText}
                    onChange={(e) => handlePasteInput('gemini', e.target.value)}
                    onPaste={(e) => {
                      const text = e.clipboardData.getData('text')
                      if (text) {
                        e.preventDefault()
                        handlePasteInput('gemini', text)
                      }
                    }}
                  />
                  {geminiPasteFeedback && (
                    <p className="text-[11px] mt-1 font-semibold text-black">
                      {geminiPasteFeedback}
                    </p>
                  )}
                </div>

                {/* Native Picker & Quick Buttons */}
                <div className="pt-1">
                  <label className="block text-[11px] text-neutral-600 mb-1">
                    Or select from Calendar:
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full rounded-xl border border-black/15 bg-white px-3 py-1.5 text-xs text-black focus:border-black focus:outline-none"
                    value={geminiReset}
                    onChange={(e) => {
                      setGeminiReset(e.target.value)
                      setGeminiPasteFeedback(`✓ Set: ${formatLimitDateTime(e.target.value)}`)
                    }}
                    required
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-neutral-500 mr-1">Quick:</span>
                  {[1, 2, 3, 5, 8, 12, 24, 48].map((hrs) => (
                    <button
                      key={hrs}
                      type="button"
                      onClick={() => applyQuickTime('gemini', hrs)}
                      className="px-2 py-0.5 rounded-lg border border-black/10 bg-white hover:bg-neutral-100 text-[11px] text-black font-medium transition-colors"
                    >
                      +{hrs}h
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Claude Section */}
          <div className="rounded-xl border border-black/10 bg-neutral-50/70 p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-black flex items-center gap-1.5">
                Cloaud / Claude Time Limit
              </span>
              <span className="text-[11px] text-neutral-500">
                {claudeStatus === 'available' ? 'Available' : formatLimitDateTime(tracker.claude_reset_at)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setClaudeStatus('available')
                  setClaudeReset('')
                  setClaudePasteText('')
                  setClaudePasteFeedback('')
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                  claudeStatus === 'available'
                    ? 'bg-black text-white border-black shadow'
                    : 'bg-white text-black border-black/15 hover:bg-neutral-100'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                Available
              </button>

              <button
                type="button"
                onClick={() => {
                  setClaudeStatus('limited')
                  if (!claudeReset) applyQuickTime('claude', 3)
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                  claudeStatus === 'limited'
                    ? 'bg-black text-white border-black shadow'
                    : 'bg-white text-black border-black/15 hover:bg-neutral-100'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Limited (Countdown)
              </button>
            </div>

            {claudeStatus === 'limited' && (
              <div className="space-y-2 pt-2 border-t border-black/10">
                {/* Direct Paste Box */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-black flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-black" />
                      Paste Any Date / Time:
                    </label>
                    <button
                      type="button"
                      onClick={() => handleClipboardPaste('claude')}
                      className="flex items-center gap-1 text-[11px] text-black font-semibold px-2 py-0.5 rounded bg-black/5 hover:bg-black/10 border border-black/10 transition-colors"
                    >
                      <Clipboard className="w-3 h-3" />
                      Paste Clipboard
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. 03-09-2026 08:08 PM, 8:08 PM, or 3h"
                    className="w-full rounded-xl border border-black/15 bg-white px-3 py-1.5 text-xs text-black placeholder-neutral-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                    value={claudePasteText}
                    onChange={(e) => handlePasteInput('claude', e.target.value)}
                    onPaste={(e) => {
                      const text = e.clipboardData.getData('text')
                      if (text) {
                        e.preventDefault()
                        handlePasteInput('claude', text)
                      }
                    }}
                  />
                  {claudePasteFeedback && (
                    <p className="text-[11px] mt-1 font-semibold text-black">
                      {claudePasteFeedback}
                    </p>
                  )}
                </div>

                {/* Native Picker & Quick Buttons */}
                <div className="pt-1">
                  <label className="block text-[11px] text-neutral-600 mb-1">
                    Or select from Calendar:
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full rounded-xl border border-black/15 bg-white px-3 py-1.5 text-xs text-black focus:border-black focus:outline-none"
                    value={claudeReset}
                    onChange={(e) => {
                      setClaudeReset(e.target.value)
                      setClaudePasteFeedback(`✓ Set: ${formatLimitDateTime(e.target.value)}`)
                    }}
                    required
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-neutral-500 mr-1">Quick:</span>
                  {[1, 2, 3, 5, 8, 12, 24, 48].map((hrs) => (
                    <button
                      key={hrs}
                      type="button"
                      onClick={() => applyQuickTime('claude', hrs)}
                      className="px-2 py-0.5 rounded-lg border border-black/10 bg-white hover:bg-neutral-100 text-[11px] text-black font-medium transition-colors"
                    >
                      +{hrs}h
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-black/10">
            <button
              type="button"
              onClick={() => {
                if (confirm(`Delete row for "${tracker.label}"?`)) {
                  onDelete(tracker.id)
                  onClose()
                }
              }}
              className="px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-1.5 transition-colors border border-red-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Row
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-black hover:bg-neutral-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-black hover:bg-neutral-800 rounded-xl shadow transition-all"
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

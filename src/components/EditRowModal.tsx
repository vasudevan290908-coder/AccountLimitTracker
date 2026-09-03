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
        setGeminiPasteFeedback('⚠️ Unrecognized format')
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
        setClaudePasteFeedback('⚠️ Unrecognized format')
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[3px] p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl p-5 sm:p-6 text-[#f1f5f9] my-8 shadow-2xl"
        style={{
          background: 'rgba(4, 6, 14, 0.22)',
          backdropFilter: 'blur(16px) saturate(140%)',
          WebkitBackdropFilter: 'blur(16px) saturate(140%)',
          border: '1px solid rgba(255, 255, 255, 0.07)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', sans-serif",
        }}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div>
            <h3 className="text-base font-semibold text-[#f1f5f9]">Edit Account Status</h3>
            <p className="text-xs text-[#94a3b8]">
              Update limit status, paste timestamps, or set countdowns
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 mt-4 text-xs sm:text-sm">
          {/* Email ID */}
          <div>
            <label className="block text-xs font-medium text-[#cbd5e1] mb-1">
              Email ID / Account Label
            </label>
            <input
              type="text"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs sm:text-sm text-[#f1f5f9] focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
            />
          </div>

          {/* Gemini Section */}
          <div className="rounded-xl border border-white/[0.05] bg-white/[0.015] p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-[#f1f5f9] flex items-center gap-1.5">
                Gemini Time Limit
              </span>
              <span className="text-[11px] text-[#94a3b8]">
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
                className={`py-2 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 border ${
                  geminiStatus === 'available'
                    ? 'bg-white/10 text-[#f1f5f9] border-white/20 shadow-sm'
                    : 'bg-white/[0.02] text-[#94a3b8] border-white/[0.05] hover:bg-white/[0.05]'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                Available
              </button>

              <button
                type="button"
                onClick={() => {
                  setGeminiStatus('limited')
                }}
                className={`py-2 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 border ${
                  geminiStatus === 'limited'
                    ? 'bg-white/10 text-[#f1f5f9] border-white/20 shadow-sm'
                    : 'bg-white/[0.02] text-[#94a3b8] border-white/[0.05] hover:bg-white/[0.05]'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Limited
              </button>
            </div>

            {geminiStatus === 'limited' && (
              <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                {/* Direct Paste Box */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-medium text-[#cbd5e1] flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#f1f5f9]" />
                      Paste Any Date / Time:
                    </label>
                    <button
                      type="button"
                      onClick={() => handleClipboardPaste('gemini')}
                      className="flex items-center gap-1 text-[11px] text-[#f1f5f9] font-medium px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 transition-colors"
                    >
                      <Clipboard className="w-3 h-3" />
                      Paste Clipboard
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. 03-09-2026 08:08 PM, 8:08 PM, or 3h"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs text-[#f1f5f9] placeholder-[#64748b] focus:border-white/30 focus:outline-none"
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
                    <p className="text-[11px] mt-1 font-medium text-[#cbd5e1]">
                      {geminiPasteFeedback}
                    </p>
                  )}
                </div>

                {/* Native Picker */}
                <div className="pt-1">
                  <label className="block text-[11px] text-[#94a3b8] mb-1">
                    Calendar Selector:
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs text-[#f1f5f9] focus:border-white/30 focus:outline-none"
                    value={geminiReset}
                    onChange={(e) => {
                      setGeminiReset(e.target.value)
                      setGeminiPasteFeedback(`✓ Set: ${formatLimitDateTime(e.target.value)}`)
                    }}
                    required
                  />
                </div>
              </div>
            )}
          </div>

          {/* Claude Section */}
          <div className="rounded-xl border border-white/[0.05] bg-white/[0.015] p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-[#f1f5f9] flex items-center gap-1.5">
                Cloaud / Claude Time Limit
              </span>
              <span className="text-[11px] text-[#94a3b8]">
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
                className={`py-2 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 border ${
                  claudeStatus === 'available'
                    ? 'bg-white/10 text-[#f1f5f9] border-white/20 shadow-sm'
                    : 'bg-white/[0.02] text-[#94a3b8] border-white/[0.05] hover:bg-white/[0.05]'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                Available
              </button>

              <button
                type="button"
                onClick={() => {
                  setClaudeStatus('limited')
                }}
                className={`py-2 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 border ${
                  claudeStatus === 'limited'
                    ? 'bg-white/10 text-[#f1f5f9] border-white/20 shadow-sm'
                    : 'bg-white/[0.02] text-[#94a3b8] border-white/[0.05] hover:bg-white/[0.05]'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Limited
              </button>
            </div>

            {claudeStatus === 'limited' && (
              <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                {/* Direct Paste Box */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-medium text-[#cbd5e1] flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#f1f5f9]" />
                      Paste Any Date / Time:
                    </label>
                    <button
                      type="button"
                      onClick={() => handleClipboardPaste('claude')}
                      className="flex items-center gap-1 text-[11px] text-[#f1f5f9] font-medium px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 transition-colors"
                    >
                      <Clipboard className="w-3 h-3" />
                      Paste Clipboard
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. 03-09-2026 08:08 PM, 8:08 PM, or 3h"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs text-[#f1f5f9] placeholder-[#64748b] focus:border-white/30 focus:outline-none"
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
                    <p className="text-[11px] mt-1 font-medium text-[#cbd5e1]">
                      {claudePasteFeedback}
                    </p>
                  )}
                </div>

                {/* Native Picker */}
                <div className="pt-1">
                  <label className="block text-[11px] text-[#94a3b8] mb-1">
                    Calendar Selector:
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs text-[#f1f5f9] focus:border-white/30 focus:outline-none"
                    value={claudeReset}
                    onChange={(e) => {
                      setClaudeReset(e.target.value)
                      setClaudePasteFeedback(`✓ Set: ${formatLimitDateTime(e.target.value)}`)
                    }}
                    required
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={() => {
                if (confirm(`Delete row for "${tracker.label}"?`)) {
                  onDelete(tracker.id)
                  onClose()
                }
              }}
              className="px-3 py-2 text-xs font-medium text-[#fca5a5] hover:bg-red-500/15 rounded-xl flex items-center gap-1.5 transition-colors border border-red-500/20"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Row
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-white/10 rounded-xl transition-colors border border-white/[0.05]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-medium text-[#0b0f19] bg-[#e2e8f0] hover:bg-[#f1f5f9] rounded-xl shadow-lg transition-all font-semibold"
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

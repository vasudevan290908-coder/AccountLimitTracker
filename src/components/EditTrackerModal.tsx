import { useState } from 'react'
import { X, CheckCircle2, Ban } from 'lucide-react'
import { format } from 'date-fns'
import type { LimitTracker, UpdateTracker, Service } from '../types/tracker'
import toast from 'react-hot-toast'

interface EditTrackerModalProps {
  tracker: LimitTracker
  onUpdate: (id: string, data: UpdateTracker) => Promise<void>
  onClose: () => void
}

function localDatetimeValue(isoString: string | null): string {
  if (!isoString) return ''
  // Convert UTC ISO string to local datetime-local input value
  const d = new Date(isoString)
  return format(d, "yyyy-MM-dd'T'HH:mm")
}

function toIso(localValue: string): string {
  // datetime-local gives "2024-01-15T14:30" — parse as local time
  return new Date(localValue).toISOString()
}

export default function EditTrackerModal({ tracker, onUpdate, onClose }: EditTrackerModalProps) {
  const [label, setLabel] = useState(tracker.label)
  const [notes, setNotes] = useState(tracker.notes ?? '')

  // Gemini
  const [geminiStatus, setGeminiStatus] = useState(tracker.gemini_status)
  const [geminiReset, setGeminiReset] = useState(localDatetimeValue(tracker.gemini_reset_at))

  // Claude
  const [claudeStatus, setClaudeStatus] = useState(tracker.claude_status)
  const [claudeReset, setClaudeReset] = useState(localDatetimeValue(tracker.claude_reset_at))

  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const payload: UpdateTracker = {
        label: label.trim(),
        notes: notes.trim() || null,
        gemini_status: geminiStatus,
        gemini_reset_at: geminiStatus === 'limited' && geminiReset ? toIso(geminiReset) : null,
        claude_status: claudeStatus,
        claude_reset_at: claudeStatus === 'limited' && claudeReset ? toIso(claudeReset) : null,
      }
      await onUpdate(tracker.id, payload)
      toast.success('Updated!')
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">Edit Tracker</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-200 hover:bg-gray-800"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Label / Notes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Label *</label>
              <input
                type="text"
                className="input"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                required
                maxLength={100}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Notes</label>
              <input
                type="text"
                className="input"
                placeholder="optional"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={200}
              />
            </div>
          </div>

          {/* Gemini */}
          <ServiceSection
            service="gemini"
            status={geminiStatus}
            resetValue={geminiReset}
            onStatusChange={setGeminiStatus}
            onResetChange={setGeminiReset}
          />

          {/* Claude */}
          <ServiceSection
            service="claude"
            status={claudeStatus}
            resetValue={claudeReset}
            onStatusChange={setClaudeStatus}
            onResetChange={setClaudeReset}
          />

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Saving…
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Service sub-section ───────────────────────────────────────

interface ServiceSectionProps {
  service: Service
  status: 'available' | 'limited'
  resetValue: string
  onStatusChange: (s: 'available' | 'limited') => void
  onResetChange: (v: string) => void
}

const SERVICE_LABELS: Record<Service, string> = {
  gemini: 'Gemini',
  claude: 'Claude',
}

function ServiceSection({
  service,
  status,
  resetValue,
  onStatusChange,
  onResetChange,
}: ServiceSectionProps) {
  const label = SERVICE_LABELS[service]

  return (
    <div className="rounded-lg border border-gray-700 p-4 space-y-3">
      <div className="text-sm font-medium text-gray-300">{label}</div>

      {/* Toggle buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onStatusChange('available')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all
            ${status === 'available'
              ? 'border-emerald-600 bg-emerald-900/30 text-emerald-300'
              : 'border-gray-700 bg-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300'
            }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Available
        </button>
        <button
          type="button"
          onClick={() => onStatusChange('limited')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all
            ${status === 'limited'
              ? 'border-red-600 bg-red-900/30 text-red-300'
              : 'border-gray-700 bg-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300'
            }`}
        >
          <Ban className="w-4 h-4" />
          Limited
        </button>
      </div>

      {/* Reset time picker — only shown when limited */}
      {status === 'limited' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">
            Reset time <span className="text-gray-600">(optional — leave blank if unknown)</span>
          </label>
          <input
            type="datetime-local"
            className="input text-sm"
            value={resetValue}
            onChange={(e) => onResetChange(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
          />
        </div>
      )}
    </div>
  )
}

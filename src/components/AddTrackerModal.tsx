import { useState } from 'react'
import { X } from 'lucide-react'
import type { NewTracker } from '../types/tracker'
import toast from 'react-hot-toast'

interface AddTrackerModalProps {
  onAdd: (data: NewTracker) => Promise<void>
  onClose: () => void
  nextSortOrder: number
}

export default function AddTrackerModal({ onAdd, onClose, nextSortOrder }: AddTrackerModalProps) {
  const [label, setLabel] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!label.trim()) return

    setLoading(true)
    try {
      await onAdd({ label: label.trim(), notes: notes.trim() || null, sort_order: nextSortOrder })
      toast.success(`"${label.trim()}" added!`)
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add tracker')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">Add Account Tracker</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-200 hover:bg-gray-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5" htmlFor="add-label">
              Account label <span className="text-red-400">*</span>
            </label>
            <input
              id="add-label"
              type="text"
              className="input"
              placeholder="e.g. Personal Gmail, Work Account…"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
              autoFocus
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5" htmlFor="add-notes">
              Notes <span className="text-gray-600">(optional)</span>
            </label>
            <input
              id="add-notes"
              type="text"
              className="input"
              placeholder="e.g. Pro plan, +91 number…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={200}
            />
          </div>

          <p className="text-xs text-gray-500">
            Both Gemini and Claude will start as <span className="text-emerald-400">Available</span>.
            Use Edit to mark as limited later.
          </p>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading || !label.trim()} className="btn-primary flex-1">
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Adding…
                </>
              ) : (
                'Add Tracker'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

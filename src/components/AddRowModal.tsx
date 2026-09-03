import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import type { NewTracker } from '../types/tracker'

interface AddRowModalProps {
  onAdd: (data: NewTracker) => Promise<void> | void
  onClose: () => void
}

export default function AddRowModal({ onAdd, onClose }: AddRowModalProps) {
  const [label, setLabel] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!label.trim()) return

    onAdd({
      label: label.trim(),
      gemini_status: 'available',
      gemini_reset_at: null,
      claude_status: 'available',
      claude_reset_at: null,
    })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-sm rounded-xl border border-gray-700 bg-gray-900 shadow-2xl p-5 text-gray-100">
        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
          <h3 className="text-base font-bold text-white">Add New Email Account</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Email ID
            </label>
            <input
              type="text"
              placeholder="e.g. vasudevan123"
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-sky-500 focus:outline-none"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
              autoFocus
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Will start with both Gemini and Claude as Available.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-lg flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Row
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

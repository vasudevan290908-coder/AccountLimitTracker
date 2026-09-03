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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl border border-white/15 bg-slate-900/95 shadow-2xl p-5 text-slate-100"
        style={{
          backdropFilter: 'blur(40px)',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', sans-serif",
        }}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 className="text-base font-bold text-white">Add New Email Account</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1">
              Email ID
            </label>
            <input
              type="text"
              placeholder="e.g. vasudevan123@gmail.com"
              className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs sm:text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
              autoFocus
            />
            <p className="text-[11px] text-white/40 mt-1">
              Will start with both Gemini and Claude as Available.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl flex items-center gap-1.5 shadow-lg transition-all"
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

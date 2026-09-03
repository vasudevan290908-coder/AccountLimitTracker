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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[3px] p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl p-5 sm:p-6 text-[#f1f5f9] shadow-2xl"
        style={{
          background: 'rgba(4, 6, 14, 0.22)',
          backdropFilter: 'blur(16px) saturate(140%)',
          WebkitBackdropFilter: 'blur(16px) saturate(140%)',
          border: '1px solid rgba(255, 255, 255, 0.07)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', sans-serif",
        }}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.05]">
          <h3 className="text-base font-semibold text-[#f1f5f9]">Add New Email Account</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-medium text-[#cbd5e1] mb-1">
              Email ID
            </label>
            <input
              type="text"
              placeholder="e.g. vasudevan123@gmail.com"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs sm:text-sm text-[#f1f5f9] placeholder-[#64748b] focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
              autoFocus
            />
            <p className="text-[11px] text-[#94a3b8] mt-1.5">
              Will start with both Gemini and Claude as Available.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-white/10 rounded-xl transition-colors border border-white/[0.05]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-[#0b0f19] bg-[#e2e8f0] hover:bg-[#f1f5f9] rounded-xl flex items-center gap-1.5 shadow-lg transition-all"
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

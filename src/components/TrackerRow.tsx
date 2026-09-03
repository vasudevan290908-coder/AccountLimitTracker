import { useState, useCallback } from 'react'
import { MoreVertical, Trash2, Edit3 } from 'lucide-react'
import type { LimitTracker, UpdateTracker } from '../types/tracker'
import StatusBadge from './StatusBadge'
import CountdownTimer from './CountdownTimer'
import EditTrackerModal from './EditTrackerModal'

interface TrackerRowProps {
  tracker: LimitTracker
  onUpdate: (id: string, data: UpdateTracker) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export default function TrackerRow({ tracker, onUpdate, onDelete }: TrackerRowProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Delete "${tracker.label}"?`)) return
    setDeleting(true)
    setMenuOpen(false)
    try {
      await onDelete(tracker.id)
    } finally {
      setDeleting(false)
    }
  }

  const handleGeminiExpire = useCallback(() => {
    onUpdate(tracker.id, { gemini_status: 'available', gemini_reset_at: null })
  }, [tracker.id, onUpdate])

  const handleClaudeExpire = useCallback(() => {
    onUpdate(tracker.id, { claude_status: 'available', claude_reset_at: null })
  }, [tracker.id, onUpdate])

  return (
    <>
      <tr className="border-b border-gray-800 hover:bg-gray-800/40 transition-colors group">
        {/* Label */}
        <td className="py-3 px-4">
          <div className="font-medium text-white text-sm">{tracker.label}</div>
          {tracker.notes && (
            <div className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{tracker.notes}</div>
          )}
        </td>

        {/* Gemini Status */}
        <td className="py-3 px-4">
          <StatusBadge status={tracker.gemini_status} />
        </td>

        {/* Gemini Countdown */}
        <td className="py-3 px-4">
          <CountdownTimer
            status={tracker.gemini_status}
            resetAt={tracker.gemini_reset_at}
            onExpire={handleGeminiExpire}
          />
        </td>

        {/* Claude Status */}
        <td className="py-3 px-4">
          <StatusBadge status={tracker.claude_status} />
        </td>

        {/* Claude Countdown */}
        <td className="py-3 px-4">
          <CountdownTimer
            status={tracker.claude_status}
            resetAt={tracker.claude_reset_at}
            onExpire={handleClaudeExpire}
          />
        </td>

        {/* Actions */}
        <td className="py-3 px-4 text-right">
          <div className="relative inline-block">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 rounded-lg text-gray-500 hover:text-gray-200 hover:bg-gray-700 transition-all"
              aria-label="Row actions"
            >
              {deleting ? (
                <span className="w-4 h-4 block rounded-full border-2 border-gray-500 border-t-white animate-spin" />
              ) : (
                <MoreVertical className="w-4 h-4" />
              )}
            </button>

            {menuOpen && (
              <>
                {/* Click-outside overlay */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-8 z-20 w-40 rounded-lg border border-gray-700 bg-gray-800 shadow-xl py-1">
                  <button
                    onClick={() => { setEditOpen(true); setMenuOpen(false) }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit / Update
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </td>
      </tr>

      {editOpen && (
        <EditTrackerModal
          tracker={tracker}
          onUpdate={onUpdate}
          onClose={() => setEditOpen(false)}
        />
      )}
    </>
  )
}

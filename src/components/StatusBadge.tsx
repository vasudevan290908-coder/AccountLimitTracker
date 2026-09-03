import { Clock, Ban } from 'lucide-react'
import type { ServiceStatus } from '../types/tracker'

interface StatusBadgeProps {
  status: ServiceStatus
  size?: 'sm' | 'md'
}

const CONFIG = {
  available: {
    label: 'Available',
    classes: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50',
    dot: 'bg-emerald-400',
  },
  limited: {
    label: 'Limited',
    classes: 'bg-red-900/40 text-red-300 border-red-700/50',
    dot: 'bg-red-400',
  },
} as const

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const { label, classes, dot } = CONFIG[status]
  const isSmall = size === 'sm'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium
        ${isSmall ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'}
        ${classes}`}
    >
      <span className={`rounded-full ${dot} ${isSmall ? 'w-1.5 h-1.5' : 'w-2 h-2'} shrink-0`} />
      {label}
    </span>
  )
}

/** A compact icon-only indicator used in narrow columns */
export function StatusIcon({ status }: { status: ServiceStatus }) {
  if (status === 'available') {
    return <Clock className="w-4 h-4 text-emerald-400" />
  }
  return <Ban className="w-4 h-4 text-red-400" />
}

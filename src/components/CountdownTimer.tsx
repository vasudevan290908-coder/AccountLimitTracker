import { useEffect, useRef, useState } from 'react'
import type { CountdownState } from '../types/tracker'

function computeCountdown(resetAt: string | null, status: 'available' | 'limited'): CountdownState {
  if (status === 'available') {
    return { label: 'Available', urgency: 'none', expired: false }
  }

  if (!resetAt) {
    return { label: 'Limited', urgency: 'critical', expired: false }
  }

  const diffMs = new Date(resetAt).getTime() - Date.now()

  if (diffMs <= 0) {
    return { label: 'Expired', urgency: 'none', expired: true }
  }

  const totalSec = Math.floor(diffMs / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60

  const label =
    h > 0
      ? `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`
      : m > 0
      ? `${m}m ${String(s).padStart(2, '0')}s`
      : `${s}s`

  const urgency = h === 0 && m < 60 ? (m < 5 ? 'critical' : 'warning') : 'warning'

  return { label, urgency, expired: false }
}

interface CountdownTimerProps {
  status: 'available' | 'limited'
  resetAt: string | null
  /** Called when countdown reaches zero so parent can flip status to available */
  onExpire?: () => void
  className?: string
}

const URGENCY_CLASSES: Record<CountdownState['urgency'], string> = {
  none: 'text-emerald-400',
  warning: 'text-yellow-400',
  critical: 'text-red-400',
}

export default function CountdownTimer({
  status,
  resetAt,
  onExpire,
  className = '',
}: CountdownTimerProps) {
  const [countdown, setCountdown] = useState<CountdownState>(() =>
    computeCountdown(resetAt, status)
  )
  const expireFiredRef = useRef(false)

  useEffect(() => {
    expireFiredRef.current = false
    // Recompute immediately when props change
    setCountdown(computeCountdown(resetAt, status))

    if (status !== 'limited' || !resetAt) return

    const interval = setInterval(() => {
      const next = computeCountdown(resetAt, status)
      setCountdown(next)

      if (next.expired && !expireFiredRef.current) {
        expireFiredRef.current = true
        onExpire?.()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [resetAt, status, onExpire])

  return (
    <span
      className={`font-mono text-sm font-semibold tabular-nums ${URGENCY_CLASSES[countdown.urgency]} ${className}`}
    >
      {countdown.label}
    </span>
  )
}

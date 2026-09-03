import { format } from 'date-fns'

/** Formats an ISO string to "dd-MM-yyyy hh:mm:ss a" (e.g. "07-09-2026 02:30:00 am") */
export function formatLimitDateTime(isoString: string | null | undefined): string {
  if (!isoString) return 'Available'
  try {
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return 'Available'
    const formatted = format(d, 'dd-MM-yyyy hh:mm:ss a')
    // Ensure lowercase am/pm as in screenshot
    return formatted.replace(/\s(AM|PM)$/, (_, m) => ' ' + m.toLowerCase())
  } catch {
    return 'Available'
  }
}

/** Calculates real-time remaining countdown or returns '-' if available/expired */
export function calculateRemainingTime(
  status: 'available' | 'limited',
  resetAt: string | null | undefined,
  nowMs: number
): { text: string; isExpired: boolean } {
  if (status === 'available' || !resetAt) {
    return { text: '-', isExpired: false }
  }

  const target = new Date(resetAt).getTime()
  if (isNaN(target)) {
    return { text: '-', isExpired: false }
  }

  const diffMs = target - nowMs
  if (diffMs <= 0) {
    return { text: '-', isExpired: true }
  }

  const totalSec = Math.floor(diffMs / 1000)
  const d = Math.floor(totalSec / 86400)
  const h = Math.floor((totalSec % 86400) / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60

  const pad = (n: number) => String(n).padStart(2, '0')

  if (d > 0) {
    return {
      text: `${d}d ${pad(h)}h ${pad(m)}m ${pad(s)}s`,
      isExpired: false,
    }
  }

  return {
    text: `${pad(h)}h ${pad(m)}m ${pad(s)}s`,
    isExpired: false,
  }
}

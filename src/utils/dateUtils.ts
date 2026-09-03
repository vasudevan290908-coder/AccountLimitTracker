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

/** Converts ISO string or Date to HTML datetime-local format: YYYY-MM-DDTHH:mm */
export function toDatetimeLocal(isoOrDate: string | Date | null | undefined): string {
  if (!isoOrDate) return ''
  const d = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate
  if (isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/**
 * Smart date/time parser: Parses pasted text in virtually any format:
 * - "03-09-2026 08:08 PM" or "03/09/2026 08:08:00 PM" (DD-MM-YYYY HH:mm)
 * - "08:08 PM" or "20:08" (Time only -> today/tomorrow)
 * - "Sep 3, 2026 8:08 PM", "September 3 20:08"
 * - "3h", "3 hours", "45m", "45 minutes", "in 2 hours"
 * - "tomorrow at 8pm"
 * Returns string in "YYYY-MM-DDTHH:mm" format, or null if unparseable
 */
export function parsePastedDate(rawText: string): string | null {
  if (!rawText || !rawText.trim()) return null
  const str = rawText.trim()
  const now = new Date()

  // 1. Relative duration e.g. "3h", "3 hours", "45m", "in 2 hours", "1d"
  const relHoursMatch = str.match(/^(?:in\s+)?(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hours?)$/i)
  if (relHoursMatch) {
    const hours = parseFloat(relHoursMatch[1])
    return toDatetimeLocal(new Date(now.getTime() + hours * 3600 * 1000))
  }

  const relMinutesMatch = str.match(/^(?:in\s+)?(\d+)\s*(?:m|min|mins|minutes?)$/i)
  if (relMinutesMatch) {
    const mins = parseInt(relMinutesMatch[1], 10)
    return toDatetimeLocal(new Date(now.getTime() + mins * 60 * 1000))
  }

  const relDaysMatch = str.match(/^(?:in\s+)?(\d+)\s*(?:d|days?)$/i)
  if (relDaysMatch) {
    const days = parseInt(relDaysMatch[1], 10)
    return toDatetimeLocal(new Date(now.getTime() + days * 86400 * 1000))
  }

  // 2. "DD-MM-YYYY hh:mm(:ss)? (AM|PM)?" or "DD/MM/YYYY hh:mm(:ss)? (AM|PM)?"
  // e.g. "03-09-2026 08:08 PM" or "03-09-2026 20:08"
  const dmyMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?)?$/i)
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10)
    const month = parseInt(dmyMatch[2], 10) - 1
    const year = parseInt(dmyMatch[3], 10)
    let hours = dmyMatch[4] ? parseInt(dmyMatch[4], 10) : 0
    const mins = dmyMatch[5] ? parseInt(dmyMatch[5], 10) : 0
    const mer = dmyMatch[7]?.toLowerCase()

    if (mer === 'pm' && hours < 12) hours += 12
    if (mer === 'am' && hours === 12) hours = 0

    const target = new Date(year, month, day, hours, mins, 0)
    if (!isNaN(target.getTime())) {
      return toDatetimeLocal(target)
    }
  }

  // 3. "YYYY-MM-DD hh:mm(:ss)? (AM|PM)?"
  const ymdMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:\s+[T\s]?(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?)?$/i)
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10)
    const month = parseInt(ymdMatch[2], 10) - 1
    const day = parseInt(ymdMatch[3], 10)
    let hours = ymdMatch[4] ? parseInt(ymdMatch[4], 10) : 0
    const mins = ymdMatch[5] ? parseInt(ymdMatch[5], 10) : 0
    const mer = ymdMatch[7]?.toLowerCase()

    if (mer === 'pm' && hours < 12) hours += 12
    if (mer === 'am' && hours === 12) hours = 0

    const target = new Date(year, month, day, hours, mins, 0)
    if (!isNaN(target.getTime())) {
      return toDatetimeLocal(target)
    }
  }

  // 4. Time only: "08:08 PM", "8:08 PM", "20:08", "8:08:00 AM"
  const timeOnlyMatch = str.match(/^(?:at\s+)?(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?$/i)
  if (timeOnlyMatch) {
    let hours = parseInt(timeOnlyMatch[1], 10)
    const mins = parseInt(timeOnlyMatch[2], 10)
    const mer = timeOnlyMatch[4]?.toLowerCase()

    if (mer === 'pm' && hours < 12) hours += 12
    if (mer === 'am' && hours === 12) hours = 0

    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, mins, 0)
    // If time is already past for today, advance to tomorrow
    if (target.getTime() <= now.getTime()) {
      target.setDate(target.getDate() + 1)
    }
    return toDatetimeLocal(target)
  }

  // 5. Native JS Date parse fallback (e.g. "Sep 3, 2026 8:08 PM" or "Tomorrow at 5pm")
  const parsed = new Date(str)
  if (!isNaN(parsed.getTime())) {
    return toDatetimeLocal(parsed)
  }

  return null
}


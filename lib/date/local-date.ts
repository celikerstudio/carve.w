const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const DAY_MS = 24 * 60 * 60 * 1000

function formatLocalDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatDateInTimeZone(date: Date, timeZone?: string): string {
  if (!timeZone) return formatLocalDate(date)

  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(date)

    const year = parts.find((part) => part.type === 'year')?.value
    const month = parts.find((part) => part.type === 'month')?.value
    const day = parts.find((part) => part.type === 'day')?.value

    if (!year || !month || !day) return formatLocalDate(date)
    return `${year}-${month}-${day}`
  } catch {
    return formatLocalDate(date)
  }
}

export function normalizeDateString(value: string, timeZone?: string): string {
  if (DATE_ONLY_PATTERN.test(value)) return value
  return formatDateInTimeZone(new Date(value), timeZone)
}

export function parseDateString(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function shiftDateString(value: string, days: number): string {
  const date = parseDateString(value)
  date.setDate(date.getDate() + days)
  return formatLocalDate(date)
}

export function getMondayDateString(value: string): string {
  const date = parseDateString(value)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  return formatLocalDate(date)
}

export function differenceInDateStrings(later: string, earlier: string): number {
  const laterDate = parseDateString(later)
  const earlierDate = parseDateString(earlier)
  return Math.floor((laterDate.getTime() - earlierDate.getTime()) / DAY_MS)
}

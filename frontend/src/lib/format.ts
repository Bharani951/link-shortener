// One formatter for the whole app, so every date looks the same: "16 Nov 2026, 4:17 pm".
const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' })

export function formatDate(iso: string | null, fallback = '—'): string {
  return iso ? dateFormat.format(new Date(iso)) : fallback
}

// Shorter version for table cells: "16 Nov 2026".
const dayFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' })

export function formatDay(iso: string | null, fallback = '—'): string {
  return iso ? dayFormat.format(new Date(iso)) : fallback
}

// True if the date is in the future but less than 24 hours away.
export function isWithinADay(iso: string | null): boolean {
  if (!iso) return false
  const msLeft = new Date(iso).getTime() - Date.now()
  return msLeft > 0 && msLeft < 24 * 60 * 60 * 1000
}

// "https://www.example.com/some/long/path" → "example.com/some/long/path"
export function prettyUrl(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/^www\./, '')
}

// "in 5 h" for a date less than a day away ("in < 1 h" for the last hour).
export function hoursLeft(iso: string): string {
  const hours = Math.floor((new Date(iso).getTime() - Date.now()) / (60 * 60 * 1000))
  return hours < 1 ? 'in < 1 h' : `in ${hours} h`
}
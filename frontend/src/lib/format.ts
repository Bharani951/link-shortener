export function formatDate(iso: string | null, fallback = '—'): string {
  return iso ? new Date(iso).toLocaleString() : fallback
}
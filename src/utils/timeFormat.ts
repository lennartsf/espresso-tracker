export function secondsToMMSS(s: number): string {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export function MMSSToSeconds(input: string): number | null {
  const trimmed = input.trim()
  if (!trimmed) return null
  if (/^\d+$/.test(trimmed)) {
    const n = parseInt(trimmed, 10)
    return isNaN(n) ? null : n
  }
  const match = trimmed.match(/^(\d{1,2}):(\d{2})$/)
  if (!match) return null
  return parseInt(match[1], 10) * 60 + parseInt(match[2], 10)
}

export function normalizeTimeInput(input: string): string {
  if (!input.trim()) return ''
  const seconds = MMSSToSeconds(input)
  if (seconds === null) return input
  return secondsToMMSS(seconds)
}

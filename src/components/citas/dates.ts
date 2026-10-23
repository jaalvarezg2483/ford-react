const DAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

export function parseCitaDate(value: string | undefined | null): Date | null {
  if (!value) return null
  const m = /^(\d{4}-\d{2}-\d{2})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([ap]m)?/i.exec(value.trim())
  if (m) {
    let h = Number(m[2])
    const ampm = m[5]?.toLowerCase()
    if (ampm === 'pm' && h < 12) h += 12
    if (ampm === 'am' && h === 12) h = 0
    return new Date(`${m[1]}T${String(h).padStart(2, '0')}:${m[3]}:${m[4] ?? '00'}`)
  }
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

function cap(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

export function formatFullDate(value: string | Date | undefined | null) {
  const d = value instanceof Date ? value : parseCitaDate(String(value || ''))
  if (!d) return ''
  return cap(`${DAYS[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`)
}

export function formatHour(value: string | Date | undefined | null) {
  const d = value instanceof Date ? value : parseCitaDate(String(value || ''))
  if (!d) return ''
  let h = d.getHours()
  const suffix = h >= 12 ? 'pm' : 'am'
  const hour12 = h % 12 || 12
  return `${String(hour12).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} ${suffix}`
}

export function formatDayName(d: Date) {
  return cap(`${DAYS[d.getDay()]} ${d.getDate()} de ${MONTHS[d.getMonth()]}`)
}

export function modelLabel(modelo: string) {
  return String(modelo || '').replace(/,/g, ' ').replace(/-/g, ' ')
}

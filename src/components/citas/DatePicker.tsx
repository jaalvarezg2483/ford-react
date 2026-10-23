import { useMemo } from 'react'

const DAYS_SHORT = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM']
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

type Props = {
  minDate?: Date
  maxDate?: Date
  value: Date | null
  onPick: (date: Date) => void
  month: Date
  onMonth: (date: Date) => void
}

export function DatePicker({ minDate, maxDate, value, onPick, month, onMonth }: Props) {
  const cells = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1)
    const startOffset = (first.getDay() + 6) % 7
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
    const min = minDate ? startOfDay(minDate) : null
    const max = maxDate ? startOfDay(maxDate) : null
    const picked = value ? ymd(value) : ''
    const out: { date: Date; muted: boolean; disabled: boolean; picked: boolean }[] = []
    for (let i = 0; i < startOffset; i++) {
      const d = new Date(month.getFullYear(), month.getMonth(), i - startOffset + 1)
      out.push({ date: d, muted: true, disabled: true, picked: false })
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(month.getFullYear(), month.getMonth(), day)
      const t = startOfDay(d).getTime()
      const sunday = d.getDay() === 0
      const outOfRange = Boolean((min && t < min.getTime()) || (max && t > max.getTime()))
      out.push({ date: d, muted: false, disabled: sunday || outOfRange, picked: ymd(d) === picked })
    }
    while (out.length % 7 !== 0) {
      const d = new Date(month.getFullYear(), month.getMonth() + 1, out.length - startOffset - daysInMonth + 1)
      out.push({ date: d, muted: true, disabled: true, picked: false })
    }
    return out
  }, [month, minDate, maxDate, value])

  return (
    <div className="datepicker-container datepicker-inline">
      <div className="datepicker-panel">
        <ul>
          <li data-view="month prev" onClick={() => onMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} />
          <li data-view="month current" className="disabled">
            {MONTHS[month.getMonth()]} {month.getFullYear()}
          </li>
          <li data-view="month next" onClick={() => onMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} />
        </ul>
        <ul data-view="week">
          {DAYS_SHORT.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
        <ul data-view="days">
          {cells.map((cell, i) => (
            <li
              key={i}
              data-view="day"
              className={[cell.muted && 'muted', cell.disabled && 'disabled', cell.picked && 'picked', !cell.disabled && !cell.muted && 'highlighted'].filter(Boolean).join(' ')}
              onClick={() => {
                if (!cell.disabled && !cell.muted) onPick(cell.date)
              }}
            >
              {cell.date.getDate()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function parseParamDate(value: unknown): Date | undefined {
  if (!value) return undefined
  const raw = typeof value === 'string' ? value : typeof value === 'object' && value && 'date' in value ? String((value as { date: unknown }).date) : String(value)
  const slice = raw.slice(0, 10)
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(slice)
  if (!m) return undefined
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
}

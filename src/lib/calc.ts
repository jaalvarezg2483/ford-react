import { useEffect, useState } from 'react'
import type { Calculator } from '@/data/types'
import { api } from '@/lib/api'

export const CALC_KEY = 'ford-calc'

export type CalcSession = {
  slug: string
  code: string
  accIds: number[]
  term?: number
}

export type FinanceEntity = {
  id: number
  name: string
  rate: number
  commission: number
  prima: number
  termMonth: number[]
  terms: number[]
  image: string
}

/** Cuota mensual CAFSA (Calculator.php): prima, comisión e interés mensual. */
export function cafsaQuota(total: number, calc: Calculator, term?: number): number {
  const plazo = term && term > 0 ? term : calc.term || 96
  const prima = total * (calc.prima / 100)
  const priceComision = total - prima + (total - prima) * (calc.commission * 0.01)
  const interest = calc.rate / 1200
  if (!interest) return plazo ? priceComision / plazo : 0
  return (priceComision * (interest * Math.pow(1 + interest, plazo))) / (Math.pow(1 + interest, plazo) - 1)
}

export function formatCuota(value: number): string {
  if (!Number.isFinite(value)) return ''
  const [int, dec] = value.toFixed(2).split('.')
  return `${int.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${dec}`
}

export function readCalc(): CalcSession | null {
  try {
    const raw = sessionStorage.getItem(CALC_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as CalcSession
    if (!data || typeof data.slug !== 'string') return null
    return {
      slug: data.slug,
      code: typeof data.code === 'string' ? data.code : '',
      accIds: Array.isArray(data.accIds) ? data.accIds.map(Number).filter((n) => Number.isFinite(n)) : [],
      term: typeof data.term === 'number' && data.term > 0 ? data.term : undefined,
    }
  } catch {
    return null
  }
}

export function writeCalc(next: CalcSession) {
  sessionStorage.setItem(CALC_KEY, JSON.stringify(next))
}

/** Plazos en meses de una entidad (termMonth, o years × 12). */
export function entityTerms(entity: FinanceEntity | undefined, fallback: number): number[] {
  const months = (entity?.termMonth || []).map(Number).filter((n) => n > 0)
  if (months.length) return [...new Set(months)]
  const years = (entity?.terms || []).map(Number).filter((n) => n > 0)
  if (years.length) return [...new Set(years.map((y) => y * 12))]
  return fallback > 0 ? [fallback] : [96]
}

export function useEntities() {
  const [entities, setEntities] = useState<FinanceEntity[]>([])
  useEffect(() => {
    let cancelled = false
    api
      .get<FinanceEntity[]>('/api/calculator/entities', { silent: true })
      .then((rows) => {
        if (!cancelled && Array.isArray(rows)) setEntities(rows)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])
  return entities
}

import { A } from '@/components/ui/A'

type Props = {
  step: 1 | 2 | 3
  slug?: string
  code?: string
}

/** Pasos 1 Vehículo / 2 Adicionales / 3 Resumen (clases calculate-nav del sitio original). */
export function CalculateNav({ step, slug, code }: Props) {
  const modelos = slug ? `/autos/${slug}/modelos` : undefined
  const adicionales = slug && code ? `/autos/${slug}/calcular/${code}` : undefined
  const resumen = slug && code ? `/autos/${slug}/calcular/${code}/resumen` : undefined
  const items: { n: number; label: string; href?: string; current: boolean }[] = [
    { n: 1, label: 'Vehículo', href: step > 1 ? modelos : undefined, current: step >= 1 },
    { n: 2, label: 'Adicionales', href: step === 3 ? adicionales : undefined, current: step >= 2 },
    { n: 3, label: 'Resumen', href: step < 3 ? resumen : undefined, current: step >= 3 },
  ]
  return (
    <div className="calculate-nav">
      {items.map((it) => (
        <div key={it.n} className={`calculate-nav-item${it.current ? ' current' : ''}`}>
          {it.href ? (
            <A href={it.href} className="calculate-nav-btn">
              {it.n}
            </A>
          ) : (
            <button type="button" className="calculate-nav-btn">
              {it.n}
            </button>
          )}
          <span>{it.label}</span>
        </div>
      ))}
    </div>
  )
}

import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { createPortal } from 'react-dom'
import type { Calculator, Family, Model, Specs } from '@/data/types'
import { useContent } from '@/data/content'
import { money } from '@/lib/format'
import { A } from '@/components/ui/A'

const SLOTS = 4

type Picked = { family: Family; model: Model }

/** Cuota mensual aproximada (misma fórmula de amortización que la calculadora del sitio). */
export function monthlyQuota(total: number, calc: Calculator): number {
  const down = total * (calc.prima / 100)
  const financed = total - down + (total - down) * (calc.commission * 0.01)
  const i = calc.rate / 1200
  if (!i) return financed / calc.term
  return (financed * (i * Math.pow(1 + i, calc.term))) / (Math.pow(1 + i, calc.term) - 1)
}

const SPEC_ROWS: { label: string; key: keyof Specs; optional?: boolean }[] = [
  { label: 'Motor', key: 'cc' },
  { label: 'Tracción', key: 'traction' },
  { label: 'Combustible', key: 'gas' },
  { label: 'Transmisión', key: 'transmission' },
  { label: 'Pasajeros', key: 'pasajeros' },
  { label: 'Largo total', key: 'totalLength', optional: true },
  { label: 'Alto total', key: 'totalHeight', optional: true },
  { label: 'Ancho total', key: 'totalWidth', optional: true },
  { label: 'Distancia entre ejes', key: 'distanceBetweenAxis', optional: true },
]

const mobileCols = (index: number) => (index >= 2 ? 'cell-desktop' : undefined)
const dash = <p className="text-50">&mdash;</p>

function PickModal({ families, onPick, onClose }: { families: Family[]; onPick: (code: string) => void; onClose: () => void }) {
  const [familyId, setFamilyId] = useState('')
  const [code, setCode] = useState('')
  const family = families.find((f) => String(f.id) === familyId)
  return createPortal(
    <>
      <div className="modal fade in modal--compare" style={{ display: 'block' }} role="dialog" aria-modal="true" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal__inner">
              <button type="button" className="modal__close" onClick={onClose} aria-label="Cerrar">
                <i className="icon icon-close" />
              </button>
            </div>
            <div className="modal__inner">
              <form
                className="container"
                onSubmit={(e) => {
                  e.preventDefault()
                  if (code) onPick(code)
                }}
              >
                <h3 className="title margin--bottom margin--top">Elegir vehículo</h3>
                <div className="row">
                  <div className="col-sm-12 select select--compare">
                    <select
                      id="compare_family"
                      className="js-select"
                      value={familyId}
                      onChange={(e) => {
                        setFamilyId(e.target.value)
                        setCode('')
                      }}
                    >
                      <option value="">Seleccione una familia</option>
                      {families.map((f) => (
                        <option value={f.id} key={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-sm-12 select select--compare">
                    <select id="compare_model" className="js-select" value={code} onChange={(e) => setCode(e.target.value)} disabled={!family}>
                      <option value="">{family ? 'Seleccione un modelo' : 'Debe seleccionar primero una Familia'}</option>
                      {family?.models.map((m) => (
                        <option value={m.code} key={m.code}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="text-center margin--top">
                  <button type="submit" className="btn btn--primary btn--large" disabled={!code}>
                    Ver Vehículo
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade in" />
    </>,
    document.body,
  )
}

/** Comparador de hasta cuatro modelos: precio, cuota aproximada y especificaciones. */
export function Compare() {
  const { families, cafsa } = useContent()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [slot, setSlot] = useState<number | null>(null)

  const codes = params.getAll('models[]').slice(0, SLOTS)
  const picked = useMemo<(Picked | null)[]>(() => {
    const byCode = new Map<string, Picked>()
    families.forEach((family) => family.models.forEach((model) => model.code && byCode.set(model.code, { family, model })))
    return Array.from({ length: SLOTS }, (_, i) => byCode.get(codes[i] ?? '') ?? null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [families, codes.join('|')])

  const pickable = families.filter((f) => f.models.some((m) => m.code))
  const setSlotCode = (index: number, code: string) => {
    const next = picked.map((p) => p?.model.code).filter(Boolean) as string[]
    next[index] = code
    setParams(new URLSearchParams(next.map((c) => ['models[]', c])), { replace: true })
    setSlot(null)
  }
  const cell = (index: number, content: ReactNode) => (
    <td className={mobileCols(index)} key={index}>
      {content}
    </td>
  )
  const filledCount = picked.filter(Boolean).length
  const rows = SPEC_ROWS.filter((r) => !r.optional || picked.some((p) => p?.model.specs[r.key]))

  return (
    <main id="main-content" tabIndex={-1}>
      <div className="wrapper">
        <div className="text-left padding-1 bg--muted">
          <div className="container">
            <a
              href="#"
              className="text--primary"
              onClick={(e) => {
                e.preventDefault()
                navigate(-1)
              }}
            >
              <i className="icon icon-arrow-left" /> Volver
            </a>
          </div>
        </div>
        <div className="container margin--top">
          <h1 className="title">
            Comparar <br /> vehículos
          </h1>
          <table className="table--compare">
            <tbody>
              <tr>
                <td className="cell-desktop" />
                {picked.map((p, i) =>
                  cell(
                    i,
                    <button
                      type="button"
                      className={`btn btn--compare btn--resize ${p ? 'btn--collapse-muck' : 'btn--primary'} ${i <= filledCount ? 'compare-models' : ''}`}
                      disabled={i > filledCount}
                      onClick={() => setSlot(i)}
                    >
                      {p ? (
                        <>
                          {p.model.name} <i className="icon icon-chevron-down" />
                        </>
                      ) : (
                        'Agregar otro vehículo'
                      )}
                    </button>,
                  ),
                )}
              </tr>
              {[
                { label: 'Precio', value: (p: Picked) => (p.model.price != null ? `$${money(p.model.price)}` : null) },
                { label: 'Cuota aprox. CAFSA', value: (p: Picked) => (cafsa && p.model.price ? `$${money(monthlyQuota(p.model.price, cafsa))}` : null) },
                ...rows.map((r) => ({ label: r.label, value: (p: Picked) => (p.model.specs[r.key] ? String(p.model.specs[r.key]) : null) })),
              ].map((row) => (
                <RowPair key={row.label} label={row.label} picked={picked} value={row.value} />
              ))}
              <tr className="row-mobile">
                <td colSpan={2}>
                  <strong />
                </td>
              </tr>
              <tr>
                <td className="cell-desktop" />
                {picked.map((p, i) =>
                  cell(
                    i,
                    p && p.model.code ? (
                      <A className="btn btn--compare btn--resize" href={`/autos/${p.family.slug}/calcular/${p.model.code}`}>
                        Calcular financiamiento
                      </A>
                    ) : (
                      <a className="btn btn--compare btn--resize disabled" href="#" onClick={(e) => e.preventDefault()}>
                        Calcular financiamiento
                      </a>
                    ),
                  ),
                )}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      {slot !== null && <PickModal families={pickable} onPick={(code) => setSlotCode(slot, code)} onClose={() => setSlot(null)} />}
    </main>
  )
}

function RowPair({ label, picked, value }: { label: string; picked: (Picked | null)[]; value: (p: Picked) => string | null }) {
  return (
    <>
      <tr className="row-mobile">
        <td colSpan={2}>
          <strong>{label}</strong>
        </td>
      </tr>
      <tr>
        <td className="cell-desktop">{label}</td>
        {picked.map((p, i) => {
          const v = p ? value(p) : null
          return (
            <td className={mobileCols(i)} key={i}>
              {v ?? dash}
            </td>
          )
        })}
      </tr>
    </>
  )
}

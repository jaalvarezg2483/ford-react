import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { A } from '@/components/ui/A'
import { AccessoryCards } from '@/components/calculator/AccessoryCards'
import { accessoriesFor, accessorySlugs } from '@/data/accessories'
import { useContent, useFamily } from '@/data/content'
import { readCalc, writeCalc } from '@/lib/calc'
import { money } from '@/lib/format'

/** Listado de accesorios de una familia (hero, select, cards y total). */
export function Accesorios() {
  const { slug } = useParams()
  const family = useFamily(slug)
  const { families } = useContent()
  const navigate = useNavigate()
  const slugs = accessorySlugs()
  const options = families.filter((f) => slugs.includes(f.slug) || f.slug === family?.slug)
  const items = accessoriesFor(family?.slug)
  const [accIds, setAccIds] = useState<number[]>([])
  useEffect(() => {
    const saved = readCalc()
    if (saved && saved.slug === slug) setAccIds(saved.accIds)
    else {
      setAccIds([])
      if (slug) writeCalc({ slug, code: '', accIds: [] })
    }
  }, [slug])

  const selected = useMemo(() => items.filter((a) => accIds.includes(a.id)), [items, accIds])
  const extras = selected.reduce((sum, a) => sum + a.price, 0)
  const base = family && !family.hidePrice ? family.startPrice ?? 0 : 0
  const total = base + extras

  if (!family) return <Navigate to="/404" replace />

  const toggle = (id: number) => {
    const next = accIds.includes(id) ? accIds.filter((x) => x !== id) : [...accIds, id]
    setAccIds(next)
    const saved = readCalc()
    writeCalc({ slug: family.slug, code: saved?.slug === family.slug ? saved.code : '', accIds: next, term: saved?.term })
  }

  return (
    <main id="main-content" tabIndex={-1}>
      <div className="wrapper">
        <div className="text-left padding-2 bg--accent-light hidden-xs">
          <div className="container">
            <A href="/servicio/accesorios" className="text--primary">
              <i className="icon icon-arrow-left" /> Volver
            </A>
          </div>
        </div>
        <div className="accesories-hero">
          <A className="accesories-backbot text--light" href="/servicio/accesorios">
            <i className="icon icon-arrow-left" /> Volver
          </A>
          <h2 className="title">Accesorios</h2>
        </div>
        <div className="container margin--top hidden-xs">
          <div className="col-md-6">
            <h2 className="title">Accesorios</h2>
            <p>Escogé los accesorios de tu interés y seleccioná “Realizar Cotización” para enviar la información al correo o solicitar asistencia de un asesor.</p>
          </div>
        </div>
        <div className="container bg--secondary padding-1 accesories-head-row">
          <div className="col-md-2" />
          <div className="input-field col-md-6 select-cars select">
            <select className="js-select change_model" value={family.slug} onChange={(e) => navigate(`/accesorios/${e.target.value}`)}>
              {options.map((f) => (
                <option key={f.slug} value={f.slug} disabled={f.slug === family.slug}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <p className="text--light" id="total-selected">
              Adicionales (<strong>{selected.length}</strong>)
            </p>
          </div>
          <div className="col-md-2">
            <p className="text--light" id="total">
              Total <strong>${money(total)}</strong>
            </p>
          </div>
        </div>
        <div className="container">
          <div className="row row-margin">
            <div className="col-md-2 hidden-xs">
              <div className="accessories-aside">
                <A href="/servicio/accesorios" className="active">
                  Accesorios
                </A>
              </div>
            </div>
            <div className="col-md-10 padding-0">
              <div className="row content-accesories-car accessories_wdg">
                <AccessoryCards
                  items={items}
                  selected={accIds}
                  onToggle={toggle}
                  emptyText="No hay accesorios disponibles para este vehículo en este momento."
                  detailLabel="Ver más"
                />
              </div>
            </div>
          </div>
          <div className="row text-center margin--bottom">
            <A
              href={`/accesorios/${family.slug}/resumen`}
              id="calculate-next"
              className="btn btn--primary"
              onClick={() => {
                const saved = readCalc()
                writeCalc({ slug: family.slug, code: saved?.slug === family.slug ? saved.code : '', accIds, term: saved?.term })
              }}
            >
              Realizar Cotización
            </A>
          </div>
        </div>
      </div>
    </main>
  )
}

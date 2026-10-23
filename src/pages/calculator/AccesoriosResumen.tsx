import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { A } from '@/components/ui/A'
import { accessoriesFor } from '@/data/accessories'
import { useFamily } from '@/data/content'
import { readCalc, writeCalc } from '@/lib/calc'
import { money } from '@/lib/format'

/** Resumen de cotización de accesorios (precio base + seleccionados). */
export function AccesoriosResumen() {
  const { slug } = useParams()
  const family = useFamily(slug)
  const items = accessoriesFor(family?.slug)
  const [accIds, setAccIds] = useState<number[]>([])
  useEffect(() => {
    const saved = readCalc()
    const ids = saved && saved.slug === slug ? saved.accIds : []
    setAccIds(ids)
    if (slug) writeCalc({ slug, code: saved?.code || '', accIds: ids, term: saved?.term })
  }, [slug])
  const selected = items.filter((a) => accIds.includes(a.id))
  const extras = selected.reduce((sum, a) => sum + a.price, 0)
  const base = family && !family.hidePrice ? family.startPrice ?? 0 : 0
  const total = base + extras

  if (!family) return <Navigate to="/404" replace />

  return (
    <main id="main-content" tabIndex={-1}>
      <div className="wrapper">
        <div className="text-left padding-2 bg--accent-light hidden-xs">
          <div className="container">
            <A href={`/accesorios/${family.slug}`} className="text--primary">
              <i className="icon icon-arrow-left" /> Volver
            </A>
          </div>
        </div>
        <div className="container">
          <h2 className="title margin--top">Cotización de accesorios</h2>
          <div className="row margin--top">
            <div className="col-md-6 bg--accent-light padding-2">
              <h3 className="title">Cotización de accesorios</h3>
              <table>
                <tbody>
                  {base ? (
                    <tr>
                      <td className="padding-1">{family.name}</td>
                      <td>${money(base)}</td>
                    </tr>
                  ) : null}
                  {selected.map((a) => (
                    <tr key={a.id}>
                      <td className="padding-1">{a.name}</td>
                      <td>${money(a.price)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td className="padding-1">
                      <strong>Total</strong>
                    </td>
                    <td>
                      <strong>${money(total)}</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="col-md-6 padding-2">
              <h3 className="title">¿Qué desea hacer?</h3>
              <A href={`/accesorios/${family.slug}/asesor`} className="title-icon title-icon--responsive margin--top">
                <div className="icon-box">
                  <i className="icon icon-phone" />
                </div>
                <div>
                  <p>
                    Solicitar seguimiento y <br />
                    contactar asesor de ventas
                  </p>
                </div>
              </A>
              <A href={`/accesorios/${family.slug}/correo`} className="title-icon title-icon--responsive margin--top">
                <div className="icon-box">
                  <i className="icon icon-mail" />
                </div>
                <div>
                  <p>Enviar cotización a mi correo</p>
                </div>
              </A>
              <A href="/servicio/accesorios" className="title-icon title-icon--responsive margin--top">
                <div className="icon-box">
                  <i className="icon icon-plus" />
                </div>
                <div>
                  <p>Iniciar nueva cotización</p>
                </div>
              </A>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="text-center col-xs-12">
            <A href={`/accesorios/${family.slug}`} className="btn">
              Volver
            </A>
          </div>
        </div>
      </div>
    </main>
  )
}

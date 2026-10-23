import { A } from '@/components/ui/A'
import { OfficeList, type Place } from '@/components/places/OfficeList'
import places from '@/data/places.json'

const data = places as { sucursales: Place[]; talleres: Place[] }

const COPY = {
  sucursales: {
    title: 'Contáctenos',
    intro: 'Para nosotros vos siempre estás primero.',
    noun: 'Sucursales',
    places: data.sucursales,
  },
  talleres: {
    title: 'Contáctenos',
    intro: 'Para nosotros vos siempre estás primero.',
    noun: 'Talleres',
    places: data.talleres,
  },
} as const

/** Sucursales o talleres: mismas pestañas que Contacto y listado colapsable. */
export function Offices({ kind }: { kind: 'sucursales' | 'talleres' }) {
  const page = COPY[kind]
  return (
    <main id="main-content" tabIndex={-1}>
      <div className="wrapper">
        <div className="container margin--top margin--bottom">
          <h1 className="title">{page.title}</h1>
          <p>{page.intro}</p>
          <ul className="tabs tabs--opacity margin--top">
            <li className="tab">
              <A href="/contacto">
                <i className="icon icon-phone text--primary" /> Contacto
              </A>
            </li>
            <li className={`tab${kind === 'sucursales' ? ' active' : ''}`}>
              <A href="/sucursales">
                <i className="icon icon-home text--primary" /> Sucursales
              </A>
            </li>
            <li className={`tab${kind === 'talleres' ? ' active' : ''}`}>
              <A href="/talleres">
                <i className="icon icon-wrench text--primary" /> Talleres
              </A>
            </li>
          </ul>
          <OfficeList places={page.places} noun={page.noun} />
        </div>
      </div>
    </main>
  )
}

import { useNavigate } from 'react-router-dom'
import type { Family } from '@/data/types'
import { A } from '@/components/ui/A'

const cssUrl = (url: string) => `url("${encodeURI(url).replace(/["\\]/g, '')}")`

/** Banner de la ficha con el menú Perfil / Galería. Las imágenes del banner salen del CMS. */
export function VehicleHero({ family, current }: { family: Family; current: 'perfil' | 'galeria' }) {
  const navigate = useNavigate()
  const base = `/autos/${family.slug}`
  const desktop = family.heroDesktop || family.heroMobile
  const mobile = family.heroMobile || family.heroDesktop
  const css = [
    mobile ? `.car-profile-hero{background-image:${cssUrl(mobile)}}` : '',
    desktop ? `@media screen and (min-width:768px){.car-profile-hero{background-image:${cssUrl(desktop)}}}` : '',
  ].join('')
  return (
    <>
      {css ? <style>{css}</style> : null}
      <div className="profile-back hidden-md">
        <button type="button" className="btn btn--clear" onClick={() => navigate(-1)}>
          <i className="icon icon-arrow-left" /> Volver
        </button>
      </div>
      <div className="hero car-profile-hero">
        <div className="menu--inner menu--inner-car" id="carMenu">
          <ul className="tabs--drop-mobile">
            <li className="tab">
              <A className={current === 'perfil' ? 'current' : undefined} href={base}>
                <i className="icon icon-profile hidden-xs" /> Perfil
              </A>
            </li>
            <li className="tab">
              <A className={current === 'galeria' ? 'current' : undefined} href={`${base}/galeria`}>
                <i className="icon icon-image hidden-xs" /> Galería
              </A>
            </li>
          </ul>
        </div>
        <div className="overlay" />
      </div>
    </>
  )
}

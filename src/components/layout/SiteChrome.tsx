import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import type { FamilyType, Site } from '@/data/types'
import { money } from '@/lib/format'
import { A } from '@/components/ui/A'
import { useTabs } from '@/hooks/useTabs'
import { spaced } from '@/components/ui/spaced'

export const SUBMENU_EVENT = 'ford:submenu'

/** Abre o cierra el submenú de vehículos desde cualquier parte (p. ej. el pie). */
export function toggleSubmenu() {
  window.dispatchEvent(new CustomEvent(SUBMENU_EVENT))
}

function useBodyClass(name: string, on: boolean) {
  useEffect(() => {
    document.body.classList.toggle(name, on)
    return () => document.body.classList.remove(name)
  }, [name, on])
}

type Props = Pick<Site, 'topMenu' | 'social' | 'familyTypes'>

/** Qué opción del menú queda marcada en cada sección (como activeMenu del Symfony). */
export function activeMenuFor(pathname: string): string[] {
  if (pathname === '/') return ['/']
  if (pathname === '/calcular' || /^\/autos\/[^/]+\/(modelos|calcular)(\/|$)/.test(pathname)) return ['/calcular']
  if (/^\/(autos|fichas-tecnicas-precios)\//.test(pathname)) return ['subNuevos']
  if (pathname.startsWith('/blog')) return ['/blog']
  if (pathname.startsWith('/preaprobador') || pathname === '/comparador' || pathname === '/herramientas-de-compra') return ['/herramientas-de-compra']
  if (pathname.startsWith('/sucursales') || pathname.startsWith('/talleres')) return ['/contacto']
  if (pathname.startsWith('/accesorios') || pathname.startsWith('/servicios')) return ['/servicios']
  for (const key of ['/servicios', '/contacto', '/calcular', '/citas']) if (pathname === key) return [key]
  return []
}

/** Encabezado, menú, submenú de vehículos y buscador (partials _header y _search). */
export function SiteChrome({ topMenu, social, familyTypes }: Props) {
  const { pathname } = useLocation()
  const active = activeMenuFor(pathname || '/')
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [submenuOpen, setSubmenuOpen] = useState(false)
  const [menuQuery, setMenuQuery] = useState('')
  useBodyClass('menu-open', menuOpen)
  useBodyClass('search-open', searchOpen)

  // Al navegar se cierran el menú, el submenú y el buscador (antes cada enlace recargaba la página).
  useEffect(() => {
    setMenuOpen(false)
    setSubmenuOpen(false)
    setSearchOpen(false)
    setMenuQuery('')
  }, [pathname])

  useEffect(() => {
    const onToggle = () => setSubmenuOpen((o) => !o)
    window.addEventListener(SUBMENU_EVENT, onToggle)
    return () => window.removeEventListener(SUBMENU_EVENT, onToggle)
  }, [])

  const is = (key: string) => active.includes(key)
  const searching = menuQuery.length > 0

  return (
    <>
      <header className="header">
        <A className="text-replace logo-ford" href="/">
          FORD
        </A>
        <button type="button" className="btn btn--smallest js-submenu-open hidden-md" onClick={() => setSubmenuOpen((o) => !o)}>
          Vehículos nuevos
        </button>
        <button
          type="button"
          className="menu__toggle js-menu-toggle"
          aria-label="Abrir menú"
          aria-expanded={menuOpen}
          onClick={() => {
            setMenuOpen((o) => !o)
            setSubmenuOpen(false)
          }}
        >
          <i className="icon icon-hamburger" />
        </button>
      </header>

      <menu className={`menu${searching ? ' active-search' : ''}`}>
        <div className="menu__field">
          <form action="/resultados" method="get">
            <input
              className="js-hidde_menu input"
              type="text"
              name="q"
              placeholder="Buscar en el sitio"
              aria-label="Buscar en el sitio"
              value={menuQuery}
              onChange={(e) => setMenuQuery(e.target.value)}
            />
            <button type="submit" aria-label="Buscar">
              <i className="icon icon-arrow-right" />
            </button>
          </form>
        </div>
        <ul className="menu__top" style={searching ? { display: 'none' } : undefined}>
          {spaced([
            <li key="inicio">
              <A href="/" className={`menu__item ${is('/') ? 'active' : ''}`}>
                Inicio
              </A>
            </li>,
            <li key="nuevos">
              <button
                type="button"
                className={`menu__item js-submenu-open ${is('subNuevos') ? 'active' : ''}${submenuOpen ? ' menu__item-open' : ''}`}
                aria-expanded={submenuOpen}
                onClick={() => setSubmenuOpen((o) => !o)}
              >
                Vehículos nuevos
              </button>
            </li>,
            ...topMenu.map((item) => (
              <li key={item.href}>
                <A href={item.href} className={`menu__item ${is(item.href) ? 'active' : ''}`}>
                  {item.label}
                </A>
              </li>
            )),
          ])}
        </ul>
        <ul className="menu__right">
          {spaced([
<li key="0">
            <A href="/herramientas-de-compra" className={`menu__item wide-line ${is('/herramientas-de-compra') ? 'active' : ''}`}>
              <span className="icon icon-dolar hidden-xs" /> Herramientas de compra{' '}
            </A>
          </li>,
<li key="1">
            <A href="/calcular" className={`menu__item wide-line ${is('/calcular') ? 'active' : ''}`}>
              {' '}
              <i className="icon icon-calculator hidden-xs" /> Calcular Financiamiento{' '}
            </A>
          </li>,
<li key="2">
            <A
              href="#"
              className="btn--search menu__item js-search-open"
              aria-label="Buscar en el sitio"
              onClick={(e) => {
                e.preventDefault()
                setSearchOpen(true)
              }}
            >
              {' '}
              <i className="icon icon-search" />{' '}
            </A>
          </li>
          ])}
        </ul>
        <ul className="menu__social-media">
          {spaced(social.map((s) => (
            <li key={s.href}>
              <A href={s.href} target="_blank" rel="noopener" aria-label={s.icon.replace('icon-', '')}>
                <span className={`icon ${s.icon}`} />
              </A>
            </li>
          )))}
        </ul>
      </menu>

      <Submenu types={familyTypes} open={submenuOpen} />

      <div className="search">
        <div className="search__head">
          <div className="container">
            <div className="search__field">
              <A
                className="js-search-close"
                href="#"
                aria-label="Cerrar búsqueda"
                onClick={(e) => {
                  e.preventDefault()
                  setSearchOpen(false)
                }}
              >
                <i className="icon icon-close" />
              </A>
              <form action="/resultados" method="GET">
                <input className="input" type="text" placeholder="Buscar en el sitio" name="q" aria-label="Buscar en el sitio" />
                <button type="submit" aria-label="Buscar">
                  <i className="icon icon-arrow-right" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function Submenu({ types, open }: { types: FamilyType[]; open: boolean }) {
  const tabs = useTabs(0)
  return (
    <div className={`submenu${open ? ' submenu--open' : ''}`} id="subNuevos">
      <div className="submenu__tabs">
        <div className="container">
          <div className="container margin--top margin--bottom">
            <h2 className="title">Vehículos</h2>
            <h1 className="title">nuevos</h1>
          </div>
          <ul className="tabs tabs-gray js-tabs-animate" role="tablist">
            {spaced(types.map((t, i) => (
              <li
                key={t.id}
                className={`tab ${tabs.tabClass(i)} ${t.textColor.toLowerCase() !== '#000000' ? 'custom-color' : ''}`}
                style={{ ['--category-text-color' as string]: t.textColor, ['--underlined-text-color' as string]: t.underlineColor }}
              >
                <A
                  href={`#submenu${i + 1}`}
                  role="tab"
                  aria-selected={tabs.active === i}
                  onClick={(e) => {
                    e.preventDefault()
                    tabs.select(i)
                  }}
                >
                  {t.name}
                </A>
              </li>
            )))}
          </ul>
        </div>
      </div>
      <ul className="collapsible tab-content">
        {types.map((t, i) => (
          <li key={t.id} className={`tab-pane fade ${tabs.paneClass(i)}`} id={`submenu${i + 1}`} role="tabpanel">
            <div className="collapsible__body container-fluid">
              <div className="row row--flex">
                {t.families.map((f) => (
                  <div key={f.slug} className="col-md-4 family-wrap">
                    <A href={`/autos/${f.slug}`}>
                      <div className="family">
                        {/* Al abrir el submenú las imágenes de la pestaña activa entran animadas. */}
                        <div className={`family__img${open && tabs.active === i ? ' family__animate' : ''}`}>
                          {f.menuImage || f.homeImage ? <img src={f.menuImage || f.homeImage} alt={f.name} className="img-responsive" /> : null}
                        </div>
                        <div className="family__text">
                          <h3 className="title">{f.name}</h3>
                          {f.hidePrice ? null : (
                            <>
                              <p>desde</p>
                              <h4 className="title">${money(f.startPrice)}</h4>
                            </>
                          )}
                          {f.fordPerformance ? <img className="ford-p-img" src="/img/fordPerformance.png" alt="Ford Performance" /> : null}
                        </div>
                        <i className="icon icon-arrow-right" />
                      </div>
                    </A>
                  </div>
                ))}
              </div>
            </div>
            {t.promo ? (
              <div className="ford-performance-text">
                {t.promo.logo ? <img src={t.promo.logo} alt={t.name} /> : null}
                <hr />
                <h2 className="title">{t.promo.title}</h2>
                {t.promo.paragraphs.map((p, k) => (
                  <p key={k} className="text">
                    {p}
                  </p>
                ))}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  )
}

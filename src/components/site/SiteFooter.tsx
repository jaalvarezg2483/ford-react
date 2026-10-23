import type { SiteData } from '@/site/data'
import { SubmenuLink } from './SubmenuLink'
import { spaced } from './spaced'

function Social({ items, className }: { items: SiteData['footerSocial']; className: string }) {
  return (
    <ul className={className}>
      {spaced(items.map((s) => (
        <li key={s.href}>
          <a href={s.href} target="_blank" rel="noopener" aria-label={s.icon.replace('icon-', '')}>
            <span className={`icon ${s.icon}`} />
          </a>
        </li>
      )))}
    </ul>
  )
}

/** Pie de página (antes HTML fijo en la configuración del sitio). */
export function SiteFooter({ footer, footerSocial }: Pick<SiteData, 'footer' | 'footerSocial'>) {
  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="container">
          <ul className="row list-unstyled">
            <li className="footer__col col-sm-3 hidden-xs">
              <h2 className="text-replace logos">Ford Costa Rica</h2>
              <ul className="list-unstyled list-uncategotized">
                <li>
                  <Social items={footerSocial} className="list--social" />
                </li>
              </ul>
            </li>
            <li className="footer__col col-sm-3">
              <SubmenuLink>Vehículos nuevos</SubmenuLink>
            </li>
            {footer.links.map((l) => (
              <li key={l.href + l.label} className="footer__col col-sm-3">
                <a href={l.href}>
                  {l.highlight ? (
                    <strong>
                      {l.label} <i className="icon icon-arrow-right" />
                    </strong>
                  ) : (
                    l.label
                  )}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <Social items={footerSocial} className="list--social mobile-only" />
      </div>
      {footer.ethicsText ? (
        <div className="btn-linea-etica-wrap">
          <div className="btn-linea-etica-container">
            <span>
              {footer.ethicsText}{' '}
              <a className="btn btn--primary btn-linea-etica" href={footer.ethicsUrl} target="_blank" rel="noopener">
                <i className="mdi mdi-plus" /> {footer.ethicsButton}
              </a>
            </span>
          </div>
        </div>
      ) : null}
      <div className="footer__bottom">
        <div className="container">
          <ul>
            {spaced([
              ...footer.bottomLinks.map((l) => (
                <li key={l.href + l.label}>
                  <a href={l.href} {...(l.newTab ? { target: '_blank', rel: 'noopener' } : {})}>
                    {l.label}
                  </a>
                </li>
              )),
              <li key="copy">
                <p>{footer.copyright}</p>
              </li>,
              <li key="logo">
                <h2 className="text-replace logos">Ford Costa Rica</h2>
              </li>,
            ])}
          </ul>
        </div>
      </div>
    </footer>
  )
}

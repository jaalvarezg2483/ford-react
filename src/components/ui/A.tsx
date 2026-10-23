import type { AnchorHTMLAttributes } from 'react'
import { Link } from 'react-router-dom'

/**
 * Enlace del sitio: las rutas internas navegan sin recargar la página (React Router);
 * las externas, anclas, mailto/tel y archivos (/documents, /datasheet…) usan un <a> normal.
 */
const FILE_OR_SERVER = /^\/(documents|datasheet|view-pdf|uploads|media|api|admin|specs|img|icons|fonts|show_calculate)\b|\.[a-z0-9]{2,5}($|\?)/i

export function A({ href, children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const internal = href !== undefined && href.startsWith('/') && !href.startsWith('//') && !FILE_OR_SERVER.test(href) && rest.target !== '_blank'
  if (internal) {
    return (
      <Link to={href!} {...(rest as Record<string, unknown>)}>
        {children}
      </Link>
    )
  }
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  )
}

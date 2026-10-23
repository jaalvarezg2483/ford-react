import { Fragment, type ReactNode } from 'react'

/**
 * Intercala un espacio entre elementos. En el HTML del sitio anterior los saltos
 * de línea entre <li> en línea se veían como un espacio; React no los genera,
 * así que se agregan para que menús y pestañas midan lo mismo.
 */
export function spaced(items: ReactNode[]): ReactNode[] {
  return items.map((item, i) => (
    <Fragment key={i}>
      {i > 0 ? ' ' : null}
      {item}
    </Fragment>
  ))
}

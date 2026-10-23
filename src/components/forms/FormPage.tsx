import type { ReactNode } from 'react'
import { A } from '@/components/ui/A'

/** Contenedor de las páginas de formularios: mismo marco que /contacto. */
export function FormPage({
  title,
  intro,
  back,
  children,
}: {
  title: string
  intro?: ReactNode
  back?: { href: string; label: ReactNode }
  children: ReactNode
}) {
  return (
    <main id="main-content" tabIndex={-1}>
      <div className="wrapper">
        {back ? (
          <div className="container container--breadcrumb">
            <A href={back.href} className="btn--back">
              <span className="icon icon-arrow-left" /> {back.label}
            </A>
          </div>
        ) : null}
        <div className="container margin--top margin--bottom">
          <h1 className="title">{title}</h1>
          {intro}
          {children}
        </div>
      </div>
    </main>
  )
}

export function VehicleInterest({ family, model }: { family: string; model?: string }) {
  return (
    <p className="quotation__model">
      <span>{family}</span>
      {model ? ` ${model}` : ''}
    </p>
  )
}

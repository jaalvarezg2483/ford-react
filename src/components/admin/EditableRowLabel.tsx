'use client'
import { useRowLabel } from '@payloadcms/ui'

type Row = { section?: string; label?: string; kind?: string; text?: string; url?: string; original?: string }

/** "Sección 2 · Servicios — Párrafo: Somos los distribuidores…" */
export function EditableRowLabel() {
  const { data, rowNumber } = useRowLabel<Row>()
  const value = (data?.kind === 'text' || data?.kind === 'meta' ? data?.text : data?.url) ?? data?.original ?? ''
  const changed = value !== (data?.original ?? '')
  const preview = value.length > 70 ? `${value.slice(0, 70)}…` : value
  const section = data?.section && data.section !== 'SEO' ? `${data.section} — ` : ''
  return (
    <span>
      {section}
      <strong>{data?.label ?? `Pieza ${(rowNumber ?? 0) + 1}`}</strong>
      {preview ? `: ${preview}` : ''}
      {changed ? <em style={{ marginLeft: 8, opacity: 0.7 }}>(editado)</em> : null}
    </span>
  )
}

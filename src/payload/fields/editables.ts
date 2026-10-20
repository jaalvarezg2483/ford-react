import type { ArrayField, Field, PayloadRequest } from 'payload'
import { applyEditables, extractEditables, mergeEditables, type Editable, type EditableSource } from '../../editables/html'

/**
 * Campos "piezas editables": textos, imágenes, enlaces, videos y SEO sacados del HTML
 * original. El equipo de contenido edita valores; nunca ve ni toca HTML.
 */

export type EditableRow = {
  id?: string
  key?: string | null
  kind?: Editable['kind'] | null
  source?: EditableSource | null
  section?: string | null
  label?: string | null
  start?: number | null
  end?: number | null
  raw?: string | null
  original?: string | null
  quote?: string | null
  text?: string | null
  url?: string | null
  image?: number | { id: number; legacyPath?: string | null; url?: string | null } | null
}

const hidden = { hidden: true } as const

export function editableArray(name: string, label: string, description: string): ArrayField {
  return {
    name,
    type: 'array',
    label,
    labels: { singular: 'Pieza', plural: label },
    admin: {
      description,
      initCollapsed: true,
      isSortable: false,
      components: { RowLabel: '/components/admin/EditableRowLabel#EditableRowLabel' },
    },
    fields: [
      { name: 'key', type: 'text', admin: hidden },
      { name: 'kind', type: 'select', options: ['text', 'image', 'link', 'video', 'meta'], admin: hidden },
      { name: 'source', type: 'text', admin: hidden },
      { name: 'section', type: 'text', admin: hidden },
      { name: 'label', type: 'text', admin: hidden },
      { name: 'start', type: 'number', admin: hidden },
      { name: 'end', type: 'number', admin: hidden },
      { name: 'raw', type: 'textarea', admin: hidden },
      { name: 'original', type: 'textarea', admin: hidden },
      { name: 'quote', type: 'text', admin: hidden },
      {
        name: 'text',
        type: 'textarea',
        label: 'Texto',
        admin: { condition: (_d, row) => row?.kind === 'text' || row?.kind === 'meta', description: 'Un Enter hace un salto de línea.' },
      },
      {
        name: 'image',
        type: 'upload',
        relationTo: 'media',
        label: 'Cambiar imagen',
        admin: { condition: (_d, row) => row?.kind === 'image', description: 'Subí o elegí una imagen. Si se deja vacío se usa la ruta de abajo.' },
      },
      {
        name: 'url',
        type: 'text',
        label: 'Enlace / ruta',
        admin: {
          condition: (_d, row) => row?.kind === 'link' || row?.kind === 'video' || row?.kind === 'image',
          description: 'Ej. /autos/everest, https://www.youtube.com/embed/… o /uploads/…',
        },
      },
    ],
  }
}

export function rowValue(row: EditableRow): string | null {
  if (row.kind === 'text' || row.kind === 'meta') return row.text ?? null
  return row.url ?? null
}

function toRow(e: Editable): EditableRow {
  return {
    key: e.key,
    kind: e.kind,
    source: e.source,
    section: e.section,
    label: e.source === 'seoH1' ? 'Título H1 oculto (SEO)' : e.label,
    start: e.start,
    end: e.end,
    raw: e.raw,
    original: e.original,
    quote: e.quote === undefined ? 'none' : e.quote,
    text: e.kind === 'text' || e.kind === 'meta' ? e.value : null,
    url: e.kind === 'text' || e.kind === 'meta' ? null : e.value,
    image: null,
  }
}

/** HTML + piezas editadas → HTML final. */
export function applyRows(html: string | null | undefined, rows: EditableRow[] | null | undefined, source: EditableSource): string {
  if (!html) return html ?? ''
  const items = (rows ?? [])
    .filter((r) => r && r.source === source && r.kind && typeof r.start === 'number' && typeof r.end === 'number')
    .map((r) => ({
      kind: r.kind as Editable['kind'],
      start: r.start as number,
      end: r.end as number,
      raw: r.raw ?? '',
      original: r.original ?? '',
      value: rowValue(r) ?? (r.original ?? ''),
      quote: r.quote === 'none' || r.quote == null ? undefined : (r.quote as Editable['quote']),
    }))
  return applyEditables(html, items)
}

/**
 * Vuelve a sacar las piezas cuando cambia el HTML de origen, conservando lo que el
 * equipo ya editó. Si el HTML no cambió, deja las filas como están.
 */
export function syncEditables(args: {
  sources: Partial<Record<EditableSource, string | null | undefined>>
  previousSources?: Partial<Record<EditableSource, string | null | undefined>>
  rows: EditableRow[] | null | undefined
  seoRows?: EditableRow[] | null | undefined
  splitSeo: boolean
}): { rows: EditableRow[]; seoRows: EditableRow[] } | null {
  const all = [...(args.rows ?? []), ...(args.seoRows ?? [])]
  const changed = Object.entries(args.sources).some(([k, v]) => (args.previousSources?.[k as EditableSource] ?? null) !== (v ?? null))
  if (!changed && all.length) return null
  const fresh: Editable[] = []
  for (const [source, html] of Object.entries(args.sources)) {
    if (html) fresh.push(...extractEditables(html, source as EditableSource))
  }
  const merged = mergeEditables(fresh, all.map((r) => ({ key: r.key, value: rowValue(r), original: r.original })))
  const rows: EditableRow[] = []
  const seoRows: EditableRow[] = []
  const previousImages = new Map(all.filter((r) => r.key && r.image).map((r) => [r.key as string, r.image]))
  for (const e of merged) {
    const row = toRow(e)
    if (row.key && previousImages.has(row.key)) row.image = previousImages.get(row.key) as EditableRow['image']
    if (args.splitSeo && e.section === 'SEO') seoRows.push(row)
    else rows.push(row)
  }
  return { rows, seoRows }
}

/** Si se eligió una imagen de la biblioteca, su ruta pública pasa a ser el valor. */
export async function resolveImages(rows: EditableRow[] | null | undefined, req: PayloadRequest): Promise<EditableRow[] | null | undefined> {
  if (!rows?.length) return rows
  for (const row of rows) {
    if (row.kind !== 'image' || !row.image) continue
    const id = typeof row.image === 'object' ? row.image.id : row.image
    const media = typeof row.image === 'object' && (row.image.legacyPath || row.image.url)
      ? row.image
      : await req.payload.findByID({ collection: 'media', id, depth: 0, req }).catch(() => null)
    const path = (media as any)?.legacyPath || (media as any)?.url
    if (path) row.url = path
  }
  return rows
}

/** Solo administradores ven y editan los campos técnicos en el CMS. El sitio público
 * necesita leerlos para reconstruir el HTML original, por lo que la lectura de API
 * permanece disponible dentro de las reglas públicas de cada colección/global. */
export const adminOnly = {
  update: ({ req }: { req: PayloadRequest }) => (req.user as { role?: string } | null)?.role === 'admin',
  create: ({ req }: { req: PayloadRequest }) => (req.user as { role?: string } | null)?.role === 'admin',
}

/** Marca un campo técnico como solo-desarrollo sin cambiar su nombre ni su dato. */
export function technical<T extends Field>(field: T): T {
  const admin = (field as any).admin ?? {}
  const existingCondition = admin.condition
  return {
    ...field,
    access: { ...((field as any).access ?? {}), ...adminOnly },
    admin: {
      ...admin,
      condition: (data: unknown, siblingData: unknown, context: { user?: { role?: string } | null }) =>
        context.user?.role === 'admin' && (existingCondition ? existingCondition(data, siblingData, context) : true),
    },
  } as T
}

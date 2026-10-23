import type { Payload } from 'payload'
import profiles from './vehicleProfiles.json'

type Profile = (typeof profiles)[keyof typeof profiles]
type RecordValue = Record<string, any>

const hasContent = (value: unknown) => typeof value === 'string' ? value.trim().length > 0 : value !== null && value !== undefined && value !== false

function mergeRecord(current: RecordValue = {}, fallback: RecordValue = {}): RecordValue {
  const merged = { ...fallback, ...current }
  delete merged.index
  for (const [key, value] of Object.entries(fallback)) {
    if (key !== 'image' && !hasContent(current[key]) && hasContent(value)) merged[key] = value
  }
  if (!current.image && !current.imagePath && fallback.image) {
    delete merged.image
    merged.imagePath = fallback.image
  }
  return merged
}

function mergeArray(current: RecordValue[] | undefined, fallback: RecordValue[] | undefined): RecordValue[] | undefined {
  if (!fallback?.length) return current
  if (!current?.length) return fallback.map((item) => mergeRecord({}, item))
  return [
    ...current.map((item, index) => mergeRecord(item, fallback[index])),
    ...fallback.slice(current.length).map((item) => mergeRecord({}, item)),
  ]
}

/**
 * Carga en las colecciones del CMS el contenido inicial de las fichas de vehículos.
 * Solo completa campos vacíos; los datos que un editor ya guardó siempre prevalecen.
 */
export async function seedVehicleProfiles(payload: Payload, log: (message: string) => void = () => {}) {
  const result = await payload.find({ collection: 'families', limit: 500, depth: 0, pagination: false, overrideAccess: true })
  const bySlug = profiles as Record<string, Profile>
  let updated = 0

  for (const family of result.docs as RecordValue[]) {
    const profile = bySlug[family.slug]
    if (!profile) continue
    const data: RecordValue = {}

    for (const field of ['tagline', 'heroDesktopPath', 'heroMobilePath', 'leadTitle', 'leadText', 'purdyGoUrl'] as const) {
      const sourceField = field === 'heroDesktopPath' ? 'heroDesktop' : field === 'heroMobilePath' ? 'heroMobile' : field
      const hasUpload = field === 'heroDesktopPath' ? family.heroDesktop : field === 'heroMobilePath' ? family.heroMobile : undefined
      if (!hasContent(family[field]) && !hasUpload && profile[sourceField]) data[field] = profile[sourceField]
    }

    const needsArraySeed = (current: RecordValue[] | undefined, fallback: RecordValue[] | undefined) =>
      Boolean(fallback?.length && (!current?.length || current.length < fallback.length || current.some((item, index) => !item.image && !item.imagePath && fallback[index]?.image)))
    const colors = mergeArray(family.colors, profile.colors)
    const highlights = mergeArray(family.highlights, profile.highlights)
    const gallery = (profile.gallery || []).map((section, index) => {
      const existing = family.gallery?.[index] as RecordValue | undefined
      const items = mergeArray(existing?.items, section.items)
      return existing
        ? { ...mergeRecord(existing, section), items: items || [] }
        : { ...mergeRecord({}, section), items: items || [] }
    })
    if (family.gallery?.length > gallery.length) gallery.push(...family.gallery.slice(gallery.length))
    const existingModels = (family.models || []) as RecordValue[]
    const models = existingModels.map((model, index) => {
      const source = profile.models?.find((candidate) => candidate.code && candidate.code === model.code) || profile.models?.[index]
      return mergeRecord(model, source)
    })

    if (needsArraySeed(family.colors, profile.colors)) data.colors = colors
    if (needsArraySeed(family.highlights, profile.highlights)) data.highlights = highlights
    const missingGallery = (profile.gallery || []).length > (family.gallery || []).length || gallery.some((section, index) => {
      const existing = family.gallery?.[index]
      return !existing?.items?.length || section.items.some((item, itemIndex) => !existing.items[itemIndex]?.image && !existing.items[itemIndex]?.imagePath)
    })
    if (gallery.length && missingGallery) data.gallery = gallery
    if (models.some((model, index) => model.imagePath !== existingModels[index]?.imagePath)) data.models = models

    if (!Object.keys(data).length) continue
    await payload.update({ collection: 'families', id: family.id, data, overrideAccess: true })
    updated++
  }

  log(`fichas de vehículos en CMS: ${updated} completadas`)
}

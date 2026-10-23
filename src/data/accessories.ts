import data from './accessories.json'

export type Accessory = {
  id: number
  name: string
  price: number
  description?: string
  image?: string
}

const bySlug = data as Record<string, Accessory[]>

export function accessoriesFor(slug: string | undefined): Accessory[] {
  return slug && bySlug[slug] ? bySlug[slug] : []
}

export function accessorySlugs(): string[] {
  return Object.keys(bySlug)
}

export function accessoryImage(item: Accessory): string {
  if (!item.image) return ''
  if (/^https?:\/\//.test(item.image) || item.image.startsWith('/')) return item.image
  return `/uploads/accesory/${item.image}`
}

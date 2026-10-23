import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { bumpSiteVersion } from '@/lib/siteVersion'

/** Cualquier cambio en el CMS invalida la caché en memoria del sitio público. */
export const revalidateSite: CollectionAfterChangeHook & CollectionAfterDeleteHook = ({ doc }: { doc: unknown }) => {
  bumpSiteVersion()
  return doc
}

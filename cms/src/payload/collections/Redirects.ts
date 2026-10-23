import type { CollectionConfig } from 'payload'
import { anyone, canManageContent } from '../access'
import { revalidateSite } from '../hooks/revalidate'

export const Redirects: CollectionConfig = {
  slug: 'redirects',
  labels: { singular: 'Redirección', plural: 'Redirecciones' },
  admin: { group: 'Sistema', useAsTitle: 'from', defaultColumns: ['from', 'to', 'permanent'] },
  access: { read: anyone, create: canManageContent, update: canManageContent, delete: canManageContent },
  hooks: { afterChange: [revalidateSite], afterDelete: [revalidateSite] },
  fields: [
    { name: 'from', type: 'text', required: true, unique: true, label: 'Desde' },
    { name: 'to', type: 'text', required: true, label: 'Hacia' },
    { name: 'permanent', type: 'checkbox', defaultValue: true, label: 'Permanente (301)' },
  ],
}

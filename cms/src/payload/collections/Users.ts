import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Usuario', plural: 'Usuarios' },
  admin: { useAsTitle: 'email', group: 'Sistema', defaultColumns: ['email', 'name', 'role'] },
  auth: { tokenExpiration: 60 * 60 * 8 },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if ((user as { role?: string }).role === 'admin') return true
      return { id: { equals: user.id } }
    },
    create: isAdmin,
    update: ({ req: { user } }) => {
      if (!user) return false
      if ((user as { role?: string }).role === 'admin') return true
      return { id: { equals: user.id } }
    },
    delete: isAdmin,
  },
  fields: [
    { name: 'name', type: 'text', label: 'Nombre' },
    {
      name: 'role',
      type: 'select',
      label: 'Rol',
      defaultValue: 'editor',
      required: true,
      options: [
        { label: 'Administrador', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Mercadeo (solo leads)', value: 'leads' },
      ],
      access: { update: ({ req: { user } }) => (user as { role?: string } | null)?.role === 'admin' },
    },
  ],
}

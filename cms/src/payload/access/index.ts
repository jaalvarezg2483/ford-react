import type { Access } from 'payload'

export const anyone: Access = () => true
export const authenticated: Access = ({ req: { user } }) => Boolean(user)
export const isAdmin: Access = ({ req: { user } }) => Boolean(user && (user as { role?: string }).role === 'admin')
export const canManageContent: Access = ({ req: { user } }) =>
  Boolean(user && ['admin', 'editor'].includes((user as { role?: string }).role ?? ''))
export const canManageLeads: Access = ({ req: { user } }) =>
  Boolean(user && ['admin', 'leads'].includes((user as { role?: string }).role ?? ''))

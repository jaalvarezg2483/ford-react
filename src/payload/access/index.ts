import type { Access } from 'payload'

export const anyone: Access = () => true
export const authenticated: Access = ({ req: { user } }) => Boolean(user)
export const isAdmin: Access = ({ req: { user } }) => Boolean(user && (user as { role?: string }).role === 'admin')

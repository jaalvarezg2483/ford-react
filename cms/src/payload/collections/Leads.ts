import type { CollectionConfig } from 'payload'
import { authenticated } from '../access'

/** Toda solicitud enviada desde los formularios del sitio, con el resultado de los envíos. */
export const Leads: CollectionConfig = {
  slug: 'leads',
  labels: { singular: 'Solicitud', plural: 'Solicitudes (leads)' },
  admin: { group: 'Formularios', useAsTitle: 'name', defaultColumns: ['form', 'name', 'email', 'phone', 'createdAt', 'emailStatus'] },
  access: { read: authenticated, create: () => false, update: authenticated, delete: authenticated },
  defaultSort: '-createdAt',
  fields: [
    { type: 'row', fields: [
      { name: 'form', type: 'text', label: 'Formulario', index: true },
      { name: 'path', type: 'text', label: 'Página' },
    ] },
    { type: 'row', fields: [
      { name: 'name', type: 'text', label: 'Nombre' },
      { name: 'email', type: 'email', label: 'Correo' },
      { name: 'phone', type: 'text', label: 'Teléfono' },
    ] },
    // Se guarda tal cual lo envió el formulario, pero en el CMS se ve como tabla de solo lectura.
    { name: 'data', type: 'json', label: 'Datos enviados', admin: { hidden: true } },
    { name: 'dataView', type: 'ui', label: 'Datos enviados', admin: { components: { Field: '/components/admin/LeadDataView#LeadDataView' } } },
    { type: 'row', fields: [
      { name: 'emailTo', type: 'text', label: 'Enviado a' },
      { name: 'emailStatus', type: 'select', options: ['pending', 'sent', 'failed', 'skipped'], defaultValue: 'pending', label: 'Correo' },
      { name: 'salesforceStatus', type: 'select', options: ['n/a', 'sent', 'failed'], defaultValue: 'n/a', label: 'Salesforce' },
    ] },
    { name: 'error', type: 'textarea', label: 'Error' },
  ],
}

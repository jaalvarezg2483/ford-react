import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { azureStorage } from '@payloadcms/storage-azure'
import { es } from '@payloadcms/translations/languages/es'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildConfig, type Plugin } from 'payload'
import sharp from 'sharp'

import { env } from './lib/env'
import { getPoolConfig } from './lib/database'
import { migrations } from '../migrations'
import { Users } from './payload/collections/Users'
import { Media } from './payload/collections/Media'
import { Pages } from './payload/collections/Pages'
import { Sliders } from './payload/collections/Sliders'
import { FamilyTypes } from './payload/collections/FamilyTypes'
import { Families } from './payload/collections/Families'
import { Posts } from './payload/collections/Posts'
import { Leads } from './payload/collections/Leads'
import { Redirects } from './payload/collections/Redirects'
import { Videos } from './payload/collections/Videos'
import { SiteSettings } from './payload/globals/SiteSettings'
import { FormSettings } from './payload/globals/FormSettings'
import { seedFormSettings } from './payload/seed/formSettings'
import { importFordEndpoints } from './payload/endpoints/importFord'

const dirname = path.dirname(fileURLToPath(import.meta.url))

function storagePlugins(): Plugin[] {
  if (env.STORAGE_PROVIDER !== 'azure') return []
  const connectionString = env.AZURE_STORAGE_CONNECTION_STRING
  const containerName = env.AZURE_STORAGE_CONTAINER
  const baseURL = env.AZURE_STORAGE_ACCOUNT_BASEURL
  if (!connectionString || !containerName || !baseURL) {
    throw new Error('STORAGE_PROVIDER=azure requiere AZURE_STORAGE_CONNECTION_STRING, AZURE_STORAGE_CONTAINER y AZURE_STORAGE_ACCOUNT_BASEURL')
  }
  return [azureStorage({ collections: { media: true }, allowContainerCreate: false, baseURL, connectionString, containerName })]
}

export default buildConfig({
  serverURL: env.SERVER_URL,
  admin: {
    user: Users.slug,
    avatar: 'default',
    components: { beforeDashboard: ['/components/admin/ImportFordPanel#ImportFordPanel'] },
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: '· CMS Ford Costa Rica', icons: [{ rel: 'icon', type: 'image/png', url: '/favicon-32x32.png' }] },
  },
  i18n: { fallbackLanguage: 'es', supportedLanguages: { es } },
  collections: [Pages, Sliders, Posts, Videos, Families, FamilyTypes, Media, Leads, Redirects, Users],
  globals: [SiteSettings, FormSettings],
  editor: lexicalEditor(),
  secret: env.PAYLOAD_SECRET || 'ford-cr-local-development-secret-change-me',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: getPoolConfig(),
    migrationDir: path.resolve(dirname, '../migrations'),
    // Producción aplica migraciones versionadas al arrancar; nunca push automático.
    push: false,
    prodMigrations: migrations,
  }),
  email: env.SMTP_HOST && env.SMTP_PASSWORD
    ? nodemailerAdapter({
        defaultFromAddress: env.EMAIL_FROM || 'no-reply@ford.cr',
        defaultFromName: env.EMAIL_FROM_NAME,
        transportOptions: {
          host: env.SMTP_HOST,
          port: env.SMTP_PORT,
          secure: env.SMTP_PORT === 465,
          auth: { user: env.SMTP_USER || 'apikey', pass: env.SMTP_PASSWORD },
        },
      })
    : undefined,
  sharp,
  plugins: storagePlugins(),
  graphQL: { disable: true },
  endpoints: importFordEndpoints,
  onInit: async (payload) => {
    await seedFormSettings(payload).catch((error) => payload.logger.error({ err: error, msg: 'No se pudieron sembrar los destinatarios de formularios' }))
  },
})

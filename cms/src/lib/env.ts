/** Variables de entorno del servidor. Mismo código para Railway y Azure App Service. */
const empty = (v: string | undefined) => (v && v.trim() !== '' ? v.trim() : undefined)

/** Resolve the site's public origin at runtime so Docker builds remain portable. */
function publicServerURL() {
  const configured = empty(process.env.FORD_PUBLIC_URL)
  const host = empty(process.env.RAILWAY_PUBLIC_DOMAIN) || empty(process.env.WEBSITE_HOSTNAME)
  return (configured || (host ? `https://${host}` : undefined) || (process.env.NODE_ENV === 'production' ? 'https://www.ford.cr' : 'http://localhost:3000')).replace(/\/$/, '')
}

export const env = {
  get NODE_ENV() { return process.env.NODE_ENV || 'development' },
  get SERVER_URL() { return publicServerURL() },
  get PAYLOAD_SECRET() { return empty(process.env.PAYLOAD_SECRET) },
  get DATABASE_URL() { return empty(process.env.DATABASE_URL) || empty(process.env.DATABASE_URI) },
  get DATABASE_AUTH_MODE() { return (empty(process.env.DATABASE_AUTH_MODE) || 'password').toLowerCase() },
  get POSTGRES_HOST() { return empty(process.env.POSTGRES_HOST) },
  get POSTGRES_DATABASE() { return empty(process.env.POSTGRES_DATABASE) },
  get POSTGRES_USER() { return empty(process.env.POSTGRES_USER) },
  get PG_POOL_MAX() {
    const configured = empty(process.env.PG_POOL_MAX)
    if (configured) return Number(configured)
    const host = empty(process.env.WEBSITE_HOSTNAME) || ''
    return /-staging\.azurewebsites\.net$/i.test(host) ? 5 : 10
  },
  get ENTRA_CLIENT_ID() { return empty(process.env.ENTRA_CLIENT_ID) || '83d51db3-ef40-4a05-ac40-1d01e3b6a926' },
  get ENTRA_TENANT_ID() { return empty(process.env.ENTRA_TENANT_ID) },
  get ENTRA_MANAGED_IDENTITY_CLIENT_ID() { return empty(process.env.ENTRA_MANAGED_IDENTITY_CLIENT_ID) },
  get ENTRA_BOOTSTRAP_ADMIN_EMAILS() {
    return (empty(process.env.ENTRA_BOOTSTRAP_ADMIN_EMAILS) || '').split(',').map((email) => email.trim().toLowerCase()).filter(Boolean)
  },
  get ENTRA_ENABLED() {
    return Boolean(this.ENTRA_CLIENT_ID && this.ENTRA_TENANT_ID && this.ENTRA_MANAGED_IDENTITY_CLIENT_ID && this.ENTRA_BOOTSTRAP_ADMIN_EMAILS.length)
  },
  get STORAGE_PROVIDER() { return (empty(process.env.STORAGE_PROVIDER) || 'local').toLowerCase() },
  get AZURE_STORAGE_CONNECTION_STRING() { return empty(process.env.AZURE_STORAGE_CONNECTION_STRING) },
  get AZURE_STORAGE_CONTAINER() { return empty(process.env.AZURE_STORAGE_CONTAINER) },
  get AZURE_STORAGE_ACCOUNT_BASEURL() { return empty(process.env.AZURE_STORAGE_ACCOUNT_BASEURL) },
  get SMTP_HOST() { return empty(process.env.SMTP_HOST) },
  get SMTP_PORT() { return Number(empty(process.env.SMTP_PORT) || 587) },
  get SMTP_USER() { return empty(process.env.SMTP_USER) },
  get SMTP_PASSWORD() { return empty(process.env.SMTP_PASSWORD) },
  get EMAIL_FROM() { return empty(process.env.EMAIL_FROM) },
  get EMAIL_FROM_NAME() { return empty(process.env.EMAIL_FROM_NAME) || 'Ventas Nuevos' },
  get EMAIL_FROM_NAME_CITAS() { return empty(process.env.EMAIL_FROM_NAME_CITAS) || 'Citas' },
  get EMAIL_OVERRIDE_TO() { return empty(process.env.EMAIL_OVERRIDE_TO) },
  get MICROSERVICES_GATEWAY() { return empty(process.env.MICROSERVICES_GATEWAY) },
  get MICROSERVICES_CLIENT_ID() { return empty(process.env.MICROSERVICES_CLIENT_ID) },
  get MICROSERVICES_CLIENT_SECRET() { return empty(process.env.MICROSERVICES_CLIENT_SECRET) },
  get MICROSERVICES_GRANT_TYPE() { return empty(process.env.MICROSERVICES_GRANT_TYPE) || 'client_credentials' },
  get MICROSERVICES_APPOINTMENT_BRAND() { return empty(process.env.MICROSERVICES_APPOINTMENT_BRAND) || 'ford_citas' },
  get INFORMED_CONSENT_URL() { return empty(process.env.INFORMED_CONSENT_URL) || 'https://consentimiento.grupopurdy.com' },
  get WTLEAD_PATH() { return empty(process.env.WTLEAD_PATH) || 'https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8' },
  get WTLEAD_OID() { return empty(process.env.WTLEAD_OID) || '00DA0000000AGZH' },
  get RECAPTCHA_SITE_KEY() { return empty(process.env.RECAPTCHA_SITE_KEY) },
  get RECAPTCHA_SECRET_KEY() { return empty(process.env.RECAPTCHA_SECRET_KEY) },
  get LEGACY_SITE_URL() { return (empty(process.env.LEGACY_SITE_URL) || 'https://www.ford.cr').replace(/\/$/, '') },
}

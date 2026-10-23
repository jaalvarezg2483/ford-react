import { ManagedIdentityCredential } from '@azure/identity'
import { createRemoteJWKSet, jwtVerify, SignJWT } from 'jose'
import { randomBytes, timingSafeEqual, createHash } from 'node:crypto'
import type { Endpoint, Payload } from 'payload'
import { env } from './env'

const SESSION_COOKIE = 'ford_entra_session'
const STATE_COOKIE = 'ford_entra_state'
const NONCE_COOKIE = 'ford_entra_nonce'
const VERIFIER_COOKIE = 'ford_entra_verifier'
const SESSION_ISSUER = 'ford-cms-entra'
const SESSION_TTL_SECONDS = 8 * 60 * 60
const jwks = () => createRemoteJWKSet(new URL(`https://login.microsoftonline.com/${env.ENTRA_TENANT_ID}/discovery/v2.0/keys`))

type EntraClaims = {
  tid?: string
  nonce?: string
  preferred_username?: string
  email?: string
  upn?: string
  name?: string
}

function configReady() {
  return env.ENTRA_ENABLED && Boolean(env.PAYLOAD_SECRET && env.PAYLOAD_SECRET.length >= 32)
}

function cookies(headers: Headers) {
  return new Map((headers.get('cookie') || '').split(';').map((part) => {
    const index = part.indexOf('=')
    return index < 0 ? ['', ''] : [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1).trim())]
  }))
}

function cookie(name: string, value: string, maxAge: number) {
  return `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`
}

function expiredCookie(name: string) {
  return cookie(name, '', 0)
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && timingSafeEqual(left, right)
}

function redirect(location: string, cookiesToSet: string[] = []) {
  const headers = new Headers({ Location: location, 'Cache-Control': 'no-store' })
  for (const value of cookiesToSet) headers.append('Set-Cookie', value)
  return new Response(null, { status: 302, headers })
}

function clearLoginCookies() {
  return [STATE_COOKIE, NONCE_COOKIE, VERIFIER_COOKIE].map((name) => expiredCookie(name))
}

function loginError() {
  return redirect(new URL('/admin/login?entra_error=1', env.SERVER_URL).toString(), [
    ...clearLoginCookies(),
    expiredCookie(SESSION_COOKIE),
  ])
}

async function upsertAuthorizedUser(payload: Payload, email: string, name: string, bootstrapAdmins: string[]) {
  const found = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
    overrideAccess: true,
  })
  let user = found.docs[0] as Record<string, any> | undefined
  const isBootstrapAdmin = bootstrapAdmins.includes(email)

  if (!user && !isBootstrapAdmin) return null

  if (!user) {
    // Payload requires a password for auth users. Local auth is disabled when
    // Entra is configured; this random value is never returned or persisted in
    // application configuration.
    user = await payload.create({
      collection: 'users',
      overrideAccess: true,
      data: {
        email,
        password: randomBytes(48).toString('base64url'),
        name,
        role: 'admin',
      } as any,
    }) as Record<string, any>
  } else if (isBootstrapAdmin && user.role !== 'admin') {
    user = await payload.update({
      collection: 'users',
      id: user.id,
      overrideAccess: true,
      data: { name: name || user.name, role: 'admin' } as any,
    }) as Record<string, any>
  } else if (name && name !== user.name) {
    user = await payload.update({
      collection: 'users',
      id: user.id,
      overrideAccess: true,
      data: { name } as any,
    }) as Record<string, any>
  }

  return user
}

export async function authenticateEntra({ headers, payload }: { headers: Headers; payload: Payload }) {
  if (!configReady()) return { user: null }
  const token = cookies(headers).get(SESSION_COOKIE)
  if (!token) return { user: null }

  try {
    const { payload: claims } = await jwtVerify(token, new TextEncoder().encode(env.PAYLOAD_SECRET), {
      issuer: SESSION_ISSUER,
      audience: env.ENTRA_CLIENT_ID,
    })
    const id = claims.sub
    if (!id) return { user: null }
    const user = await payload.findByID({ collection: 'users', id, overrideAccess: true })
    return { user: user ? { ...user, collection: 'users', _strategy: 'entra-session' } as any : null }
  } catch {
    return { user: null }
  }
}

export const entraEndpoints: Endpoint[] = configReady() ? [
  {
    path: '/auth/entra/login',
    method: 'get',
    handler: async () => {
      const state = randomBytes(32).toString('base64url')
      const nonce = randomBytes(32).toString('base64url')
      const verifier = randomBytes(48).toString('base64url')
      const challenge = createHash('sha256').update(verifier).digest('base64url')
      const callback = new URL('/api/auth/entra/callback', env.SERVER_URL).toString()
      const authorize = new URL(`https://login.microsoftonline.com/${env.ENTRA_TENANT_ID}/oauth2/v2.0/authorize`)
      authorize.search = new URLSearchParams({
        client_id: env.ENTRA_CLIENT_ID,
        response_type: 'code',
        response_mode: 'query',
        redirect_uri: callback,
        scope: 'openid profile email',
        state,
        nonce,
        code_challenge: challenge,
        code_challenge_method: 'S256',
      }).toString()
      return redirect(authorize.toString(), [
        cookie(STATE_COOKIE, state, 600),
        cookie(NONCE_COOKIE, nonce, 600),
        cookie(VERIFIER_COOKIE, verifier, 600),
      ])
    },
  },
  {
    path: '/auth/entra/callback',
    method: 'get',
    handler: async (req) => {
      const url = new URL(req.url || '', env.SERVER_URL)
      const stored = cookies(req.headers)
      const state = url.searchParams.get('state') || ''
      const expectedState = stored.get(STATE_COOKIE) || ''
      const nonce = stored.get(NONCE_COOKIE) || ''
      const verifier = stored.get(VERIFIER_COOKIE) || ''
      const code = url.searchParams.get('code') || ''
      if (url.searchParams.has('error') || !code || !nonce || !verifier || !safeEqual(state, expectedState)) return loginError()

      try {
        const callback = new URL('/api/auth/entra/callback', env.SERVER_URL).toString()
        const credential = new ManagedIdentityCredential(env.ENTRA_MANAGED_IDENTITY_CLIENT_ID!)
        const assertion = await credential.getToken('api://AzureADTokenExchange/.default')
        if (!assertion) throw new Error('Managed identity did not return a token')

        const tokenResponse = await fetch(`https://login.microsoftonline.com/${env.ENTRA_TENANT_ID}/oauth2/v2.0/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: env.ENTRA_CLIENT_ID,
            grant_type: 'authorization_code',
            code,
            redirect_uri: callback,
            code_verifier: verifier,
            scope: 'openid profile email',
            client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
            client_assertion: assertion.token,
          }),
          cache: 'no-store',
        })
        if (!tokenResponse.ok) throw new Error(`Entra token exchange failed (${tokenResponse.status})`)
        const tokenData = await tokenResponse.json() as { id_token?: string }
        if (!tokenData.id_token) throw new Error('Entra did not return an ID token')

        const { payload: claims } = await jwtVerify(tokenData.id_token, jwks(), {
          issuer: `https://login.microsoftonline.com/${env.ENTRA_TENANT_ID}/v2.0`,
          audience: env.ENTRA_CLIENT_ID,
        })
        const entraClaims = claims as EntraClaims
        if (entraClaims.tid !== env.ENTRA_TENANT_ID || !entraClaims.nonce || !safeEqual(entraClaims.nonce, nonce)) {
          throw new Error('Entra token claims did not match the login request')
        }
        const email = (entraClaims.preferred_username || entraClaims.email || entraClaims.upn || '').trim().toLowerCase()
        if (!email || email.length > 254) throw new Error('Entra account has no usable email')
        const user = await upsertAuthorizedUser(req.payload, email, (entraClaims.name || '').slice(0, 200), env.ENTRA_BOOTSTRAP_ADMIN_EMAILS)
        if (!user) return redirect(new URL('/admin/login?entra_denied=1', env.SERVER_URL).toString(), clearLoginCookies())

        const session = await new SignJWT({ role: user.role })
          .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
          .setSubject(String(user.id))
          .setIssuer(SESSION_ISSUER)
          .setAudience(env.ENTRA_CLIENT_ID)
          .setIssuedAt()
          .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
          .sign(new TextEncoder().encode(env.PAYLOAD_SECRET))

        return redirect(new URL('/admin', env.SERVER_URL).toString(), [
          ...clearLoginCookies(),
          cookie(SESSION_COOKIE, session, SESSION_TTL_SECONDS),
        ])
      } catch (error) {
        req.payload.logger.error({ err: error, msg: 'No se pudo completar el inicio de sesión de Microsoft Entra.' })
        return loginError()
      }
    },
  },
  {
    path: '/auth/entra/logout',
    method: 'post',
    handler: async (req) => {
      const origin = req.headers.get('origin')
      if (origin && origin !== new URL(env.SERVER_URL).origin) return new Response('Forbidden', { status: 403 })
      return redirect(new URL('/admin/login', env.SERVER_URL).toString(), [expiredCookie(SESSION_COOKIE)])
    },
  },
] : []

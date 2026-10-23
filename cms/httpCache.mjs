import { createHash } from 'node:crypto'
import { createGzip } from 'node:zlib'
import { Readable } from 'node:stream'

/** Fotos del 360 llevan ?v=. El navegador las guarda y no vuelve a pegarle al servidor. */
export function publicCacheControl(url, pathname) {
  if (url.searchParams.has('v')) return 'public, max-age=31536000, immutable'
  if (/\.(png|jpe?g|webp|avif|gif|svg|mp4|webm|mov)$/i.test(pathname)) return 'public, max-age=86400'
  return 'no-cache'
}

export function etagOf(body) {
  const data = Buffer.isBuffer(body) ? body : Buffer.from(body)
  return `"${createHash('sha1').update(data).digest('base64url')}"`
}

function compressible(type) {
  return /json|javascript|css|html|text|svg|xml/.test(type)
}

/** Responde 304 si el ETag coincide. Comprime texto cuando el cliente acepta gzip. */
export function sendBody(req, res, status, headers, body) {
  const type = headers['Content-Type'] || ''
  const etag = headers.ETag
  if (etag && req.headers['if-none-match'] === etag) {
    res.writeHead(304, { ETag: etag, 'Cache-Control': headers['Cache-Control'] || 'no-cache' })
    res.end()
    return
  }
  const buf = Buffer.isBuffer(body) ? body : Buffer.from(body)
  if (req.method === 'HEAD') {
    res.writeHead(status, { ...headers, 'Content-Length': buf.length })
    res.end()
    return
  }
  const gzip = compressible(type) && buf.length > 860 && /\bgzip\b/.test(req.headers['accept-encoding'] || '')
  if (!gzip) {
    res.writeHead(status, { ...headers, 'Content-Length': buf.length })
    res.end(buf)
    return
  }
  res.writeHead(status, { ...headers, 'Content-Encoding': 'gzip', Vary: 'Accept-Encoding' })
  Readable.from(buf).pipe(createGzip({ level: 6 })).pipe(res)
}

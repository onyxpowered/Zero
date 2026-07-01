import http   from 'node:http'
import zlib   from 'node:zlib'
import crypto from 'node:crypto'
import type { ManageEvent } from '../Manage/Core/types.js'

export interface CDNOptions {
  publicPort:   number
  upstreams:    number[]          // backend ports to round-robin
  maxCacheMB?:  number            // default 64MB
  emit?:        (e: ManageEvent) => void
}

interface CacheEntry {
  body:        Buffer
  statusCode:  number
  headers:     Record<string, string>
  etag:        string
  size:        number
  hits:        number
}

// ─── LRU cache ────────────────────────────────────────────────────────────────

class AssetCache {
  private map       = new Map<string, CacheEntry>()
  private totalSize = 0
  private readonly  maxSize: number

  constructor(maxMB: number) { this.maxSize = maxMB * 1024 * 1024 }

  get(key: string): CacheEntry | undefined {
    const e = this.map.get(key)
    if (!e) return undefined
    e.hits++
    this.map.delete(key); this.map.set(key, e)  // LRU bump
    return e
  }

  set(key: string, entry: Omit<CacheEntry, 'hits'>): void {
    if (entry.size > this.maxSize * 0.05) return   // skip single files > 5% of cache
    if (this.map.has(key)) { this.totalSize -= this.map.get(key)!.size; this.map.delete(key) }
    while (this.totalSize + entry.size > this.maxSize && this.map.size > 0) {
      const oldest = this.map.keys().next().value!
      this.totalSize -= this.map.get(oldest)!.size
      this.map.delete(oldest)
    }
    this.map.set(key, { ...entry, hits: 0 })
    this.totalSize += entry.size
  }

  delete(key: string): void {
    const e = this.map.get(key)
    if (!e) return
    this.totalSize -= e.size
    this.map.delete(key)
  }

  get entries() { return this.map.size }
  get bytesUsed() { return this.totalSize }
  get mb() { return Math.round(this.totalSize / 1024 / 1024 * 10) / 10 }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isCacheable(pathname: string): boolean {
  return (
    pathname.startsWith('/_next/static/') ||
    pathname.startsWith('/static/')       ||
    /\.(ico|png|jpg|jpeg|gif|webp|svg|woff2|woff|ttf|eot)$/.test(pathname)
  )
}

function cacheControl(pathname: string): string {
  // content-hashed Next.js chunks → cache forever
  if (pathname.startsWith('/_next/static/chunks/') ||
      pathname.startsWith('/_next/static/css/')    ||
      pathname.startsWith('/_next/static/media/'))  return 'public, max-age=31536000, immutable'
  if (/\.(woff2|woff|ttf|eot)$/.test(pathname))   return 'public, max-age=31536000, immutable'
  return 'public, max-age=3600, stale-while-revalidate=86400'
}

function etag(buf: Buffer): string {
  return `"${crypto.createHash('sha1').update(buf).digest('hex').slice(0, 16)}"`
}

function acceptsEncoding(req: http.IncomingMessage, enc: string): boolean {
  return (req.headers['accept-encoding'] ?? '').includes(enc)
}

// ─── CDN server ───────────────────────────────────────────────────────────────

export interface CDNHandle {
  port:     number
  stats:    () => { hits: number; misses: number; ratio: number; cacheMB: number; entries: number }
  close:    () => Promise<void>
}

export async function createCDN(opts: CDNOptions): Promise<CDNHandle> {
  const cache     = new AssetCache(opts.maxCacheMB ?? 64)
  const upstreams = opts.upstreams
  let   rrIdx     = 0
  let   hits      = 0
  let   misses    = 0

  function nextUpstream(): number {
    const port = upstreams[rrIdx % upstreams.length]
    rrIdx++
    return port
  }

  function proxy(
    req:  http.IncomingMessage,
    res:  http.ServerResponse,
    port: number,
    onBody?: (body: Buffer, statusCode: number, headers: http.IncomingHttpHeaders) => void,
  ): void {
    const headers = { ...req.headers, host: `localhost:${port}` }
    delete headers['accept-encoding']  // we handle compression ourselves

    const proxyReq = http.request(
      { hostname: '127.0.0.1', port, path: req.url, method: req.method, headers },
      (proxyRes) => {
        if (onBody) {
          const chunks: Buffer[] = []
          proxyRes.on('data', c => chunks.push(c))
          proxyRes.on('end', () => {
            const body = Buffer.concat(chunks)
            onBody(body, proxyRes.statusCode ?? 200, proxyRes.headers)
          })
        } else {
          res.writeHead(proxyRes.statusCode ?? 200, proxyRes.headers)
          proxyRes.pipe(res)
        }
      },
    )
    proxyReq.on('error', () => { if (!res.headersSent) res.writeHead(502).end('upstream unavailable') })
    req.pipe(proxyReq)
  }

  const server = http.createServer((req, res) => {
    const pathname = (req.url ?? '/').split('?')[0]
    res.setHeader('X-Served-By', 'zero-cdn')

    // only cache GET/HEAD
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      proxy(req, res, nextUpstream())
      return
    }

    if (isCacheable(pathname)) {
      const cached = cache.get(pathname)

      if (cached) {
        hits++
        // ETag check → 304
        if (req.headers['if-none-match'] === cached.etag) {
          res.writeHead(304, { ETag: cached.etag, 'Cache-Control': cacheControl(pathname) })
          res.end()
          return
        }

        // serve from cache, with brotli or gzip if supported
        const cc = cacheControl(pathname)
        if (acceptsEncoding(req, 'br')) {
          zlib.brotliCompress(cached.body, (err, buf) => {
            if (err) { res.writeHead(200, { ...cached.headers, 'Cache-Control': cc, ETag: cached.etag }); res.end(cached.body); return }
            res.writeHead(200, { ...cached.headers, 'Cache-Control': cc, ETag: cached.etag, 'Content-Encoding': 'br', 'Content-Length': String(buf.length) })
            res.end(buf)
          })
        } else if (acceptsEncoding(req, 'gzip')) {
          zlib.gzip(cached.body, (err, buf) => {
            if (err) { res.writeHead(200, { ...cached.headers, 'Cache-Control': cc, ETag: cached.etag }); res.end(cached.body); return }
            res.writeHead(200, { ...cached.headers, 'Cache-Control': cc, ETag: cached.etag, 'Content-Encoding': 'gzip', 'Content-Length': String(buf.length) })
            res.end(buf)
          })
        } else {
          res.writeHead(200, { ...cached.headers, 'Cache-Control': cc, ETag: cached.etag })
          res.end(cached.body)
        }
        return
      }

      // cache miss — fetch from upstream and store
      misses++
      proxy(req, res, upstreams[0], (body, statusCode, upstreamHeaders) => {
        if (statusCode === 200) {
          const safeHeaders: Record<string, string> = {}
          for (const [k, v] of Object.entries(upstreamHeaders)) {
            if (v && !['content-encoding', 'transfer-encoding', 'connection'].includes(k)) {
              safeHeaders[k] = Array.isArray(v) ? v[0] : v
            }
          }
          const tag = etag(body)
          cache.set(pathname, { body, statusCode, headers: safeHeaders, etag: tag, size: body.length })

          const cc = cacheControl(pathname)
          res.writeHead(statusCode, { ...safeHeaders, 'Cache-Control': cc, ETag: tag })
          res.end(body)
        } else {
          res.writeHead(statusCode, upstreamHeaders)
          res.end(body)
        }
      })
      return
    }

    // non-cacheable → proxy with round-robin
    proxy(req, res, nextUpstream())
  })

  await new Promise<void>((resolve, reject) => {
    server.listen(opts.publicPort, () => resolve())
    server.on('error', reject)
  })

  // emit CDN stats every 15s
  const statsInterval = opts.emit ? setInterval(() => {
    const total = hits + misses
    opts.emit!({
      type:     'cdn.stats',
      hits,
      misses,
      ratio:    total > 0 ? Math.round((hits / total) * 100) : 0,
      cacheMB:  cache.mb,
      entries:  cache.entries,
    })
  }, 15_000) : null

  return {
    port: opts.publicPort,
    stats: () => {
      const total = hits + misses
      return { hits, misses, ratio: total > 0 ? Math.round((hits / total) * 100) : 0, cacheMB: cache.mb, entries: cache.entries }
    },
    async close() {
      if (statsInterval) clearInterval(statsInterval)
      await new Promise<void>(r => server.close(() => r()))
    },
  }
}

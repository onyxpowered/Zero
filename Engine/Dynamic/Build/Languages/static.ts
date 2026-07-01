import fs        from 'node:fs'
import path      from 'node:path'
import http      from 'node:http'
import { run }   from '../Internals/run.js'
import type { BuildEngine, BuildResult, BuildOptions } from '../core.js'
import type { Information } from '../../Startup/core.js'

function listFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  const out: string[] = []
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) out.push(...listFiles(full))
    else out.push(full)
  }
  return out
}

const MIME: Record<string, string> = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
  '.woff': 'font/woff', '.ttf': 'font/ttf',
}

export const staticEngine: BuildEngine = {
  name: 'static',

  detect(root) {
    return (
      fs.existsSync(path.join(root, 'index.html')) &&
      !fs.existsSync(path.join(root, 'package.json')) &&
      !fs.existsSync(path.join(root, 'go.mod'))        &&
      !fs.existsSync(path.join(root, 'Gemfile'))        &&
      !fs.existsSync(path.join(root, 'Cargo.toml'))
    )
  },

  async build(root: string, _info: Information, opts?: BuildOptions): Promise<BuildResult> {
    const outDir = opts?.outDir ?? path.join(root, 'dist')
    const steps  = []

    fs.mkdirSync(outDir, { recursive: true })
    steps.push(await run('static', 'copy', `cp -r . "${outDir}"`, { cwd: root }))

    return { engine: 'static', outDir, duration: steps.reduce((s, r) => s + r.duration, 0), files: listFiles(outDir), steps }
  },

  dev(root: string, info: Information): Promise<void> {
    const port = 3000
    const ip   = info.network.local[0] ?? 'localhost'

    const server = http.createServer((req, res) => {
      let filePath = path.join(root, req.url === '/' ? 'index.html' : req.url ?? '/')
      if (!fs.existsSync(filePath)) filePath = path.join(root, 'index.html')
      if (!fs.existsSync(filePath)) { res.writeHead(404).end('not found'); return }
      const ext  = path.extname(filePath)
      const mime = MIME[ext] ?? 'application/octet-stream'
      res.writeHead(200, { 'Content-Type': mime })
      fs.createReadStream(filePath).pipe(res)
    })

    return new Promise((resolve, reject) => {
      server.listen(port, () => {
        console.log(`[zero/build/static] serving → http://${ip}:${port}`)
        console.log(`[zero/build/static] local   → http://localhost:${port}`)
      })
      server.on('error', reject)
      process.on('SIGINT',  () => { server.close(); resolve() })
      process.on('SIGTERM', () => { server.close(); resolve() })
    })
  },
}

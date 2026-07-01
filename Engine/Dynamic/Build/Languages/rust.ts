import fs        from 'node:fs'
import path      from 'node:path'
import { spawn } from 'node:child_process'
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

function binaryName(root: string): string {
  try {
    const toml = fs.readFileSync(path.join(root, 'Cargo.toml'), 'utf8')
    const m    = toml.match(/^\s*name\s*=\s*"([^"]+)"/m)
    if (m?.[1]) return m[1]
  } catch { /* */ }
  return path.basename(root)
}

export const rustEngine: BuildEngine = {
  name: 'rust',

  detect(root) {
    return fs.existsSync(path.join(root, 'Cargo.toml'))
  },

  async build(root: string, _info: Information, opts?: BuildOptions): Promise<BuildResult> {
    const outDir  = opts?.outDir ?? path.join(root, 'dist')
    const binName = binaryName(root)
    const env     = { ...process.env, ...(opts?.env ?? {}) }
    const steps   = []

    steps.push(await run('rust', 'compile', 'cargo build --release', { cwd: root, env }))

    fs.mkdirSync(outDir, { recursive: true })
    const built = path.join(root, 'target', 'release', binName)
    if (fs.existsSync(built)) fs.copyFileSync(built, path.join(outDir, binName))

    return { engine: 'rust', outDir, duration: steps.reduce((s, r) => s + r.duration, 0), files: listFiles(outDir), steps }
  },

  dev(root: string, _info: Information): Promise<void> {
    const child = spawn('cargo', ['run'], { cwd: root, stdio: 'inherit' })
    return new Promise((_, reject) => child.on('exit', code => reject(new Error(`dev exited: ${code}`))))
  },
}

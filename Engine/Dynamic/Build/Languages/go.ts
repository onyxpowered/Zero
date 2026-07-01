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
    const mod  = fs.readFileSync(path.join(root, 'go.mod'), 'utf8')
    const line = mod.split('\n').find(l => l.startsWith('module '))
    if (line) return path.basename(line.replace('module ', '').trim())
  } catch { /* */ }
  return path.basename(root)
}

export const goEngine: BuildEngine = {
  name: 'go',

  detect(root) {
    return fs.existsSync(path.join(root, 'go.mod'))
  },

  async build(root: string, info: Information, opts?: BuildOptions): Promise<BuildResult> {
    const outDir  = opts?.outDir ?? path.join(root, 'dist')
    const binName = binaryName(root)
    const binPath = path.join(outDir, binName)
    const goarch  = info.hardware.cpu.arch === 'arm64' ? 'arm64' : 'amd64'
    const goos    = info.system.platform === 'darwin' ? 'darwin' : 'linux'
    const env     = { ...process.env, GOOS: goos, GOARCH: goarch, ...(opts?.env ?? {}) }
    const steps   = []

    steps.push(await run('go', 'download', 'go mod download', { cwd: root, env }))

    fs.mkdirSync(outDir, { recursive: true })
    steps.push(await run('go', 'compile', `go build -o "${binPath}" .`, { cwd: root, env }))

    return { engine: 'go', outDir, duration: steps.reduce((s, r) => s + r.duration, 0), files: listFiles(outDir), steps }
  },

  dev(root: string, _info: Information): Promise<void> {
    const child = spawn('go', ['run', '.'], { cwd: root, stdio: 'inherit' })
    return new Promise((_, reject) => child.on('exit', code => reject(new Error(`dev exited: ${code}`))))
  },
}

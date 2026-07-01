import fs         from 'node:fs'
import path       from 'node:path'
import { spawn }  from 'node:child_process'
import { run }    from '../Internals/run.js'
import { runScript } from '../Internals/utils.js'
import type { BuildEngine, BuildResult, BuildOptions } from '../core.js'
import type { Information } from '../../Startup/core.js'

void runScript // kept for future script-runner use

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

function pkgManager(root: string): string {
  if (fs.existsSync(path.join(root, 'pnpm-lock.yaml'))) return 'pnpm'
  if (fs.existsSync(path.join(root, 'yarn.lock')))      return 'yarn'
  return 'npm'
}

export const nodeEngine: BuildEngine = {
  name: 'node',

  detect(root) {
    return fs.existsSync(path.join(root, 'package.json'))
  },

  async build(root: string, _info: Information, opts?: BuildOptions): Promise<BuildResult> {
    const outDir = opts?.outDir ?? path.join(root, 'dist')
    const pm     = pkgManager(root)
    const env    = { ...process.env, ...(opts?.env ?? {}) }
    const steps  = []

    steps.push(await run('node', 'install', `${pm} install`, { cwd: root, env }))

    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')) as { scripts?: Record<string, string> }
    if (pkg.scripts?.build) {
      steps.push(await run('node', 'compile', `${pm} run build`, { cwd: root, env }))
    } else if (fs.existsSync(path.join(root, 'tsconfig.json'))) {
      // --incremental: tsc writes .tsbuildinfo and skips unchanged files on subsequent runs
      steps.push(await run('node', 'compile', 'npx tsc --incremental', { cwd: root, env }))
    }

    return { engine: 'node', outDir, duration: steps.reduce((s, r) => s + r.duration, 0), files: listFiles(outDir), steps }
  },

  dev(root: string, _info: Information): Promise<void> {
    const entry = fs.existsSync(path.join(root, 'src', 'index.ts'))
      ? path.join(root, 'src', 'index.ts')
      : 'src/index.js'
    const child = spawn('npx', ['tsx', '--watch', entry], { cwd: root, stdio: 'inherit', shell: true })
    return new Promise((_, reject) => child.on('exit', code => reject(new Error(`dev exited: ${code}`))))
  },
}

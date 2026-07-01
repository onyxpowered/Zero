import fs        from 'node:fs'
import path      from 'node:path'
import { spawn } from 'node:child_process'
import { run, probe } from '../Internals/run.js'
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

function entrypoint(root: string): string {
  for (const c of ['app.rb', 'main.rb', 'server.rb', 'config.ru']) {
    if (fs.existsSync(path.join(root, c))) return c
  }
  throw new Error('[zero/build/ruby] no entrypoint found (app.rb, main.rb, server.rb, config.ru)')
}

function hasBundlerBuildTask(root: string): boolean {
  return !!probe('bundle exec rake -T build', root)
}

export const rubyEngine: BuildEngine = {
  name: 'ruby',

  detect(root) {
    return fs.existsSync(path.join(root, 'Gemfile'))
  },

  async build(root: string, _info: Information, opts?: BuildOptions): Promise<BuildResult> {
    const outDir = opts?.outDir ?? path.join(root, 'dist')
    const env    = { ...process.env, ...(opts?.env ?? {}) }
    const steps  = []

    steps.push(await run('ruby', 'install', 'bundle install --quiet', { cwd: root, env }))

    if (hasBundlerBuildTask(root)) {
      steps.push(await run('ruby', 'compile', 'bundle exec rake build', { cwd: root, env }))
    } else {
      fs.mkdirSync(outDir, { recursive: true })
      steps.push(await run('ruby', 'copy', `cp -r . "${outDir}"`, { cwd: root, env }))
    }

    return { engine: 'ruby', outDir, duration: steps.reduce((s, r) => s + r.duration, 0), files: listFiles(outDir), steps }
  },

  dev(root: string, _info: Information): Promise<void> {
    const entry = entrypoint(root)
    const cmd   = entry === 'config.ru' ? ['bundle', 'exec', 'rackup', '-p', '3000'] : ['ruby', entry]
    const child = spawn(cmd[0]!, cmd.slice(1), { cwd: root, stdio: 'inherit' })
    return new Promise((_, reject) => child.on('exit', code => reject(new Error(`dev exited: ${code}`))))
  },
}

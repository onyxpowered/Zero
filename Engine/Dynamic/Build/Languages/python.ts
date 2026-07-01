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

function pythonBin(root: string): string {
  const venvPy = path.join(root, '.venv', 'bin', 'python')
  if (fs.existsSync(venvPy)) return venvPy
  for (const bin of ['python3', 'python']) {
    if (probe(`${bin} --version`, root)) return bin
  }
  throw new Error('[zero/build/python] python not found — install Python 3 or create a .venv')
}

function entrypoint(root: string): string {
  for (const c of ['main.py', 'app.py', 'server.py', 'src/main.py', 'src/app.py']) {
    if (fs.existsSync(path.join(root, c))) return c
  }
  throw new Error('[zero/build/python] no entrypoint found (main.py, app.py, server.py)')
}

export const pythonEngine: BuildEngine = {
  name: 'python',

  detect(root) {
    return (
      fs.existsSync(path.join(root, 'requirements.txt')) ||
      fs.existsSync(path.join(root, 'pyproject.toml'))   ||
      fs.existsSync(path.join(root, 'setup.py'))
    )
  },

  async build(root: string, _info: Information, opts?: BuildOptions): Promise<BuildResult> {
    const outDir = opts?.outDir ?? path.join(root, 'dist')
    const py     = pythonBin(root)
    const env    = { ...process.env, ...(opts?.env ?? {}) }
    const steps  = []

    if (fs.existsSync(path.join(root, 'requirements.txt'))) {
      steps.push(await run('python', 'install', `${py} -m pip install -r requirements.txt --quiet`, { cwd: root, env }))
    } else if (fs.existsSync(path.join(root, 'pyproject.toml'))) {
      steps.push(await run('python', 'install', `${py} -m pip install -e . --quiet`, { cwd: root, env }))
    }

    fs.mkdirSync(outDir, { recursive: true })
    steps.push(await run('python', 'copy', `cp -r . "${outDir}"`, { cwd: root, env }))

    return { engine: 'python', outDir, duration: steps.reduce((s, r) => s + r.duration, 0), files: listFiles(outDir), steps }
  },

  dev(root: string, _info: Information): Promise<void> {
    const py    = pythonBin(root)
    const entry = entrypoint(root)
    const child = spawn(py, [entry], { cwd: root, stdio: 'inherit' })
    return new Promise((_, reject) => child.on('exit', code => reject(new Error(`dev exited: ${code}`))))
  },
}

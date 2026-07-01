import { spawn, spawnSync, type SpawnSyncOptions, type SpawnOptions } from 'node:child_process'

// ─── Progress bar ─────────────────────────────────────────────────────────────
// Single white pixel bouncing across a fixed-width track.

const BAR_WIDTH = 32

class ProgressBar {
  private frame  = 0
  private timer: NodeJS.Timeout | null = null
  private readonly label: string

  constructor(label: string) { this.label = label }

  start() {
    if (!process.stderr.isTTY) return
    this.timer = setInterval(() => this.tick(), 80)
  }

  private tick() {
    const cycle  = (BAR_WIDTH - 1) * 2
    const pos    = this.frame % cycle
    const bounce = pos < BAR_WIDTH ? pos : cycle - pos
    const bar    = '░'.repeat(bounce) + '█' + '░'.repeat(BAR_WIDTH - bounce - 1)
    process.stderr.write(`\r  ${bar}  ${this.label}`)
    this.frame++
  }

  done(duration: number) {
    if (this.timer) { clearInterval(this.timer); this.timer = null }
    if (!process.stderr.isTTY) return
    const clear = ' '.repeat(BAR_WIDTH + this.label.length + 6)
    process.stderr.write(`\r${clear}\r`)
    process.stderr.write(`  ${'█'.repeat(BAR_WIDTH)}  ${this.label}  ${duration}ms\n`)
  }

  fail() {
    if (this.timer) { clearInterval(this.timer); this.timer = null }
    if (!process.stderr.isTTY) return
    const clear = ' '.repeat(BAR_WIDTH + this.label.length + 6)
    process.stderr.write(`\r${clear}\r`)
  }
}

// ─── Error ────────────────────────────────────────────────────────────────────

export class ZeroBuildError extends Error {
  readonly engine:   string
  readonly step:     string
  readonly command:  string
  readonly exitCode: number
  readonly stdout:   string
  readonly stderr:   string
  readonly hints:    string[]

  constructor(p: { engine: string; step: string; command: string; exitCode: number; stdout: string; stderr: string }) {
    const hints    = deriveHints(p.engine, p.step, p.stderr + p.stdout)
    const hintLine = hints.length ? `\n  hint: ${hints[0]}` : ''
    super(`[zero/build/${p.engine}] ${p.step} failed (exit ${p.exitCode}): ${p.command}${hintLine}`)
    this.name     = 'ZeroBuildError'
    this.engine   = p.engine
    this.step     = p.step
    this.command  = p.command
    this.exitCode = p.exitCode
    this.stdout   = p.stdout
    this.stderr   = p.stderr
    this.hints    = hints
  }
}

// ─── Step record ──────────────────────────────────────────────────────────────

export interface StepRecord {
  step:     string
  command:  string
  duration: number
  exitCode: number
  stdout:   string
  stderr:   string
}

// ─── run() — async, streams progress bar, captures output ────────────────────

export function run(
  engine:  string,
  step:    string,
  command: string,
  opts:    Omit<SpawnOptions, 'stdio'> & { cwd: string }
): Promise<StepRecord> {
  const bar   = new ProgressBar(step)
  const start = Date.now()

  bar.start()

  return new Promise((resolve, reject) => {
    const proc = spawn(command, { ...opts, shell: true, stdio: ['ignore', 'pipe', 'pipe'] })

    const outChunks: Buffer[] = []
    const errChunks: Buffer[] = []

    proc.stdout?.on('data', (c: Buffer) => outChunks.push(c))
    proc.stderr?.on('data', (c: Buffer) => errChunks.push(c))

    proc.on('close', (code) => {
      const duration = Date.now() - start
      const stdout   = Buffer.concat(outChunks).toString('utf8')
      const stderr   = Buffer.concat(errChunks).toString('utf8')
      const exitCode = code ?? 1

      if (exitCode !== 0) {
        bar.fail()
        reject(new ZeroBuildError({ engine, step, command, exitCode, stdout, stderr }))
      } else {
        bar.done(duration)
        resolve({ step, command, duration, exitCode: 0, stdout, stderr })
      }
    })

    proc.on('error', (err) => {
      bar.fail()
      reject(new ZeroBuildError({ engine, step, command, exitCode: -1, stdout: '', stderr: err.message }))
    })
  })
}

// ─── probe() — sync, no bar, for version checks and detection ─────────────────

export function probe(command: string, cwd: string): string {
  const r = spawnSync(command, {
    shell: true, cwd, encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'] as SpawnSyncOptions['stdio'],
    timeout: 5000,
  })
  if (r.status !== 0 || r.error) return ''
  return (r.stdout ?? '').trim()
}

// ─── Hints ────────────────────────────────────────────────────────────────────

function deriveHints(engine: string, step: string, output: string): string[] {
  const hints: string[] = []
  const o = output.toLowerCase()

  if (o.includes('eacces') || o.includes('permission denied'))
    hints.push('permission denied — check directory ownership or run with the correct user')
  if (o.includes('enotfound') || o.includes('etimedout') || o.includes('econnrefused'))
    hints.push('network unreachable — check internet connection or registry/proxy settings')
  if (o.includes('enospc') || o.includes('no space left'))
    hints.push('disk full — free space and retry')

  if (engine === 'node') {
    if (step === 'install') {
      if (o.includes('peer dep') || o.includes('missing peer'))
        hints.push('peer dependency conflict — try --legacy-peer-deps or resolve the version mismatch')
      if (o.includes('e404') || (o.includes('not found') && o.includes('npm')))
        hints.push('package not found on registry — check spelling and registry config')
      if (o.includes('workspace:'))
        hints.push('workspace: protocol detected — this project may require pnpm')
      if (o.includes('err_invalid_package_name'))
        hints.push('invalid package name in package.json')
    }
    if (step === 'compile') {
      if (o.includes('cannot find module') || o.includes('module not found'))
        hints.push('missing module — run install first or check import paths')
      if (o.includes('error ts') || o.includes("': error"))
        hints.push('TypeScript errors above — fix type errors before building')
      if (o.includes('next') && o.includes('error'))
        hints.push('Next.js build failed — check pages for runtime errors or bad imports')
    }
  }

  if (engine === 'python') {
    if (step === 'install') {
      if (o.includes('externally-managed-environment'))
        hints.push('system Python is managed — create a venv: python -m venv .venv && source .venv/bin/activate')
      if (o.includes('no module named pip'))
        hints.push('pip not installed — run: python -m ensurepip --upgrade')
      if (o.includes('could not find a version'))
        hints.push('package version not found — check requirements.txt constraints')
    }
    if (step === 'compile')
      if (o.includes('syntaxerror'))
        hints.push('Python syntax error — check the file and line number above')
  }

  if (engine === 'go') {
    if (step === 'download') {
      if (o.includes("'go' not found") || o.includes('go: command not found'))
        hints.push('Go not installed — install from https://go.dev/dl')
      if (o.includes('410 gone') || o.includes('module not found'))
        hints.push('Go module not found — check go.mod path or proxy.golang.org access')
    }
    if (step === 'compile') {
      if (o.includes('build constraints'))
        hints.push('build constraint mismatch — check //go:build tags for target OS/arch')
      if (o.includes('undefined:') || o.includes('undeclared name'))
        hints.push('undefined symbol — missing import or wrong package name')
    }
  }

  if (engine === 'rust') {
    if (step === 'compile') {
      if (o.includes('could not compile') || o.includes('error[e'))
        hints.push('rustc errors above — run `cargo check` locally for faster feedback')
      if (o.includes('linker') || o.includes('link.exe'))
        hints.push('linker error — install build tools (Xcode CLT on macOS, build-essential on Linux)')
      if (o.includes("'cargo' not found") || o.includes('cargo: command not found'))
        hints.push('Rust not installed — install from https://rustup.rs')
    }
  }

  if (engine === 'ruby') {
    if (step === 'install') {
      if (o.includes("'bundle' not found") || o.includes('bundler not found'))
        hints.push('Bundler not installed — run: gem install bundler')
      if (o.includes('gemspec') && o.includes('not found'))
        hints.push('.gemspec missing or misnamed — check Gemfile source reference')
    }
  }

  return hints
}

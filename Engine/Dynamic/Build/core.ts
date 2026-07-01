import path from 'node:path'
import fs   from 'node:fs'
import type { ManageHandle } from '../Manage/Core/core.js'
import { detectFrameworkWithEngine } from './detect.js'
import { nodeEngine }   from './Languages/node.js'
import { pythonEngine } from './Languages/python.js'
import { goEngine }     from './Languages/go.js'
import { rubyEngine }   from './Languages/ruby.js'
import { rustEngine }   from './Languages/rust.js'
import { staticEngine } from './Languages/static.js'
import { computeCacheKey, getCached, restoreCache, saveCache } from './cache.js'
import type { Information } from '../Startup/core.js'
import type { ZeroEngineName } from './Internals/types.js'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BuildOptions {
  outDir?:   string
  env?:      Record<string, string>
  noCache?:  boolean
}

export interface BuildResult {
  engine:    string
  outDir:    string
  duration:  number
  files:     string[]
  steps:     import('./Internals/run.js').StepRecord[]
  cached?:   boolean
  cacheKey?: string
}

export interface BuildEngine {
  name:   ZeroEngineName | string
  detect: (root: string) => boolean | Promise<boolean>
  build:  (root: string, info: Information, opts?: BuildOptions) => Promise<BuildResult>
  dev?:   (root: string, info: Information) => Promise<void>
}

// ─── Registry ─────────────────────────────────────────────────────────────────
// Keyed by ZeroEngineName for O(1) lookup from framework detection.
// External engines registered via register() are also added here.

const engineMap: Map<string, BuildEngine> = new Map([
  ['node',   nodeEngine],
  ['python', pythonEngine],
  ['go',     goEngine],
  ['ruby',   rubyEngine],
  ['rust',   rustEngine],
  ['static', staticEngine],
])

export function register(engine: BuildEngine): void {
  engineMap.set(engine.name, engine)
}

// ─── Manage wiring ────────────────────────────────────────────────────────────

let _manage: ManageHandle | null = null
export function setManage(h: ManageHandle): void { _manage = h }

// ─── Detection ────────────────────────────────────────────────────────────────

export async function detect(root: string): Promise<{ engine: BuildEngine; framework: string | null } | null> {
  // Single pass: framework detection returns both slug and declared engine name.
  // Falls back to file-based engine detection if no framework matched.
  const match = await detectFrameworkWithEngine(root)

  if (match?.engineName) {
    const engine = engineMap.get(match.engineName)
    if (engine) return { engine, framework: match.slug }
  }

  // Framework didn't declare an engine (or no framework matched) —
  // fall back to file-based detection in priority order.
  const fallbackOrder: ZeroEngineName[] = ['rust', 'go', 'ruby', 'python', 'node', 'static']
  for (const name of fallbackOrder) {
    const engine = engineMap.get(name)!
    if (await engine.detect(root)) return { engine, framework: match?.slug ?? null }
  }

  return null
}

// ─── Operations ───────────────────────────────────────────────────────────────

export async function build(root: string, info: Information, opts?: BuildOptions): Promise<BuildResult> {
  const found = await detect(root)
  if (!found) throw new Error(`[zero/build] no engine detected for: ${root}`)

  const { engine, framework } = found
  console.log(`[zero/build] engine    → ${engine.name}`)
  if (framework) console.log(`[zero/build] framework → ${framework}`)

  const outDir  = opts?.outDir ?? path.join(root, 'dist')
  const appName = path.basename(path.dirname(root))
  const part    = path.basename(root).toLowerCase()

  if (!opts?.noCache) {
    const key    = computeCacheKey(root, engine.name)
    const cached = getCached(key)
    if (cached) {
      const age      = Math.round((Date.now() - cached.timestamp) / 1000)
      const stepLine = cached.steps.map(s => `${s.step} ${s.duration}ms`).join(' · ')
      console.log(`[zero/build] cache hit  → ${key.slice(0, 8)} (${age}s ago · ${stepLine || cached.duration + 'ms total'})`)
      const files = restoreCache(key, outDir)
      _manage?.emit({ type: 'build.done', app: appName, part, engine: engine.name, duration: cached.duration, cached: true, files: files.length, cacheKey: key })
      return { engine: engine.name, outDir, duration: cached.duration, files, steps: cached.steps.map(s => ({ ...s, exitCode: 0, stdout: '', stderr: '' })), cached: true, cacheKey: key }
    }
    console.log(`[zero/build] cache miss → ${key.slice(0, 8)}`)
    _manage?.emit({ type: 'build.start', app: appName, part, engine: engine.name, cacheKey: key })

    const start  = Date.now()
    let result: BuildResult
    try {
      result = await engine.build(root, info, { ...opts, outDir })
    } catch (err: unknown) {
      const e = err as { engine?: string; step?: string; exitCode?: number; hints?: string[] }
      _manage?.emit({ type: 'build.error', app: appName, part, engine: engine.name, step: e.step ?? 'unknown', exitCode: e.exitCode ?? -1, hints: e.hints ?? [] })
      throw err
    }
    const duration = Date.now() - start
    const stepLine = result.steps.map(s => `${s.step} ${s.duration}ms`).join(' · ')
    console.log(`[zero/build] built in ${duration}ms  [${stepLine}]  → ${result.files.length} files`)

    try {
      saveCache(key, { engine: engine.name, outDir: result.outDir, duration, files: result.files, steps: result.steps.map(({ step, command, duration }) => ({ step, command, duration })), timestamp: Date.now() }, result.outDir)
      console.log(`[zero/build] cached    → ${key.slice(0, 8)}`)
    } catch (err) {
      console.warn(`[zero/build] cache save failed: ${(err as Error).message}`)
    }

    _manage?.emit({ type: 'build.done', app: appName, part, engine: engine.name, duration, cached: false, files: result.files.length, cacheKey: key })
    return { ...result, cached: false, cacheKey: key }
  }

  _manage?.emit({ type: 'build.start', app: appName, part, engine: engine.name, cacheKey: '' })
  const start  = Date.now()
  const result = await engine.build(root, info, opts)
  const duration = Date.now() - start
  console.log(`[zero/build] done in ${duration}ms  [${result.steps.map(s => `${s.step} ${s.duration}ms`).join(' · ')}]  → ${result.files.length} files`)
  _manage?.emit({ type: 'build.done', app: appName, part, engine: engine.name, duration, cached: false, files: result.files.length, cacheKey: '' })
  return result
}

export async function dev(root: string, info: Information): Promise<void> {
  const found = await detect(root)
  if (!found) throw new Error(`[zero/build] no engine detected for: ${root}`)

  const { engine, framework } = found
  console.log(`[zero/build] engine    → ${engine.name}`)
  if (framework) console.log(`[zero/build] framework → ${framework}`)

  if (!engine.dev) throw new Error(`[zero/build] engine ${engine.name} does not support dev mode`)
  await engine.dev(root, info)
}

// ─── App build (task graph) ───────────────────────────────────────────────────
// Detects Zero app structure (Frontend/ Backend/) and builds in dependency order.
// Backend first — it may export types that Frontend imports.

export interface AppPartResult {
  name:   string
  result: BuildResult
}

export interface AppBuildResult {
  app:      string
  parts:    AppPartResult[]
  duration: number
}

export function isZeroApp(dir: string): boolean {
  return (
    fs.existsSync(path.join(dir, 'Frontend')) ||
    fs.existsSync(path.join(dir, 'Backend'))
  )
}

export async function buildApp(appDir: string, info: Information, opts?: BuildOptions): Promise<AppBuildResult> {
  const start = Date.now()
  const parts: AppPartResult[] = []

  for (const name of ['Backend', 'Frontend'] as const) {
    const dir = path.join(appDir, name)
    if (!fs.existsSync(dir)) continue
    console.log(`\n[zero/build] ── ${name} ──`)
    const result = await build(dir, info, opts)
    parts.push({ name, result })
  }

  return { app: path.basename(appDir), parts, duration: Date.now() - start }
}

// ─── Init ─────────────────────────────────────────────────────────────────────

export async function init(info: Information): Promise<void> {
  console.log(`[zero/build] ready · ${engineMap.size} engines (${[...engineMap.keys()].join(' · ')})`)
  void info
}

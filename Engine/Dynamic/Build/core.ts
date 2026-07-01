import type { Information } from '../Startup/core.js'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BuildEngine {
  name:    string
  detect:  (root: string) => boolean | Promise<boolean>
  build:   (root: string, info: Information, opts?: BuildOptions) => Promise<BuildResult>
  dev?:    (root: string, info: Information) => Promise<void>
}

export interface BuildOptions {
  outDir?: string
  env?:    Record<string, string>
}

export interface BuildResult {
  engine:   string
  outDir:   string
  duration: number
  files:    string[]
}

// ─── Registry ─────────────────────────────────────────────────────────────────

const engines: BuildEngine[] = []

export function register(engine: BuildEngine): void {
  engines.push(engine)
}

export async function detect(root: string): Promise<BuildEngine | null> {
  for (const e of engines) {
    if (await e.detect(root)) return e
  }
  return null
}

// ─── Operations ───────────────────────────────────────────────────────────────

export async function build(root: string, info: Information, opts?: BuildOptions): Promise<BuildResult> {
  const engine = await detect(root)
  if (!engine) throw new Error(`[zero/build] no engine detected for: ${root}`)
  console.log(`[zero/build] engine → ${engine.name}`)
  const start = Date.now()
  const result = await engine.build(root, info, opts)
  console.log(`[zero/build] done in ${Date.now() - start}ms`)
  return result
}

export async function dev(root: string, info: Information): Promise<void> {
  const engine = await detect(root)
  if (!engine) throw new Error(`[zero/build] no engine detected for: ${root}`)
  if (!engine.dev) throw new Error(`[zero/build] engine ${engine.name} does not support dev mode`)
  await engine.dev(root, info)
}

// ─── Init ─────────────────────────────────────────────────────────────────────

export async function init(info: Information): Promise<void> {
  console.log(`[zero/build] ready · ${engines.length} engine(s) registered`)
  void info
}

import crypto    from 'node:crypto'
import fs        from 'node:fs'
import path      from 'node:path'
import os        from 'node:os'
import { spawnSync } from 'node:child_process'

const CACHE_DIR     = path.join(os.homedir(), '.zero', 'cache')
const CACHE_VERSION = '1'

const SKIP_DIRS = new Set([
  'node_modules', 'dist', '.git', '.next', '.turbo', '.cache', '.parcel-cache',
  'target',                    // Rust
  'vendor',                    // Go
  '.venv', '__pycache__',      // Python
  '.bundle',                   // Ruby
])

export interface StepSummary {
  step:     string
  command:  string
  duration: number
}

export interface CacheMeta {
  key:       string
  engine:    string
  outDir:    string
  duration:  number
  files:     string[]
  steps:     StepSummary[]
  timestamp: number
  platform:  string
}

// ─── Tool version detection ───────────────────────────────────────────────────

const versionCommands: Record<string, string> = {
  node:   'node --version',
  python: 'python3 --version 2>&1 || python --version 2>&1',
  go:     'go version',
  ruby:   'ruby --version',
  rust:   'rustc --version',
  static: '',
}

const versionMemo = new Map<string, string>()

function toolVersion(engine: string): string {
  if (versionMemo.has(engine)) return versionMemo.get(engine)!
  const cmd = versionCommands[engine] ?? ''
  if (!cmd) { versionMemo.set(engine, 'n/a'); return 'n/a' }
  try {
    const r = spawnSync(cmd, { shell: true, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 4000 })
    const v = ((r.stdout ?? '') + (r.stderr ?? '')).trim().split('\n')[0] ?? 'unknown'
    versionMemo.set(engine, v)
    return v
  } catch {
    versionMemo.set(engine, 'unknown')
    return 'unknown'
  }
}

// ─── Key ──────────────────────────────────────────────────────────────────────

export function computeCacheKey(root: string, engineName: string): string {
  const hash = crypto.createHash('sha256')
  hash.update(`zero-cache-v${CACHE_VERSION}\0`)
  hash.update(`engine:${engineName}\0`)
  hash.update(`platform:${process.platform}/${process.arch}\0`)
  hash.update(`tool:${toolVersion(engineName)}\0`)

  for (const file of walkFiles(root).sort()) {
    hash.update(`\0${path.relative(root, file)}\0`)
    hash.update(fs.readFileSync(file))
  }

  return hash.digest('hex').slice(0, 40)
}

function walkFiles(dir: string): string[] {
  const out: string[] = []
  let entries: fs.Dirent[]
  try { entries = fs.readdirSync(dir, { withFileTypes: true }) } catch { return out }
  for (const e of entries) {
    if (SKIP_DIRS.has(e.name) || e.isSymbolicLink()) continue
    const full = path.join(dir, e.name)
    if (e.isDirectory()) out.push(...walkFiles(full))
    else if (e.isFile()) out.push(full)
  }
  return out
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export function getCached(key: string): CacheMeta | null {
  const metaPath   = path.join(CACHE_DIR, key, 'meta.json')
  const outputPath = path.join(CACHE_DIR, key, 'output')
  if (!fs.existsSync(metaPath) || !fs.existsSync(outputPath)) return null
  try {
    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8')) as CacheMeta
    fs.utimesSync(metaPath, new Date(), new Date()) // touch for LRU
    return meta
  } catch { return null }
}

export function restoreCache(key: string, outDir: string): string[] {
  if (fs.existsSync(outDir)) fs.rmSync(outDir, { recursive: true })
  copyDir(path.join(CACHE_DIR, key, 'output'), outDir)
  return listFiles(outDir)
}

// ─── Write ────────────────────────────────────────────────────────────────────

export function saveCache(
  key:    string,
  meta:   Omit<CacheMeta, 'key' | 'platform' | 'steps'> & { steps?: StepSummary[] },
  outDir: string
): void {
  const cacheDir = path.join(CACHE_DIR, key)
  fs.mkdirSync(cacheDir, { recursive: true })
  copyDir(outDir, path.join(cacheDir, 'output'))
  fs.writeFileSync(
    path.join(cacheDir, 'meta.json'),
    JSON.stringify({ key, platform: `${process.platform}/${process.arch}`, steps: [], ...meta }, null, 2),
    'utf8'
  )
}

// ─── Management ───────────────────────────────────────────────────────────────

export function clearCache(key?: string): void {
  const target = key ? path.join(CACHE_DIR, key) : CACHE_DIR
  if (fs.existsSync(target)) fs.rmSync(target, { recursive: true })
}

export function getCacheStats(): { entries: number; sizeMB: number } {
  if (!fs.existsSync(CACHE_DIR)) return { entries: 0, sizeMB: 0 }
  let entries = 0
  let bytes   = 0
  for (const e of fs.readdirSync(CACHE_DIR, { withFileTypes: true })) {
    if (e.isDirectory()) { entries++; bytes += dirSize(path.join(CACHE_DIR, e.name)) }
  }
  return { entries, sizeMB: Math.round((bytes / 1024 / 1024) * 100) / 100 }
}

export function listCacheEntries(): CacheMeta[] {
  if (!fs.existsSync(CACHE_DIR)) return []
  const entries: CacheMeta[] = []
  for (const e of fs.readdirSync(CACHE_DIR, { withFileTypes: true })) {
    if (!e.isDirectory()) continue
    const meta = getCached(e.name)
    if (meta) entries.push(meta)
  }
  return entries.sort((a, b) => b.timestamp - a.timestamp)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// On macOS use APFS copy-on-write clone (-c flag) — instant regardless of size.
// On Linux fall back to node recursive copy.
function copyDir(src: string, dst: string): void {
  if (!fs.existsSync(src)) return
  if (process.platform === 'darwin') {
    fs.mkdirSync(path.dirname(dst), { recursive: true })
    // cp -rc: recursive + clone. src/. copies contents into dst.
    spawnSync(`cp -rc "${src}/." "${dst}"`, {
      shell: true, stdio: 'ignore',
    })
  } else {
    copyDirNode(src, dst)
  }
}

function copyDirNode(src: string, dst: string): void {
  if (!fs.existsSync(src)) return
  fs.mkdirSync(dst, { recursive: true })
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name)
    const d = path.join(dst, e.name)
    if (e.isDirectory()) copyDirNode(s, d)
    else fs.copyFileSync(s, d)
  }
}

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

function dirSize(dir: string): number {
  let size = 0
  try {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name)
      size += e.isDirectory() ? dirSize(full) : fs.statSync(full).size
    }
  } catch { /* skip unreadable */ }
  return size
}

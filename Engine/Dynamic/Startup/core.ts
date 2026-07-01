import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os   from 'node:os'
import fs   from 'node:fs'
import si   from 'systeminformation'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RouterInfo {
  cwd:           string
  projectRoot:   string
  workspaceRoot: string
  zeroRoot:      string
  dataDir:       string
  appName:       string
}

export interface HardwareInfo {
  cpu:  { brand: string; cores: number; physicalCores: number; speedGHz: number; loadPercent: number; arch: string }
  ram:  { totalGB: number; freeGB: number; usedGB: number; percentUsed: number }
  gpu:  { controllers: Array<{ vendor: string; model: string; vramMB: number }> }
  disk: { totalGB: number; freeGB: number; usedGB: number; percentUsed: number }
}

export interface SystemInfo {
  platform:    string
  hostname:    string
  username:    string
  homeDir:     string
  nodeVersion: string
}

export interface NetworkInfo {
  local:      string[]
  interfaces: Record<string, string[]>
}

export interface CompatInfo {
  passes:   boolean
  failures: string[]
  warnings: string[]
}

export interface ZeroConfig {
  plugPort: number
  throttle: {
    ram:            { warning: number; critical: number }
    cpu:            { warning: number; critical: number }
    disk:           { warning: number; critical: number }
    pollIntervalMs: number
  }
}

export interface Information {
  version:   string
  timestamp: number
  router:    RouterInfo
  hardware:  HardwareInfo
  system:    SystemInfo
  network:   NetworkInfo
  compat:    CompatInfo
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const VERSION   = '0.1.0'
export const ZERO_DIR  = path.join(os.homedir(), '.zero')
export const PLUG_PORT = 7770

export const defaultConfig: ZeroConfig = {
  plugPort: PLUG_PORT,
  throttle: {
    ram:  { warning: 80, critical: 90 },
    cpu:  { warning: 70, critical: 85 },
    disk: { warning: 85, critical: 95 },
    pollIntervalMs: 10_000,
  },
}

const toGB = (b: number) => Math.round((b / 1024 ** 3) * 100) / 100

// ─── Router ───────────────────────────────────────────────────────────────────

function locate(cwd: string): RouterInfo {
  const projectRoot   = walkUp(cwd, 'package.json')
  const workspaceRoot = walkUpOpt(projectRoot, 'pnpm-workspace.yaml') ?? projectRoot
  const zeroRoot      = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..')
  const dataDir       = ZERO_DIR
  const appName       = readName(projectRoot)
  return { cwd, projectRoot, workspaceRoot, zeroRoot, dataDir, appName }
}

function walkUp(from: string, marker: string): string {
  let dir = from
  while (true) {
    if (fs.existsSync(path.join(dir, marker))) return dir
    const parent = path.dirname(dir)
    if (parent === dir) throw new Error(`[zero/startup] ${marker} not found above ${from}`)
    dir = parent
  }
}

function walkUpOpt(from: string, marker: string): string | null {
  let dir = from
  while (true) {
    if (fs.existsSync(path.join(dir, marker))) return dir
    const parent = path.dirname(dir)
    if (parent === dir) return null
    dir = parent
  }
}

function readName(dir: string): string {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8')) as { name?: string }
    return pkg.name ?? path.basename(dir)
  } catch {
    return path.basename(dir)
  }
}

// ─── Hardware ─────────────────────────────────────────────────────────────────

export async function profileHardware(): Promise<HardwareInfo> {
  const [mem, cpu, load, graphics, disks] = await Promise.all([
    si.mem(), si.cpu(), si.currentLoad(), si.graphics(), si.fsSize(),
  ])
  const disk = disks[0] ?? { size: 0, used: 0, available: 0 }
  return {
    cpu: {
      brand: cpu.brand, cores: cpu.cores, physicalCores: cpu.physicalCores,
      speedGHz: cpu.speed, loadPercent: Math.round(load.currentLoad), arch: process.arch,
    },
    ram: {
      totalGB: toGB(mem.total), usedGB: toGB(mem.used), freeGB: toGB(mem.available),
      percentUsed: Math.round(((mem.total - mem.available) / mem.total) * 100),
    },
    gpu: {
      controllers: graphics.controllers.map(g => ({ vendor: g.vendor, model: g.model, vramMB: g.vram ?? 0 })),
    },
    disk: {
      totalGB: toGB(disk.size), usedGB: toGB(disk.used),
      freeGB:  toGB((disk as { available?: number }).available ?? disk.size - disk.used),
      percentUsed: disk.size > 0 ? Math.round((disk.used / disk.size) * 100) : 0,
    },
  }
}

// ─── System ───────────────────────────────────────────────────────────────────

function getSystem(): SystemInfo {
  return {
    platform:    process.platform,
    hostname:    os.hostname(),
    username:    os.userInfo().username,
    homeDir:     os.homedir(),
    nodeVersion: process.versions.node,
  }
}

// ─── Network ──────────────────────────────────────────────────────────────────

function getNetwork(): NetworkInfo {
  const ifaces                               = os.networkInterfaces()
  const local: string[]                      = []
  const interfaces: Record<string, string[]> = {}

  for (const [name, addrs] of Object.entries(ifaces)) {
    if (!addrs) continue
    const ips = addrs.filter(a => !a.internal).map(a => a.address)
    if (ips.length === 0) continue
    interfaces[name] = ips
    local.push(...ips)
  }

  return { local, interfaces }
}

// ─── Compat ───────────────────────────────────────────────────────────────────

const MIN = { nodeVersion: 18, physicalCores: 2, freeRamGB: 0.5 }

function checkCompat(hw: HardwareInfo): CompatInfo {
  const failures: string[] = []
  const warnings: string[] = []

  const nodeMajor = parseInt(process.versions.node.split('.')[0], 10)
  if (nodeMajor < MIN.nodeVersion)               failures.push(`Node v${MIN.nodeVersion}+ required — found v${process.versions.node}`)
  if (hw.cpu.physicalCores < MIN.physicalCores)  failures.push(`${MIN.physicalCores} physical cores required — found ${hw.cpu.physicalCores}`)
  if (hw.ram.freeGB < MIN.freeRamGB)             failures.push(`${MIN.freeRamGB}GB free RAM required — found ${hw.ram.freeGB}GB`)
  if (hw.ram.totalGB < 4)                        warnings.push(`low total RAM: ${hw.ram.totalGB}GB`)
  if (hw.gpu.controllers.length === 0)           warnings.push('no GPU detected')

  return { passes: failures.length === 0, failures, warnings }
}

// ─── Config ───────────────────────────────────────────────────────────────────

async function loadConfig(projectRoot: string, override?: Partial<ZeroConfig>): Promise<ZeroConfig> {
  const candidates = [
    path.join(projectRoot, 'zero.config.ts'),
    path.join(projectRoot, 'zero.config.js'),
    path.join(projectRoot, 'zero.config.mjs'),
  ]

  let fileConfig: Partial<ZeroConfig> | undefined
  for (const c of candidates) {
    if (!fs.existsSync(c)) continue
    try {
      const mod = await import(c)
      const raw = mod.default ?? mod
      fileConfig = typeof raw === 'function' ? (raw as () => Partial<ZeroConfig>)() : raw
      break
    } catch { /* non-fatal — use defaults */ }
  }

  return mergeConfig(defaultConfig, fileConfig ?? {}, override ?? {})
}

function mergeConfig(base: ZeroConfig, ...overrides: Partial<ZeroConfig>[]): ZeroConfig {
  let cfg = base
  for (const o of overrides) {
    cfg = {
      plugPort: o.plugPort ?? cfg.plugPort,
      throttle: {
        ...cfg.throttle, ...o.throttle,
        ram:  { ...cfg.throttle.ram,  ...o.throttle?.ram  },
        cpu:  { ...cfg.throttle.cpu,  ...o.throttle?.cpu  },
        disk: { ...cfg.throttle.disk, ...o.throttle?.disk },
      },
    }
  }
  return cfg
}

// ─── Write / Read ─────────────────────────────────────────────────────────────

export function writeInformation(info: Information): void {
  const startupDir = path.dirname(fileURLToPath(import.meta.url))
  const json       = JSON.stringify(info, null, 2)

  fs.writeFileSync(path.join(startupDir, 'information.json'), json, 'utf8')

  fs.mkdirSync(ZERO_DIR, { recursive: true })
  fs.writeFileSync(path.join(ZERO_DIR, 'information.json'), json, 'utf8')
}

export function readInformation(dir?: string): Information | null {
  const file = path.join(dir ?? ZERO_DIR, 'information.json')
  if (!fs.existsSync(file)) return null
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) as Information } catch { return null }
}

// ─── Boot ─────────────────────────────────────────────────────────────────────

export async function boot(configOverride?: Partial<ZeroConfig>): Promise<{ info: Information; config: ZeroConfig }> {
  console.log('[zero] starting...')

  // 1 — router
  const router = locate(process.cwd())
  console.log(`[zero] root  → ${router.projectRoot}`)
  console.log(`[zero] app   → ${router.appName}`)

  // 2 — hardware + system (parallel)
  const [hardware, system] = await Promise.all([profileHardware(), Promise.resolve(getSystem())])
  console.log(`[zero] cpu   → ${hardware.cpu.brand} · ${hardware.cpu.physicalCores} cores · ${hardware.cpu.loadPercent}% load`)
  console.log(`[zero] ram   → ${hardware.ram.freeGB}GB free / ${hardware.ram.totalGB}GB total`)
  console.log(`[zero] disk  → ${hardware.disk.freeGB}GB free / ${hardware.disk.totalGB}GB total`)
  console.log(`[zero] node  → v${system.nodeVersion} · ${system.platform}/${hardware.cpu.arch}`)

  // 3 — compat
  const compat = checkCompat(hardware)
  if (!compat.passes) {
    compat.failures.forEach(f => console.error(`[zero] ✗ ${f}`))
    throw new Error('[zero/startup] minimum requirements not met')
  }
  compat.warnings.forEach(w => console.warn(`[zero] ⚠  ${w}`))

  // 4 — network
  const network = getNetwork()
  if (network.local.length > 0) console.log(`[zero] net   → ${network.local.join('  ')}`)

  // 5 — config
  const config = await loadConfig(router.projectRoot, configOverride)

  // 6 — write information.json
  const info: Information = {
    version: VERSION, timestamp: Date.now(),
    router, hardware, system, network, compat,
  }
  writeInformation(info)
  console.log('[zero] information written')

  return { info, config }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const isMain = process.argv[1] === fileURLToPath(import.meta.url)

if (isMain) {
  const { init: buildInit  } = await import('../Build/core.js')
  const { init: manageInit } = await import('../Manage/Core/core.js')

  const { info, config } = await boot().catch(err => {
    console.error('[zero] fatal:', err)
    process.exit(1)
  })

  await Promise.all([buildInit(info), manageInit(info, config)])

  console.log('[zero] ready.')

  process.on('SIGINT',  () => { console.log('\n[zero] shutting down...'); process.exit(0) })
  process.on('SIGTERM', () => { console.log('[zero] shutting down...');  process.exit(0) })
}

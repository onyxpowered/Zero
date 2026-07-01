import http from 'node:http'
import fs   from 'node:fs'
import path from 'node:path'
import os   from 'node:os'
import { WebSocketServer, WebSocket } from 'ws'
import { profileHardware } from '../../Startup/core.js'
import type { Information, ZeroConfig, HardwareInfo } from '../../Startup/core.js'

// ─── Types ────────────────────────────────────────────────────────────────────

export type Resource      = 'ram' | 'cpu' | 'gpu' | 'disk' | 'bandwidth'
export type ThrottleLevel = 'ok' | 'warning' | 'critical'

export interface Bid {
  moduleId:  string
  resource:  Resource
  requested: number
  priority:  number
  reason:    string
  timestamp: number
}

export interface Allocation {
  moduleId:  string
  resource:  Resource
  requested: number
  granted:   number
  verdict:   string
  override:  boolean
  timestamp: number
}

export interface ThrottleVerdict {
  level:     ThrottleLevel
  reasons:   string[]
  hardware:  HardwareInfo
  timestamp: number
}

export interface ZeroModule {
  id:           string
  version:      string
  boot:         () => Promise<void>
  teardown:     () => Promise<void>
  onAllocation: (a: Allocation) => void
  bids?:        () => Bid[]
}

export type PlugHandler = (data: unknown, clientId: string) => void

export interface Plug {
  readonly name: string
  broadcast:     (data: unknown) => void
  send:          (clientId: string, data: unknown) => boolean
  onMessage:     (handler: PlugHandler) => () => void
}

export interface ManageHandle {
  registry:  ModuleRegistry
  plugboard: PlugBoardHandle
  throttle:  ThrottleHandle
  teardown:  () => Promise<void>
}

// ─── Module Registry ──────────────────────────────────────────────────────────

export interface ModuleRegistry {
  register:    (m: ZeroModule) => void
  unregister:  (id: string) => void
  get:         (id: string) => ZeroModule | undefined
  all:         () => ZeroModule[]
  bootAll:     () => Promise<void>
  teardownAll: () => Promise<void>
}

function createRegistry(): ModuleRegistry {
  const modules = new Map<string, ZeroModule>()
  return {
    register(m)    { modules.set(m.id, m) },
    unregister(id) { modules.delete(id) },
    get(id)        { return modules.get(id) },
    all()          { return [...modules.values()] },
    async bootAll() {
      for (const m of modules.values()) {
        try   { await m.boot(); console.log(`[zero/manage] booted → ${m.id}@${m.version}`) }
        catch (err) { console.error(`[zero/manage] boot failed → ${m.id}:`, err) }
      }
    },
    async teardownAll() {
      for (const m of [...modules.values()].reverse()) {
        try   { await m.teardown(); console.log(`[zero/manage] torn down → ${m.id}`) }
        catch (err) { console.error(`[zero/manage] teardown failed → ${m.id}:`, err) }
      }
    },
  }
}

// ─── Module Loader & Watcher ──────────────────────────────────────────────────

async function loadModule(registry: ModuleRegistry, file: string): Promise<void> {
  try {
    const mod = await import(`${file}?t=${Date.now()}`)
    const raw = mod.default ?? mod
    const m: ZeroModule = typeof raw === 'function' ? (raw as () => ZeroModule)() : raw
    if (!m?.id) throw new Error('module must export a ZeroModule with an id field')
    registry.register(m)
    await m.boot()
    console.log(`[zero/manage] loaded → ${m.id}@${m.version ?? '?'}`)
  } catch (err) {
    console.warn(`[zero/manage] load failed → ${file}:`, err)
  }
}

function watchApps(registry: ModuleRegistry, appsDir: string): () => void {
  if (!fs.existsSync(appsDir)) fs.mkdirSync(appsDir, { recursive: true })

  // load existing modules
  for (const app of fs.readdirSync(appsDir)) {
    const modulesDir = path.join(appsDir, app, 'Modules')
    if (!fs.existsSync(modulesDir)) continue
    for (const file of fs.readdirSync(modulesDir)) {
      if (!/\.(ts|js|mjs)$/.test(file)) continue
      void loadModule(registry, path.join(modulesDir, file))
    }
  }

  // watch for live additions
  const watcher = fs.watch(appsDir, { recursive: true }, (_event, filename) => {
    if (!filename) return
    if (!/Modules[\\/].+\.(ts|js|mjs)$/.test(filename)) return
    const full = path.join(appsDir, filename)
    if (fs.existsSync(full)) void loadModule(registry, full)
  })

  return () => watcher.close()
}

// ─── PlugBoard ────────────────────────────────────────────────────────────────

export interface PlugBoardHandle {
  port:  number
  plug:  (name: string) => Plug
  get:   (name: string) => Plug | undefined
  close: () => Promise<void>
}

async function createPlugBoard(port: number): Promise<PlugBoardHandle> {
  type InternalPlug = Plug & { _clients: Map<string, WebSocket>; _handlers: Set<PlugHandler> }
  const plugs   = new Map<string, InternalPlug>()
  let   counter = 0

  const server = http.createServer((_req, res) => { res.writeHead(404).end() })
  const wss    = new WebSocketServer({ server })

  wss.on('connection', (ws, req) => {
    const name = (req.url ?? '/').replace(/^\//, '')
    const p    = plugs.get(name)
    if (!p) { ws.close(1008, `no plug: ${name}`); return }
    const id = String(++counter)
    p._clients.set(id, ws)
    ws.on('message', raw => {
      try { const data = JSON.parse(raw.toString()); p._handlers.forEach(h => h(data, id)) } catch { /* drop malformed */ }
    })
    ws.on('close', () => p._clients.delete(id))
  })

  await new Promise<void>((resolve, reject) => {
    server.listen(port, () => resolve())
    server.on('error', reject)
  })

  function make(name: string): InternalPlug {
    const _clients  = new Map<string, WebSocket>()
    const _handlers = new Set<PlugHandler>()
    return {
      name, _clients, _handlers,
      broadcast(data) {
        const msg = JSON.stringify(data)
        _clients.forEach(ws => { if (ws.readyState === WebSocket.OPEN) ws.send(msg) })
      },
      send(clientId, data) {
        const ws = _clients.get(clientId)
        if (!ws || ws.readyState !== WebSocket.OPEN) return false
        ws.send(JSON.stringify(data)); return true
      },
      onMessage(handler) { _handlers.add(handler); return () => _handlers.delete(handler) },
    }
  }

  return {
    port,
    plug(name)  { if (!plugs.has(name)) plugs.set(name, make(name)); return plugs.get(name)! },
    get(name)   { return plugs.get(name) },
    close()     { return new Promise(r => server.close(() => r())) },
  }
}

// ─── Throttle ─────────────────────────────────────────────────────────────────

export interface ThrottleHandle {
  level:    ThrottleLevel
  verdict:  ThrottleVerdict | null
  override: (moduleId: string, resource: Resource, value: number) => void
  log:      (limit?: number) => Allocation[]
  stop:     () => void
}

function createThrottle(
  cfg:        ZeroConfig,
  registry:   ModuleRegistry,
  onShutdown: (target?: string) => void,
): { handle: ThrottleHandle; start: (hw: HardwareInfo) => void } {
  let   verdict:    ThrottleVerdict | null = null
  const allocLog:   Allocation[]           = []
  let   watchTimer: ReturnType<typeof setInterval>
  let   cycleTimer: ReturnType<typeof setInterval>

  function assess(hw: HardwareInfo): ThrottleVerdict {
    const reasons: string[] = []
    let level: ThrottleLevel = 'ok'
    const escalate = (to: ThrottleLevel) => {
      if (to === 'critical' || (to === 'warning' && level === 'ok')) level = to
    }
    const t = cfg.throttle
    if (hw.ram.percentUsed       >= t.ram.critical)  { escalate('critical'); reasons.push(`ram critical: ${hw.ram.percentUsed}% (${hw.ram.freeGB.toFixed(1)}GB free)`) }
    else if (hw.ram.percentUsed  >= t.ram.warning)   { escalate('warning');  reasons.push(`ram warning: ${hw.ram.percentUsed}%`) }
    if (hw.cpu.loadPercent       >= t.cpu.critical)  { escalate('critical'); reasons.push(`cpu critical: ${hw.cpu.loadPercent}%`) }
    else if (hw.cpu.loadPercent  >= t.cpu.warning)   { escalate('warning');  reasons.push(`cpu warning: ${hw.cpu.loadPercent}%`) }
    if (hw.disk.percentUsed      >= t.disk.critical) { escalate('critical'); reasons.push(`disk critical: ${hw.disk.percentUsed}% (${hw.disk.freeGB.toFixed(1)}GB free)`) }
    else if (hw.disk.percentUsed >= t.disk.warning)  { escalate('warning');  reasons.push(`disk warning: ${hw.disk.percentUsed}%`) }
    if (level === 'ok') reasons.push('all resources within safe limits')
    return { level, reasons, hardware: hw, timestamp: Date.now() }
  }

  function record(a: Allocation): void {
    allocLog.push(a)
    if (allocLog.length > 500) allocLog.splice(0, allocLog.length - 500)
    try {
      const dir = path.join(os.homedir(), '.zero')
      fs.mkdirSync(dir, { recursive: true })
      fs.writeFileSync(path.join(dir, 'throttle.json'), JSON.stringify(allocLog.slice(-100), null, 2), 'utf8')
    } catch { /* non-fatal */ }
  }

  function cycle(): void {
    if (!verdict) return
    const hw      = verdict.hardware
    const modules = registry.all()
    const bids    = modules.flatMap(m => m.bids?.() ?? [])
    if (bids.length === 0) return

    const factor = verdict.level === 'ok' ? 1.0
                 : verdict.level === 'warning' ? 0.75
                 : Math.max(0.25, 1 - (hw.ram.percentUsed / 100) * 0.75)

    const pool: Record<Resource, number> = {
      ram: hw.ram.freeGB, cpu: 100 - hw.cpu.loadPercent,
      gpu: hw.gpu.controllers[0]?.vramMB ?? 0, disk: hw.disk.freeGB, bandwidth: 100,
    }

    for (const bid of [...bids].sort((a, b) => b.priority - a.priority)) {
      const available = (pool[bid.resource] ?? 0) * factor
      const granted   = Math.min(bid.requested, available)
      pool[bid.resource] = Math.max(0, (pool[bid.resource] ?? 0) - granted)
      const v = granted >= bid.requested ? 'granted'
              : granted > 0              ? `partial (×${factor.toFixed(2)})`
              :                            `denied — insufficient ${bid.resource}`
      const a: Allocation = {
        moduleId: bid.moduleId, resource: bid.resource,
        requested: bid.requested, granted, verdict: v, override: false, timestamp: Date.now(),
      }
      record(a)
      modules.find(m => m.id === a.moduleId)?.onAllocation(a)
    }
  }

  const handle: ThrottleHandle = {
    get level()   { return verdict?.level ?? 'ok' },
    get verdict() { return verdict },
    override(moduleId, resource, value) {
      const a: Allocation = { moduleId, resource, requested: value, granted: value,
        verdict: 'human override', override: true, timestamp: Date.now() }
      record(a)
      registry.all().find(m => m.id === moduleId)?.onAllocation(a)
      console.log(`[zero/manage] override → ${moduleId}:${resource} = ${value}`)
    },
    log(limit = 100) { return allocLog.slice(-limit) },
    stop() { clearInterval(watchTimer); clearInterval(cycleTimer) },
  }

  function start(hw: HardwareInfo): void {
    verdict    = assess(hw)
    watchTimer = setInterval(async () => {
      try {
        const fresh = await profileHardware()
        verdict     = assess(fresh)
        if (verdict.level !== 'ok') {
          console.warn(`[zero/manage] ${verdict.level}: ${verdict.reasons.join(', ')}`)
        }
        if (verdict.level === 'critical') onShutdown()
      } catch { /* non-fatal */ }
    }, cfg.throttle.pollIntervalMs)
    cycleTimer = setInterval(cycle, cfg.throttle.pollIntervalMs)
    cycle()
  }

  return { handle, start }
}

// ─── Init ─────────────────────────────────────────────────────────────────────

export async function init(info: Information, config: ZeroConfig): Promise<ManageHandle> {
  const registry  = createRegistry()
  const plugboard = await createPlugBoard(config.plugPort)
  console.log(`[zero/manage] plugboard → :${config.plugPort}`)

  const throttlePlug = plugboard.plug('throttle')
  plugboard.plug('logs')

  const { handle: throttle, start: startThrottle } = createThrottle(
    config,
    registry,
    () => { console.warn('[zero/manage] critical — shutting down'); process.exit(1) },
  )

  // forward override commands from the plugboard into throttle
  throttlePlug.onMessage(data => {
    const msg = data as { type: string; moduleId: string; resource: Resource; value: number }
    if (msg.type === 'override') throttle.override(msg.moduleId, msg.resource, msg.value)
  })

  // broadcast verdict on every poll cycle
  setInterval(() => {
    if (throttle.verdict) throttlePlug.broadcast(throttle.verdict)
  }, config.throttle.pollIntervalMs)

  // register core module
  registry.register({
    id: 'zero', version: '0.1.0',
    async boot() {},
    async teardown() {},
    onAllocation() {},
    bids: () => [{ moduleId: 'zero', resource: 'ram', requested: 0.25, priority: 100, reason: 'zero core', timestamp: Date.now() }],
  })

  await registry.bootAll()

  // watch Apps/ for live module loading
  const appsDir   = path.join(info.router.zeroRoot, 'Apps')
  const stopWatch = watchApps(registry, appsDir)
  console.log(`[zero/manage] watching → ${appsDir}`)

  startThrottle(info.hardware)
  console.log('[zero/manage] ready')

  return {
    registry,
    plugboard,
    throttle,
    async teardown() {
      throttle.stop()
      stopWatch()
      await registry.teardownAll()
      await plugboard.close()
      console.log('[zero/manage] torn down')
    },
  }
}

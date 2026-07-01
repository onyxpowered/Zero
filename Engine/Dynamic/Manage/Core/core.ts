import http from 'node:http'
import fs   from 'node:fs'
import path from 'node:path'
import os   from 'node:os'
import si   from 'systeminformation'
import { WebSocketServer, WebSocket } from 'ws'
import { createProcManager } from './procs.js'
import type {
  ManageHandle, ManageEvent, ManageCmd, ManageEventHandler,
  ManageAPI, ModuleRegistry, ZeroModule, BusHandle, BusChannel, BusHandler,
  ThrottleVerdict, Allocation, Resource, ThrottleLevel, Bid,
} from './types.js'
import type { Information, ZeroConfig, HardwareInfo } from '../../Startup/core.js'

export type { ManageHandle, ManageEvent, ManageAPI, ZeroModule, BusHandle, BusChannel,
              ThrottleVerdict, Allocation, Resource, ThrottleLevel, Bid, ManageEventHandler }
export type { ProcRecord, ProcHandle, ProcStatus } from './types.js'

// ─── Hardware ─────────────────────────────────────────────────────────────────

async function profileHardware(): Promise<HardwareInfo> {
  const [mem, cpu, load, graphics, disks] = await Promise.all([
    si.mem(), si.cpu(), si.currentLoad(), si.graphics(), si.fsSize(),
  ])
  const disk = disks[0] ?? { size: 0, used: 0, available: 0 }
  const toGB = (b: number) => Math.round((b / 1024 ** 3) * 100) / 100
  return {
    cpu: { brand: cpu.brand, cores: cpu.cores, physicalCores: cpu.physicalCores, speedGHz: cpu.speed, loadPercent: Math.round(load.currentLoad), arch: process.arch },
    ram: { totalGB: toGB(mem.total), usedGB: toGB(mem.used), freeGB: toGB(mem.available), percentUsed: Math.round(((mem.total - mem.available) / mem.total) * 100) },
    gpu: { controllers: graphics.controllers.map(g => ({ vendor: g.vendor, model: g.model, vramMB: g.vram ?? 0 })) },
    disk: { totalGB: toGB(disk.size), usedGB: toGB(disk.used), freeGB: toGB((disk as { available?: number }).available ?? disk.size - disk.used), percentUsed: disk.size > 0 ? Math.round((disk.used / disk.size) * 100) : 0 },
  }
}

// ─── Event bus (internal pub/sub + WebSocket bridge) ─────────────────────────

function createEventBus() {
  const handlers = new Map<string, Set<ManageEventHandler>>()

  function emit(event: ManageEvent): void {
    const all  = handlers.get('*')   ?? new Set()
    const typed = handlers.get(event.type) ?? new Set()
    for (const h of [...all, ...typed]) { try { h(event) } catch { /* isolate */ } }
  }

  function on(type: string, handler: ManageEventHandler): () => void {
    if (!handlers.has(type)) handlers.set(type, new Set())
    handlers.get(type)!.add(handler)
    return () => handlers.get(type)?.delete(handler)
  }

  return { emit, on }
}

// ─── WebSocket Bus ────────────────────────────────────────────────────────────

const DASHBOARD_HTML_PATH = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  '../../../Static/UI/dashboard.html'
)

async function createBus(port: number, internalEmit: (e: ManageEvent) => void): Promise<BusHandle> {
  type InternalChannel = BusChannel & { _clients: Map<string, WebSocket>; _handlers: Set<BusHandler> }
  const channels = new Map<string, InternalChannel>()
  let counter    = 0

  const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
      if (fs.existsSync(DASHBOARD_HTML_PATH)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        fs.createReadStream(DASHBOARD_HTML_PATH).pipe(res)
      } else {
        res.writeHead(200, { 'Content-Type': 'text/plain' })
        res.end('zero manage — dashboard not found')
      }
      return
    }
    // preview deploys list: GET /previews
    if (req.method === 'GET' && req.url === '/previews') {
      const deploysFile = path.join(os.homedir(), '.zero', 'deploys.json')
      try {
        const data = fs.existsSync(deploysFile) ? fs.readFileSync(deploysFile, 'utf8') : '[]'
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
        res.end(data)
      } catch { res.writeHead(500).end('[]') }
      return
    }
    // CLI build events: POST /emit { channel, event }
    if (req.method === 'POST' && req.url === '/emit') {
      let body = ''
      req.on('data', chunk => { body += chunk })
      req.on('end', () => {
        try {
          const { channel, event } = JSON.parse(body) as { channel: string; event: ManageEvent }
          const ch = channels.get(channel)
          if (ch) { ch.broadcast(event); internalEmit(event) }
          res.writeHead(200).end('ok')
        } catch { res.writeHead(400).end('bad request') }
      })
      return
    }
    res.writeHead(404).end()
  })

  const wss = new WebSocketServer({ server })

  wss.on('connection', (ws, req) => {
    const name = (req.url ?? '/').replace(/^\//, '').split('?')[0]
    const ch   = channels.get(name)
    if (!ch) { ws.close(1008, `no channel: ${name}`); return }
    const id = String(++counter)
    ch._clients.set(id, ws)
    ws.on('message', raw => {
      try {
        const data = JSON.parse(raw.toString())
        ch._handlers.forEach(h => h(data, id))
        // forward manage commands into the internal event bus
        if (name === 'manage') internalEmit(data as ManageEvent)
      } catch { /* drop malformed */ }
    })
    ws.on('close', () => ch._clients.delete(id))
  })

  await new Promise<void>((resolve, reject) => {
    server.listen(port, () => resolve())
    server.on('error', reject)
  })

  function make(name: string): InternalChannel {
    const _clients  = new Map<string, WebSocket>()
    const _handlers = new Set<BusHandler>()
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
    channel(name) { if (!channels.has(name)) channels.set(name, make(name)); return channels.get(name)! },
    get(name)  { return channels.get(name) },
    close()    { return new Promise(r => server.close(() => r())) },
  }
}

// ─── Module Registry ──────────────────────────────────────────────────────────

function createRegistry(): ModuleRegistry {
  const modules = new Map<string, ZeroModule>()
  return {
    register(m)    { modules.set(m.id, m) },
    unregister(id) { modules.delete(id) },
    get(id)        { return modules.get(id) },
    all()          { return [...modules.values()] },
    async bootAll(api) {
      for (const m of modules.values()) {
        try   { await m.boot(api); console.log(`[zero/manage] booted  → ${m.id}@${m.version}`) }
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

// ─── Module Loader ────────────────────────────────────────────────────────────

async function loadModule(registry: ModuleRegistry, api: ManageAPI, file: string): Promise<void> {
  try {
    const mod = await import(`${file}?t=${Date.now()}`)
    const raw = mod.default ?? mod
    const m: ZeroModule = typeof raw === 'function' ? (raw as () => ZeroModule)() : raw
    if (!m?.id) throw new Error('module must export a ZeroModule with an id field')
    registry.register(m)
    await m.boot(api)
    console.log(`[zero/manage] loaded  → ${m.id}@${m.version ?? '?'}`)
    api.emit({ type: 'module.load', id: m.id, version: m.version ?? '?' })
  } catch (err) {
    const msg = (err as Error).message
    console.warn(`[zero/manage] load failed → ${file}: ${msg}`)
    api.emit({ type: 'module.error', id: file, error: msg })
  }
}

function watchApps(registry: ModuleRegistry, api: ManageAPI, appsDir: string): () => void {
  if (!fs.existsSync(appsDir)) fs.mkdirSync(appsDir, { recursive: true })
  for (const app of fs.readdirSync(appsDir)) {
    const dir = path.join(appsDir, app, 'Modules')
    if (!fs.existsSync(dir)) continue
    for (const file of fs.readdirSync(dir)) {
      if (!/\.(ts|js|mjs)$/.test(file)) continue
      void loadModule(registry, api, path.join(dir, file))
    }
  }
  const watcher = fs.watch(appsDir, { recursive: true }, (_e, filename) => {
    if (!filename || !/Modules[\\/].+\.(ts|js|mjs)$/.test(filename)) return
    const full = path.join(appsDir, filename)
    if (fs.existsSync(full)) void loadModule(registry, api, full)
  })
  return () => watcher.close()
}

// ─── Throttle ─────────────────────────────────────────────────────────────────

function createThrottle(
  cfg:      ZeroConfig,
  registry: ModuleRegistry,
  procs:    ReturnType<typeof createProcManager>,
  emit:     (e: ManageEvent) => void,
  onCritical: () => void,
) {
  let verdict:   ThrottleVerdict | null = null
  const allocLog: Allocation[]          = []
  let watchTimer: ReturnType<typeof setInterval>
  let cycleTimer: ReturnType<typeof setInterval>

  function assess(hw: HardwareInfo): ThrottleVerdict {
    const reasons: string[] = []
    let level: ThrottleLevel = 'ok'
    const escalate = (to: ThrottleLevel) => {
      if (to === 'critical' || (to === 'warning' && level === 'ok')) level = to
    }
    const t = cfg.throttle
    if (hw.ram.percentUsed  >= t.ram.critical)  { escalate('critical'); reasons.push(`ram critical: ${hw.ram.percentUsed}% (${hw.ram.freeGB.toFixed(1)}GB free)`) }
    else if (hw.ram.percentUsed >= t.ram.warning) { escalate('warning'); reasons.push(`ram warning: ${hw.ram.percentUsed}%`) }
    if (hw.cpu.loadPercent  >= t.cpu.critical)  { escalate('critical'); reasons.push(`cpu critical: ${hw.cpu.loadPercent}%`) }
    else if (hw.cpu.loadPercent >= t.cpu.warning) { escalate('warning'); reasons.push(`cpu warning: ${hw.cpu.loadPercent}%`) }
    if (hw.disk.percentUsed >= t.disk.critical) { escalate('critical'); reasons.push(`disk critical: ${hw.disk.percentUsed}%`) }
    else if (hw.disk.percentUsed >= t.disk.warning) { escalate('warning'); reasons.push(`disk warning: ${hw.disk.percentUsed}%`) }
    if (level === 'ok') reasons.push('all resources within safe limits')
    return { level, reasons, hardware: hw, timestamp: Date.now() }
  }

  function record(a: Allocation): void {
    allocLog.push(a)
    if (allocLog.length > 500) allocLog.splice(0, allocLog.length - 500)
    try {
      fs.mkdirSync(path.join(os.homedir(), '.zero'), { recursive: true })
      fs.writeFileSync(path.join(os.homedir(), '.zero', 'throttle.json'), JSON.stringify(allocLog.slice(-100), null, 2), 'utf8')
    } catch { /* non-fatal */ }
  }

  function cycle(): void {
    if (!verdict) return
    const hw   = verdict.hardware
    const bids: Bid[] = [
      ...registry.all().flatMap(m => m.bids?.() ?? []),
      ...procs.bids(),
    ]
    if (!bids.length) return
    const factor = verdict.level === 'ok' ? 1.0 : verdict.level === 'warning' ? 0.75 : Math.max(0.25, 1 - (hw.ram.percentUsed / 100) * 0.75)
    const pool: Record<Resource, number> = { ram: hw.ram.freeGB, cpu: 100 - hw.cpu.loadPercent, gpu: hw.gpu.controllers[0]?.vramMB ?? 0, disk: hw.disk.freeGB, bandwidth: 100 }
    for (const bid of [...bids].sort((a, b) => b.priority - a.priority)) {
      const available = (pool[bid.resource] ?? 0) * factor
      const granted   = Math.min(bid.requested, available)
      pool[bid.resource] = Math.max(0, (pool[bid.resource] ?? 0) - granted)
      const v = granted >= bid.requested ? 'granted' : granted > 0 ? `partial (×${factor.toFixed(2)})` : `denied — insufficient ${bid.resource}`
      const a: Allocation = { moduleId: bid.moduleId, resource: bid.resource, requested: bid.requested, granted, verdict: v, override: false, timestamp: Date.now() }
      record(a)
      registry.all().find(m => m.id === bid.moduleId)?.onAllocation(a)
    }
  }

  const handle = {
    get level()   { return verdict?.level ?? 'ok' as ThrottleLevel },
    get verdict() { return verdict },
    override(moduleId: string, resource: Resource, value: number) {
      const a: Allocation = { moduleId, resource, requested: value, granted: value, verdict: 'human override', override: true, timestamp: Date.now() }
      record(a)
      registry.all().find(m => m.id === moduleId)?.onAllocation(a)
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
        emit({ type: 'throttle', ...verdict })
        if (verdict.level !== 'ok') console.warn(`[zero/manage] ${verdict.level}: ${verdict.reasons.join(', ')}`)
        if (verdict.level === 'critical') onCritical()
      } catch { /* non-fatal */ }
    }, cfg.throttle.pollIntervalMs)
    cycleTimer = setInterval(cycle, cfg.throttle.pollIntervalMs)
    cycle()
  }

  return { handle, start }
}

// ─── Command handler ──────────────────────────────────────────────────────────

function handleCommand(
  cmd:    ManageCmd,
  emit:   (e: ManageEvent) => void,
  procs:  ReturnType<typeof createProcManager>,
  info:   Information,
): void {
  async function run(): Promise<void> {
    switch (cmd.type) {
      case 'cmd.ps': {
        emit({ type: 'cmd.result', reqId: cmd.reqId, ok: true, message: 'ok', data: procs.list() })
        break
      }
      case 'cmd.stop': {
        try {
          await procs.stop(cmd.id)
          emit({ type: 'cmd.result', reqId: cmd.reqId, ok: true, message: `stopped ${cmd.id}` })
        } catch (err) {
          emit({ type: 'cmd.result', reqId: cmd.reqId, ok: false, message: (err as Error).message })
        }
        break
      }
      case 'cmd.restart': {
        try {
          await procs.restart(cmd.id)
          emit({ type: 'cmd.result', reqId: cmd.reqId, ok: true, message: `restarted ${cmd.id}` })
        } catch (err) {
          emit({ type: 'cmd.result', reqId: cmd.reqId, ok: false, message: (err as Error).message })
        }
        break
      }
      case 'cmd.start': {
        const zeroRoot = cmd.zeroRoot ?? info.router.zeroRoot
        const appsDir  = path.join(zeroRoot, 'Apps')
        // appDir can be provided directly (e.g. from deploy outside Zero root)
        const appDir   = cmd.appDir ?? path.join(appsDir, cmd.app)
        const mode     = cmd.mode ?? 'prod'
        const workers  = cmd.workers ?? 1
        const basePort = cmd.port

        if (!fs.existsSync(appDir)) {
          emit({ type: 'cmd.result', reqId: cmd.reqId, ok: false, message: `app not found: ${appDir}` })
          return
        }

        const parts = cmd.parts ?? detectParts(appDir)
        const started: string[] = []

        for (const part of parts) {
          const partDir = path.join(appDir, capitalise(part))
          // allow a command override even if the part dir doesn't exist (e.g. CDN sidecar)
          const dir = fs.existsSync(partDir) ? partDir : cmd.command ? appDir : null
          if (!dir) continue
          const id      = `${cmd.app}.${part}`
          const command = cmd.command ?? resolveCommand(dir, part, mode)
          const port    = basePort ?? (part === 'frontend' ? 3000 : 4000)

          try {
            if (workers > 1 && part === 'backend') {
              await procs.startWorkers(id, cmd.app, part, dir, command, mode, workers, port)
            } else {
              await procs.start(id, cmd.app, part, dir, command, mode, port)
            }
            started.push(id)
          } catch (err) {
            emit({ type: 'cmd.result', reqId: cmd.reqId, ok: false, message: `${id}: ${(err as Error).message}` })
            return
          }
        }

        emit({ type: 'cmd.result', reqId: cmd.reqId, ok: true, message: `started ${started.join(', ')}`, data: started })
        break
      }
      case 'cmd.scale': {
        try {
          await procs.scaleWorkers(cmd.id, cmd.workers)
          emit({ type: 'cmd.result', reqId: cmd.reqId, ok: true, message: `scaled ${cmd.id} to ${cmd.workers} workers` })
        } catch (err) {
          emit({ type: 'cmd.result', reqId: cmd.reqId, ok: false, message: (err as Error).message })
        }
        break
      }
    }
  }
  void run()
}

function detectParts(appDir: string): string[] {
  return ['backend', 'frontend'].filter(p => fs.existsSync(path.join(appDir, capitalise(p))))
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function resolveCommand(dir: string, part: string, mode: 'dev'|'prod'): string {
  if (mode === 'dev') {
    if (part === 'frontend') return 'npm run dev'
    // backend dev
    const entry = ['src/index.ts', 'src/index.js', 'index.ts'].find(f => fs.existsSync(path.join(dir, f)))
    return entry ? `npx tsx --watch ${entry}` : 'npm run dev'
  }
  // prod
  if (part === 'frontend') return 'npm run start'
  const entry = ['dist/index.js', 'dist/index.cjs'].find(f => fs.existsSync(path.join(dir, f)))
  return entry ? `node ${entry}` : 'npm run start'
}

// ─── Auto-scale ───────────────────────────────────────────────────────────────

const MAX_WORKERS = os.cpus().length
let   _lastScaleAt = 0

function autoScale(
  event: { type: string; level?: string; hardware?: { cpu: { loadPercent: number } } },
  procs: ReturnType<typeof createProcManager>,
  emit:  (e: ManageEvent) => void,
): void {
  if (event.type !== 'throttle' || !event.level || !event.hardware) return
  const now = Date.now()
  if (now - _lastScaleAt < 30_000) return  // cooldown: 30s between scale events

  const cpu   = event.hardware.cpu.loadPercent
  const level = event.level as 'ok' | 'warning' | 'critical'

  for (const proc of procs.list()) {
    if (!proc.workers || proc.workers < 1) continue  // only worker groups

    if (level === 'critical' && cpu > 85 && proc.workers < MAX_WORKERS) {
      const next = Math.min(proc.workers + 1, MAX_WORKERS)
      console.log(`[zero/manage] auto-scale UP  → ${proc.id} × ${next} (cpu ${cpu}%)`)
      void procs.scaleWorkers(proc.id, next)
      _lastScaleAt = now
    } else if (level === 'ok' && cpu < 30 && proc.workers > 1) {
      const next = Math.max(proc.workers - 1, 1)
      console.log(`[zero/manage] auto-scale DOWN → ${proc.id} × ${next} (cpu ${cpu}%)`)
      void procs.scaleWorkers(proc.id, next)
      _lastScaleAt = now
    }
  }
}

// ─── Init ─────────────────────────────────────────────────────────────────────

export async function init(info: Information, config: ZeroConfig): Promise<ManageHandle> {
  // internal pub/sub
  const bus_internal = createEventBus()

  // process manager
  const procs = createProcManager(bus_internal.emit)

  // WebSocket bus — bridges external clients to internal bus
  const bus = await createBus(config.plugPort, (event) => {
    // handle CLI commands arriving on the manage channel
    const raw = event as unknown as ManageCmd
    if (typeof raw === 'object' && raw !== null && 'reqId' in raw && 'type' in raw && (raw.type as string).startsWith('cmd.')) {
      handleCommand(raw, bus_internal.emit, procs, info)
    }
  })
  console.log(`[zero/manage] bus       → :${config.plugPort}`)
  console.log(`[zero/manage] dashboard → http://localhost:${config.plugPort}`)

  // create channels
  const buildsChannel   = bus.channel('builds')
  const procsChannel    = bus.channel('procs')
  const throttleChannel = bus.channel('throttle')
  const modulesChannel  = bus.channel('modules')
  const manageChannel   = bus.channel('manage')
  const cdnChannel      = bus.channel('cdn')

  // forward internal events to the appropriate bus channels
  bus_internal.on('*', (event) => {
    switch (event.type) {
      case 'build.start': case 'build.done': case 'build.error':
        buildsChannel.broadcast(event); break
      case 'proc.start': case 'proc.stop': case 'proc.crash': case 'proc.restart': case 'proc.log': case 'proc.scale':
        procsChannel.broadcast(event); break
      case 'throttle':
        throttleChannel.broadcast(event)
        // auto-scale: if CPU critical and workers exist, try to add one
        autoScale(event, procs, bus_internal.emit)
        break
      case 'module.load': case 'module.error':
        modulesChannel.broadcast(event); break
      case 'cdn.stats':
        cdnChannel.broadcast(event); break
      case 'cmd.result':
        manageChannel.broadcast(event); break
    }
  })

  const registry = createRegistry()

  // ManageAPI — the surface given to modules
  const api: ManageAPI = {
    emit:     bus_internal.emit,
    on:       bus_internal.on,
    procs,
    throttle: { get verdict() { return throttle.handle.verdict } },
  }

  // throttle
  const throttle = createThrottle(
    config, registry, procs, bus_internal.emit,
    () => { console.warn('[zero/manage] critical resource usage — evaluate running processes') },
  )

  // register zero core as a module
  registry.register({
    id: 'zero', version: '0.1.0',
    async boot(_api) {},
    async teardown() {},
    onAllocation() {},
    bids: () => [{ moduleId: 'zero', resource: 'ram', requested: 0.25, priority: 100, reason: 'zero core', timestamp: Date.now() }],
  })

  await registry.bootAll(api)

  // watch Apps/ for live module loading
  const appsDir   = path.join(info.router.zeroRoot, 'Apps')
  const stopWatch = watchApps(registry, api, appsDir)
  console.log(`[zero/manage] watching  → ${appsDir}`)

  // watch ~/.zero/modules/ for globally installed remote modules
  const globalModsDir = path.join(os.homedir(), '.zero', 'modules')
  fs.mkdirSync(globalModsDir, { recursive: true })
  for (const file of fs.readdirSync(globalModsDir)) {
    if (!/\.(ts|js|mjs)$/.test(file)) continue
    void loadModule(registry, api, path.join(globalModsDir, file))
  }
  const globalWatcher = fs.watch(globalModsDir, (_e, filename) => {
    if (!filename || !/\.(ts|js|mjs)$/.test(filename)) return
    const full = path.join(globalModsDir, filename)
    if (fs.existsSync(full)) void loadModule(registry, api, full)
  })
  console.log(`[zero/manage] modules   → ${globalModsDir}`)

  throttle.start(info.hardware)
  console.log('[zero/manage] ready')

  const handle: ManageHandle = {
    bus,
    throttle: throttle.handle,
    procs,
    registry,
    emit: bus_internal.emit,
    on:   bus_internal.on,
    async teardown() {
      throttle.handle.stop()
      stopWatch()
      globalWatcher.close()
      await registry.teardownAll()
      await bus.close()
      console.log('[zero/manage] torn down')
    },
  }

  return handle
}

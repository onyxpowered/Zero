import type { HardwareInfo } from '../../Startup/core.js'

// ─── Resources & throttle ─────────────────────────────────────────────────────

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

// ─── Processes ────────────────────────────────────────────────────────────────

export type ProcStatus = 'starting' | 'running' | 'stopped' | 'crashed'

export interface ProcRecord {
  id:        string       // 'MyApp.backend'
  app:       string       // 'MyApp'
  part:      string       // 'backend' | 'frontend' | custom
  dir:       string
  command:   string
  mode:      'dev' | 'prod'
  pid:       number | null
  status:    ProcStatus
  started:   number | null
  stopped:   number | null
  restarts:  number
  exitCode:  number | null
  ramBidGB:  number
  port?:     number        // port this process is bound to
  workers?:  number        // target worker count (1 = single process)
  workerIds?: string[]     // ids of spawned worker procs
}

export interface ProcHandle {
  start:        (id: string, app: string, part: string, dir: string, command: string, mode?: 'dev'|'prod', port?: number) => Promise<ProcRecord>
  startWorkers: (id: string, app: string, part: string, dir: string, command: string, mode: 'dev'|'prod', count: number, basePort: number) => Promise<ProcRecord[]>
  scaleWorkers: (id: string, count: number) => Promise<void>
  stop:         (id: string) => Promise<void>
  restart:      (id: string) => Promise<ProcRecord>
  list:         () => ProcRecord[]
  get:          (id: string) => ProcRecord | undefined
  bids:         () => Bid[]
}

// ─── Events ───────────────────────────────────────────────────────────────────

export type ManageEvent =
  | { type: 'build.start';   app: string; part: string; engine: string; cacheKey: string }
  | { type: 'build.done';    app: string; part: string; engine: string; duration: number; cached: boolean; files: number; cacheKey: string }
  | { type: 'build.error';   app: string; part: string; engine: string; step: string; exitCode: number; hints: string[] }
  | { type: 'proc.start';    id: string; app: string; part: string; pid: number }
  | { type: 'proc.stop';     id: string; code: number | null }
  | { type: 'proc.crash';    id: string; code: number; restarts: number }
  | { type: 'proc.restart';  id: string; restarts: number }
  | { type: 'proc.log';      id: string; stream: 'stdout' | 'stderr'; line: string }
  | { type: 'proc.scale';    id: string; workers: number }
  | { type: 'module.load';   id: string; version: string }
  | { type: 'module.error';  id: string; error: string }
  | { type: 'throttle';      level: ThrottleLevel; reasons: string[]; hardware: HardwareInfo; timestamp: number }
  | { type: 'cdn.stats';     hits: number; misses: number; ratio: number; cacheMB: number; entries: number }
  | { type: 'cmd.result';    reqId: string; ok: boolean; message: string; data?: unknown }

export type ManageCmd =
  | { type: 'cmd.start';   reqId: string; app: string; parts?: string[]; mode?: 'dev'|'prod'; zeroRoot: string; appDir?: string; port?: number; workers?: number; command?: string }
  | { type: 'cmd.stop';    reqId: string; id: string }
  | { type: 'cmd.restart'; reqId: string; id: string }
  | { type: 'cmd.scale';   reqId: string; id: string; workers: number }
  | { type: 'cmd.ps';      reqId: string }

export type ManageEventHandler = (event: ManageEvent) => void

// ─── Module API (what modules receive on boot) ────────────────────────────────

export interface ManageAPI {
  emit:     (event: ManageEvent) => void
  on:       (type: string, handler: ManageEventHandler) => () => void
  procs:    ProcHandle
  throttle: { readonly verdict: ThrottleVerdict | null }
}

// ─── Module ───────────────────────────────────────────────────────────────────

export interface ZeroModule {
  id:           string
  version:      string
  boot:         (api: ManageAPI) => Promise<void>
  teardown:     () => Promise<void>
  onAllocation: (a: Allocation) => void
  bids?:        () => Bid[]
}

// ─── Bus (WebSocket layer) ────────────────────────────────────────────────────

export type BusHandler = (data: unknown, clientId: string) => void

export interface BusChannel {
  readonly name: string
  broadcast:     (data: unknown) => void
  send:          (clientId: string, data: unknown) => boolean
  onMessage:     (handler: BusHandler) => () => void
}

export interface BusHandle {
  port:    number
  channel: (name: string) => BusChannel
  get:     (name: string) => BusChannel | undefined
  close:   () => Promise<void>
}

// ─── Manage handle ────────────────────────────────────────────────────────────

export interface ModuleRegistry {
  register:    (m: ZeroModule) => void
  unregister:  (id: string) => void
  get:         (id: string) => ZeroModule | undefined
  all:         () => ZeroModule[]
  bootAll:     (api: ManageAPI) => Promise<void>
  teardownAll: () => Promise<void>
}

export interface ManageHandle {
  bus:      BusHandle
  throttle: { readonly level: ThrottleLevel; readonly verdict: ThrottleVerdict | null; override: (moduleId: string, resource: Resource, value: number) => void; log: (limit?: number) => Allocation[] }
  procs:    ProcHandle
  registry: ModuleRegistry
  emit:     (event: ManageEvent) => void
  on:       (type: string, handler: ManageEventHandler) => () => void
  teardown: () => Promise<void>
}

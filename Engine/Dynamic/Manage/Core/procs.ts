import { spawn, type ChildProcess } from 'node:child_process'
import fs   from 'node:fs'
import path from 'node:path'
import os   from 'node:os'
import type { ProcRecord, ProcHandle, ManageEvent, Bid } from './types.js'

const STATE_FILE     = path.join(os.homedir(), '.zero', 'state.json')
const LOG_DIR        = path.join(os.homedir(), '.zero', 'logs')
const MAX_RESTARTS   = 5
const RESTART_DELAY  = 2000
const RAM_BID_GB     = 0.5

interface LiveProc extends ProcRecord {
  _proc:         ChildProcess | null
  _log:          fs.WriteStream | null
  _restartTimer: ReturnType<typeof setTimeout> | null
}

export function createProcManager(emit: (e: ManageEvent) => void): ProcHandle {
  const procs = new Map<string, LiveProc>()

  fs.mkdirSync(LOG_DIR, { recursive: true })

  function saveState(): void {
    try {
      const records = [...procs.values()].map(({ _proc: _, _log: __, _restartTimer: ___, ...r }) => r)
      fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true })
      fs.writeFileSync(STATE_FILE, JSON.stringify({ procs: records, updated: Date.now() }, null, 2), 'utf8')
    } catch { /* non-fatal */ }
  }

  function logLine(proc: LiveProc, stream: 'stdout' | 'stderr', line: string): void {
    proc._log?.write(`[${new Date().toISOString()}] [${stream}] ${line}\n`)
    emit({ type: 'proc.log', id: proc.id, stream, line })
  }

  function scheduleRestart(rec: LiveProc): void {
    if (rec.restarts >= MAX_RESTARTS) {
      console.error(`[zero/manage] ${rec.id} exceeded max restarts (${MAX_RESTARTS}), giving up`)
      return
    }
    const delay = RESTART_DELAY * Math.pow(2, rec.restarts)
    rec._restartTimer = setTimeout(() => {
      rec.restarts++
      emit({ type: 'proc.restart', id: rec.id, restarts: rec.restarts })
      console.log(`[zero/manage] restarting ${rec.id} (attempt ${rec.restarts})`)
      spawnProc(rec)
    }, delay)
  }

  function spawnProc(rec: LiveProc): void {
    if (rec._restartTimer) { clearTimeout(rec._restartTimer); rec._restartTimer = null }

    const logPath = path.join(LOG_DIR, `${rec.id.replace(/[./]/g, '-')}.log`)
    rec._log?.end()
    rec._log    = fs.createWriteStream(logPath, { flags: 'a' })
    rec.status  = 'starting'
    rec.started = Date.now()
    rec.stopped = null
    rec.pid     = null
    rec.exitCode = null
    saveState()

    const env: Record<string, string> = {
      ...process.env as Record<string, string>,
      ZERO_APP:  rec.app,
      ZERO_PART: rec.part,
    }
    if (rec.port) env['PORT'] = String(rec.port)

    const child = spawn(rec.command, { cwd: rec.dir, shell: true, stdio: ['ignore', 'pipe', 'pipe'], env })

    rec._proc  = child
    rec.pid    = child.pid ?? null
    rec.status = 'running'
    saveState()

    emit({ type: 'proc.start', id: rec.id, app: rec.app, part: rec.part, pid: child.pid! })
    console.log(`[zero/manage] started → ${rec.id} (pid ${child.pid}${rec.port ? `, port ${rec.port}` : ''})`)

    for (const [stream, src] of [['stdout', child.stdout], ['stderr', child.stderr]] as const) {
      if (!src) continue
      let buf = ''
      src.on('data', (chunk: Buffer) => {
        buf += chunk.toString()
        const lines = buf.split('\n')
        buf = lines.pop() ?? ''
        for (const line of lines) if (line) logLine(rec, stream as 'stdout'|'stderr', line)
      })
    }

    child.on('close', (code) => {
      rec.pid      = null
      rec.stopped  = Date.now()
      rec.exitCode = code
      if (rec.status === 'stopped') { saveState(); return }
      if (code === 0) {
        rec.status = 'stopped'
        emit({ type: 'proc.stop', id: rec.id, code })
        console.log(`[zero/manage] exited  → ${rec.id} (code 0)`)
      } else {
        rec.status = 'crashed'
        emit({ type: 'proc.crash', id: rec.id, code: code ?? -1, restarts: rec.restarts })
        console.error(`[zero/manage] crashed → ${rec.id} (code ${code})`)
        scheduleRestart(rec)
      }
      saveState()
    })
  }

  function makeLiveProc(id: string, app: string, part: string, dir: string, command: string, mode: 'dev'|'prod', port?: number): LiveProc {
    return {
      id, app, part, dir, command, mode, port,
      pid: null, status: 'starting',
      started: null, stopped: null,
      restarts: 0, exitCode: null,
      ramBidGB: RAM_BID_GB,
      _proc: null, _log: null, _restartTimer: null,
    }
  }

  const handle: ProcHandle = {
    async start(id, app, part, dir, command, mode = 'prod', port) {
      if (procs.has(id)) {
        // stop gracefully before re-starting (handles redeploy / crash loop)
        try { await handle.stop(id) } catch { /* ignore */ }
      }
      const rec = makeLiveProc(id, app, part, dir, command, mode, port)
      procs.set(id, rec)
      spawnProc(rec)
      return rec
    },

    async startWorkers(id, app, part, dir, command, mode, count, basePort) {
      const workerIds: string[] = []
      const records: ProcRecord[] = []

      for (let i = 0; i < count; i++) {
        const wid  = `${id}.w${i}`
        const port = basePort + i
        if (procs.has(wid)) {
          const ex = procs.get(wid)!
          if (ex.status === 'running') { workerIds.push(wid); records.push(ex); continue }
        }
        const rec = makeLiveProc(wid, app, part, dir, command, mode, port)
        procs.set(wid, rec)
        spawnProc(rec)
        workerIds.push(wid)
        records.push(rec)
      }

      // register a coordinator entry so scale() has a target
      const coordinator: LiveProc = {
        ...makeLiveProc(id, app, part, dir, command, mode, basePort),
        workers:   count,
        workerIds,
        status:    'running',
        pid:       null,
      }
      procs.set(id, coordinator)
      saveState()
      emit({ type: 'proc.scale', id, workers: count })
      console.log(`[zero/manage] workers  → ${id} × ${count} (ports ${basePort}–${basePort + count - 1})`)
      return records
    },

    async scaleWorkers(id, count) {
      const coordinator = procs.get(id)
      if (!coordinator) throw new Error(`no worker group: ${id}`)

      const current = coordinator.workerIds ?? []
      const basePort = coordinator.port ?? 4000
      const currentCount = current.length

      if (count > currentCount) {
        // scale up
        for (let i = currentCount; i < count; i++) {
          const wid  = `${id}.w${i}`
          const port = basePort + i
          const rec  = makeLiveProc(wid, coordinator.app, coordinator.part, coordinator.dir, coordinator.command, coordinator.mode, port)
          procs.set(wid, rec)
          spawnProc(rec)
          current.push(wid)
        }
      } else if (count < currentCount) {
        // scale down — stop from the end
        for (let i = count; i < currentCount; i++) {
          const wid = current[i]
          try { await handle.stop(wid) } catch { /* might already be stopped */ }
          current.splice(i, 1)
        }
      }

      coordinator.workers   = count
      coordinator.workerIds = current.slice(0, count)
      saveState()
      emit({ type: 'proc.scale', id, workers: count })
      console.log(`[zero/manage] scaled   → ${id} × ${count}`)
    },

    async stop(id) {
      const rec = procs.get(id)
      if (!rec) throw new Error(`no process: ${id}`)

      // if this is a worker coordinator, stop all workers
      if (rec.workerIds?.length) {
        for (const wid of rec.workerIds) {
          try { await handle.stop(wid) } catch { /* already stopped */ }
        }
        rec.status = 'stopped'
        saveState()
        return
      }

      // cancel any pending restart first
      if (rec._restartTimer) { clearTimeout(rec._restartTimer); rec._restartTimer = null }

      if (rec.status === 'stopped') return   // already stopped — no-op
      rec.status = 'stopped'

      await new Promise<void>(resolve => {
        if (!rec._proc) { resolve(); return }
        rec._proc.once('close', () => resolve())
        rec._proc.kill('SIGTERM')
        setTimeout(() => { rec._proc?.kill('SIGKILL') }, 5000)
      })

      emit({ type: 'proc.stop', id, code: rec.exitCode })
      console.log(`[zero/manage] stopped → ${id}`)
      saveState()
    },

    async restart(id) {
      const rec = procs.get(id)
      if (!rec) throw new Error(`no process: ${id}`)
      if (rec.status === 'running') await handle.stop(id)
      rec.status   = 'starting'
      rec.restarts = 0
      spawnProc(rec)
      return rec
    },

    list() {
      return [...procs.values()].map(({ _proc: _, _log: __, _restartTimer: ___, ...r }) => r)
    },

    get(id) {
      const rec = procs.get(id)
      if (!rec) return undefined
      const { _proc: _, _log: __, _restartTimer: ___, ...r } = rec
      return r
    },

    bids() {
      const out: Bid[] = []
      for (const rec of procs.values()) {
        if (rec.status !== 'running' || rec.workerIds?.length) continue
        out.push({ moduleId: rec.id, resource: 'ram', requested: rec.ramBidGB, priority: 60, reason: `${rec.app}/${rec.part} process`, timestamp: Date.now() })
      }
      return out
    },
  }

  return handle
}

export function readProcState(): { procs: ProcRecord[]; updated: number } | null {
  if (!fs.existsSync(STATE_FILE)) return null
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) } catch { return null }
}

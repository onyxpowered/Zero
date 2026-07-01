import pc from 'picocolors'
import { readProcState } from '@zero/engine/manage/procs'
import type { ProcRecord } from '@zero/engine/manage'

function age(ts: number | null): string {
  if (!ts) return '—'
  const s = Math.round((Date.now() - ts) / 1000)
  if (s < 60)   return `${s}s`
  if (s < 3600) return `${Math.round(s / 60)}m`
  return `${Math.round(s / 3600)}h`
}

function statusColor(r: ProcRecord): string {
  switch (r.status) {
    case 'running':  return pc.green('running')
    case 'starting': return pc.yellow('starting')
    case 'crashed':  return pc.red('crashed')
    case 'stopped':  return pc.dim('stopped')
  }
}

export function ps(_args: string[]): void {
  const state = readProcState()

  console.log(pc.bold('\n  zero ps\n'))

  if (!state || state.procs.length === 0) {
    console.log(pc.dim('  no managed processes'))
    console.log(pc.dim('  start one with: zero start <app>'))
    console.log()
    return
  }

  const updated = Math.round((Date.now() - state.updated) / 1000)
  console.log(pc.dim(`  state as of ${updated}s ago\n`))

  for (const r of state.procs) {
    const pid      = r.pid    ? `pid ${r.pid}` : '     '
    const uptime   = r.status === 'running' ? `up ${age(r.started)}` : r.status === 'crashed' ? `crashed ${age(r.stopped)}` : `stopped ${age(r.stopped)}`
    const restarts = r.restarts > 0 ? pc.dim(` · ${r.restarts} restart${r.restarts > 1 ? 's' : ''}`) : ''
    console.log(`  ${r.id.padEnd(26)} ${statusColor(r).padEnd(18)}  ${pid.padEnd(10)}  ${uptime}${restarts}`)
    console.log(pc.dim(`    ${r.mode}  ${r.command}`))
  }
  console.log()
}

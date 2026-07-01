import pc from 'picocolors'
import crypto from 'node:crypto'
import { sendCommand } from '../bus.js'
import { readProcState } from '@zero/engine/manage/procs'

export async function stop_cmd(args: string[]): Promise<void> {
  const target = args[0]

  if (!target) {
    console.error(`  ${pc.red('error')}  usage: zero stop <id>  (e.g. zero stop MyApp.backend)`)
    console.error(`  run ${pc.bold('zero ps')} to see process IDs`)
    process.exit(1)
  }

  // expand app name to all its running processes if no dot (e.g. "MyApp" → "MyApp.backend", "MyApp.frontend")
  const ids: string[] = []
  if (!target.includes('.')) {
    const state = readProcState()
    const active = state?.procs.filter(p => p.app === target && (p.status === 'running' || p.status === 'crashed' || p.status === 'starting')) ?? []
    if (active.length === 0) {
      console.error(`  ${pc.red('error')}  no active processes for: ${target}`)
      process.exit(1)
    }
    ids.push(...active.map(p => p.id))
  } else {
    ids.push(target)
  }

  console.log(pc.bold(`\n  zero stop\n`))

  for (const id of ids) {
    try {
      const reqId  = crypto.randomUUID()
      const result = await sendCommand({ type: 'cmd.stop', reqId, id })
      if (result.ok) {
        console.log(`  ${pc.green('✓')}  ${id}`)
      } else {
        console.error(`  ${pc.red('✗')}  ${id}  ${result.message}`)
      }
    } catch (err) {
      console.error(`  ${pc.red('error')}  ${(err as Error).message}`)
    }
  }
  console.log()
}

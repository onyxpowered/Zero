import fs   from 'node:fs'
import path from 'node:path'
import os   from 'node:os'
import pc   from 'picocolors'

interface Allocation {
  moduleId:  string
  resource:  string
  requested: number
  granted:   number
  verdict:   string
  override:  boolean
  timestamp: number
}

export function logs(args: string[]): void {
  const limit = parseInt(args[0] ?? '50', 10)
  const file  = path.join(os.homedir(), '.zero', 'throttle.json')

  if (!fs.existsSync(file)) {
    console.error('error: no log data — has Zero run yet?')
    process.exit(1)
  }

  let all: Allocation[]
  try {
    all = JSON.parse(fs.readFileSync(file, 'utf8')) as Allocation[]
  } catch {
    console.error('error: could not read log data')
    process.exit(1)
  }

  const rows = [...all].reverse().slice(0, limit)
  if (rows.length === 0) { console.log('no entries yet'); return }

  console.log(pc.bold(`\n  zero logs — last ${rows.length}\n`))
  for (const r of rows) {
    const time   = new Date(r.timestamp).toLocaleTimeString()
    const full   = r.granted >= r.requested
    const denied = r.granted === 0
    const badge  = r.override ? pc.yellow(' override ')
                 : denied     ? pc.red(' denied ')
                 : full       ? pc.green(' granted ')
                 :              pc.cyan(' partial ')
    console.log(
      `  ${pc.dim(time)}  ${badge}  ` +
      `${pc.bold(r.moduleId)} → ${r.resource}  ` +
      `${r.granted}/${r.requested}  ` +
      pc.dim(r.verdict),
    )
  }
  console.log()
}

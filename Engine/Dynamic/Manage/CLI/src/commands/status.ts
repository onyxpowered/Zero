import fs   from 'node:fs'
import path from 'node:path'
import os   from 'node:os'
import pc   from 'picocolors'

interface Allocation {
  moduleId:  string
  resource:  string
  granted:   number
  requested: number
  verdict:   string
  override:  boolean
  timestamp: number
}

function bar(pct: number, width = 10): string {
  const fill  = Math.round((pct / 100) * width)
  const color = pct >= 90 ? pc.red : pct >= 75 ? pc.yellow : pc.green
  return color('█'.repeat(fill)) + pc.dim('░'.repeat(width - fill))
}

export function status(_args: string[]): void {
  const file = path.join(os.homedir(), '.zero', 'throttle.json')

  if (!fs.existsSync(file)) {
    console.error('error: no throttle data — has Zero run yet?')
    process.exit(1)
  }

  let all: Allocation[]
  try {
    all = JSON.parse(fs.readFileSync(file, 'utf8')) as Allocation[]
  } catch {
    console.error('error: could not read throttle data')
    process.exit(1)
  }

  const latest = new Map<string, Allocation>()
  for (const a of all) latest.set(`${a.moduleId}:${a.resource}`, a)
  const allocs = [...latest.values()].sort((a, b) =>
    a.moduleId.localeCompare(b.moduleId) || a.resource.localeCompare(b.resource),
  )

  console.log(pc.bold('\n  zero status\n'))

  if (allocs.length === 0) { console.log('  no allocations yet\n'); return }

  let lastModule = ''
  for (const a of allocs) {
    if (a.moduleId !== lastModule) {
      console.log(`  ${pc.bold(pc.cyan(a.moduleId))}`)
      lastModule = a.moduleId
    }
    const pct  = a.requested > 0 ? Math.round((a.granted / a.requested) * 100) : 0
    const flag = a.override ? pc.yellow(' ↑') : ''
    console.log(
      `    ${pc.dim(a.resource.padEnd(10))} ${bar(pct)} ${String(pct).padStart(3)}%` +
      `  ${pc.dim(a.granted + '/' + a.requested)}${flag}`,
    )
  }

  console.log()
  console.log(`  ${pc.dim(`${all.length} entries in log`)}`)
  console.log()
}

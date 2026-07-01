import fs   from 'node:fs'
import path from 'node:path'
import pc   from 'picocolors'
import { readInformation } from '@zero/engine'

export async function build(_args: string[]): Promise<void> {
  const cwd  = process.cwd()
  const info = readInformation()

  if (!fs.existsSync(path.join(cwd, 'zero.config.ts'))) {
    console.error(`${pc.red('error')} no zero.config.ts — are you inside a Zero app?`)
    process.exit(1)
  }

  console.log(pc.dim('[zero/build] detecting project...'))

  if (info) {
    console.log(pc.dim(`[zero/build] host → ${info.hardware.cpu.brand} · ${info.system.platform}`))
  }

  // Zero Build engine integration — coming with the Vercel layer
  console.log(pc.yellow('[zero/build] build engines coming soon — running tsc for now'))

  const { execSync } = await import('node:child_process')
  execSync('npx tsc', { cwd, stdio: 'inherit' })
  console.log(pc.green('[zero/build] done'))
}

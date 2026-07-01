import fs   from 'node:fs'
import path from 'node:path'
import pc   from 'picocolors'
import crypto from 'node:crypto'
import { sendCommand } from '../bus.js'
import { readInformation } from '@zero/engine'

export async function start_cmd(args: string[]): Promise<void> {
  const mode    = args.includes('--dev') ? 'dev' : 'prod'
  const cleaned = args.filter(a => !a.startsWith('--'))

  // resolve app name and optional parts
  let appName: string
  let parts:   string[] | undefined

  if (!cleaned[0]) {
    // infer from cwd
    const cwd = process.cwd()
    appName = path.basename(cwd)
    if (cleaned[1]) parts = [cleaned[1]]
  } else {
    appName = cleaned[0]
    if (cleaned[1]) parts = [cleaned[1]]
  }

  const info     = readInformation()
  const zeroRoot = info?.router?.zeroRoot ?? process.env.ZERO_ROOT ?? ''

  console.log(pc.bold(`\n  zero start\n`))
  console.log(pc.dim(`  app   → ${appName}`))
  if (parts) console.log(pc.dim(`  parts → ${parts.join(', ')}`))
  console.log(pc.dim(`  mode  → ${mode}`))
  console.log()

  // verify app exists
  if (zeroRoot) {
    const appDir = path.join(zeroRoot, 'Apps', appName)
    if (!fs.existsSync(appDir)) {
      console.error(`  ${pc.red('error')}  Apps/${appName} does not exist`)
      console.error(`  run ${pc.bold('zero new')} to create an app`)
      console.log()
      process.exit(1)
    }
    if (mode === 'prod') {
      const backend  = path.join(appDir, 'Backend', 'dist')
      const frontend = path.join(appDir, 'Frontend', '.next')
      if (!fs.existsSync(backend) && !fs.existsSync(frontend)) {
        console.warn(`  ${pc.yellow('warn')}  app has not been built — run ${pc.bold(`zero build`)} first`)
        console.log()
      }
    }
  }

  try {
    const reqId = crypto.randomUUID()
    const result = await sendCommand({ type: 'cmd.start', reqId, app: appName, parts, mode, zeroRoot })
    if (result.ok) {
      const started = (result.data as string[] | undefined) ?? []
      for (const id of started) {
        console.log(`  ${pc.green('✓')}  ${id}  ${pc.dim(mode)}`)
      }
      console.log()
      console.log(pc.dim('  zero ps  to check status'))
    } else {
      console.error(`  ${pc.red('✗')}  ${result.message}`)
    }
  } catch (err) {
    console.error(`  ${pc.red('error')}  ${(err as Error).message}`)
  }
  console.log()
}

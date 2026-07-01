import fs   from 'node:fs'
import path from 'node:path'
import os   from 'node:os'
import { execSync } from 'node:child_process'
import pc   from 'picocolors'
import { readInformation } from '@zero/engine'
import { isZeroApp }       from '@zero/engine/build'
import { sendCommand }     from '../bus.js'

const ZERO_DIR     = path.join(os.homedir(), '.zero')
const DEPLOYS_FILE = path.join(ZERO_DIR, 'deploys.json')

interface DeployRecord {
  app:          string
  branch:       string
  preview:      boolean
  frontendPort: number | null
  backendPort:  number | null
  frontendUrl:  string | null
  backendUrl:   string | null
  deployedAt:   number
  dir:          string
}

function readDeploys(): DeployRecord[] {
  try { return JSON.parse(fs.readFileSync(DEPLOYS_FILE, 'utf8')) } catch { return [] }
}

function writeDeploys(records: DeployRecord[]): void {
  fs.mkdirSync(ZERO_DIR, { recursive: true })
  fs.writeFileSync(DEPLOYS_FILE, JSON.stringify(records, null, 2))
}

function currentBranch(cwd: string): string {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  } catch { return 'main' }
}

function portForBranch(seed: string, base: number): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = ((h << 5) - h + seed.charCodeAt(i)) | 0
  return base + (Math.abs(h) % 900)
}

function hasBuild(cwd: string): boolean {
  return fs.existsSync(path.join(cwd, 'Frontend', '.next')) ||
         fs.existsSync(path.join(cwd, 'Frontend', 'dist')) ||
         fs.existsSync(path.join(cwd, 'Backend', 'dist'))
}

export async function deploy(args: string[]): Promise<void> {
  const cwd     = process.cwd()
  const info    = readInformation()
  const preview = args.includes('--preview') || args.includes('-p')
  const branchArg = args.find(a => a.startsWith('--branch='))?.replace('--branch=', '')

  if (!info) {
    console.error(`${pc.red('error')} Zero has not run yet — start Zero first`)
    process.exit(1)
  }

  if (!isZeroApp(cwd)) {
    console.error(`${pc.red('error')} not a Zero app — no Frontend/ or Backend/ found`)
    process.exit(1)
  }

  const appName = path.basename(cwd)
  const branch  = branchArg ?? currentBranch(cwd)
  const label   = preview ? `${pc.dim('preview')} ${pc.bold(branch)}` : pc.bold('production')

  console.log(pc.bold(`\n  zero deploy\n`))
  console.log(`  app    → ${pc.bold(appName)}`)
  console.log(`  mode   → ${label}`)
  console.log()

  if (!hasBuild(cwd)) {
    console.log(`  ${pc.yellow('warn')}  no build found — run ${pc.bold('zero build')} first`)
    console.log()
  }

  // CDN public port sits in front of Next.js
  const cdnPort      = preview ? portForBranch(`${appName}-${branch}-cdn`, 3050) : 3000
  // Next.js runs on an internal port (CDN proxies to it)
  const frontendPort = preview ? portForBranch(`${appName}-${branch}-fe`, 3100) : 3001
  const backendPort  = preview ? portForBranch(`${appName}-${branch}-be`, 4100) : 4000
  const workersArg   = args.find(a => a.startsWith('--workers='))
  const workers      = workersArg ? parseInt(workersArg.replace('--workers=', ''), 10) : 1

  const hasFrontend  = fs.existsSync(path.join(cwd, 'Frontend', '.next')) || fs.existsSync(path.join(cwd, 'Frontend', 'package.json'))
  const hasBackend   = fs.existsSync(path.join(cwd, 'Backend', 'dist', 'index.js')) || fs.existsSync(path.join(cwd, 'Backend', 'src', 'index.ts'))
  const tag          = preview ? `${appName}.${branch}` : appName

  if (hasBackend) {
    try {
      const r = await sendCommand({ type: 'cmd.start', reqId: `deploy-be-${Date.now()}`, app: tag, parts: ['Backend'], mode: 'prod', zeroRoot: info.router.zeroRoot, appDir: cwd, port: backendPort, workers })
      console.log(r.ok
        ? `  ${pc.green('✓')} backend  → ${pc.cyan(`http://localhost:${backendPort}`)}${workers > 1 ? pc.dim(` × ${workers} workers`) : ''}`
        : `  ${pc.yellow('~')} backend  → ${r.message}`)
    } catch {
      console.log(`  ${pc.yellow('~')} backend  → Zero not running · start manually: node Backend/dist/index.js`)
    }
  }

  if (hasFrontend) {
    try {
      // Next.js on internal port; CDN wraps it on public port
      const r = await sendCommand({ type: 'cmd.start', reqId: `deploy-fe-${Date.now()}`, app: tag, parts: ['Frontend'], mode: 'prod', zeroRoot: info.router.zeroRoot, appDir: cwd, port: frontendPort })
      if (r.ok) {
        // start CDN as a Zero-managed process with an explicit command
        const cdnScript = path.resolve(info.router.zeroRoot, 'dist/Engine/Dynamic/CDN/server.js')
        const cdnCmd    = `node -e "import('file://${cdnScript}').then(m=>m.createCDN({publicPort:${cdnPort},upstreams:[${frontendPort}]}))"`
        await sendCommand({
          type: 'cmd.start', reqId: `deploy-cdn-${Date.now()}`,
          app: tag, parts: ['CDN'], mode: 'prod',
          zeroRoot: info.router.zeroRoot, appDir: cwd, port: cdnPort,
          command: cdnCmd,
        })
        console.log(`  ${pc.green('✓')} cdn      → ${pc.cyan(`http://localhost:${cdnPort}`)} ${pc.dim(`(proxy → :${frontendPort})`)}`)
      } else {
        console.log(`  ${pc.yellow('~')} frontend → ${r.message}`)
      }
    } catch {
      console.log(`  ${pc.yellow('~')} frontend → Zero not running · start manually: PORT=${frontendPort} npm start`)
    }
  }

  const publicUrl = hasFrontend ? `http://localhost:${cdnPort}` : hasBackend ? `http://localhost:${backendPort}` : null

  // record
  const records = readDeploys().filter(r => !(r.app === appName && r.branch === branch && r.preview === preview))
  records.push({ app: appName, branch, preview, frontendPort: hasFrontend ? cdnPort : null, backendPort: hasBackend ? backendPort : null, frontendUrl: hasFrontend ? `http://localhost:${cdnPort}` : null, backendUrl: hasBackend ? `http://localhost:${backendPort}` : null, deployedAt: Date.now(), dir: cwd })
  writeDeploys(records)

  console.log()
  if (publicUrl) console.log(`  ${pc.bold('→')} ${pc.cyan(publicUrl)}`)
  console.log()
  if (preview) {
    console.log(pc.dim(`  preview saved · run ${pc.bold('zero preview ls')} to see all`))
  } else {
    console.log(pc.dim(`  deployed · run ${pc.bold('zero ps')} to manage processes`))
  }
  console.log()
}

export async function preview_cmd(args: string[]): Promise<void> {
  const sub = args[0]

  if (!sub || sub === 'ls' || sub === 'list') {
    const records = readDeploys().filter(r => r.preview)
    if (!records.length) {
      console.log(`\n  ${pc.dim('no preview deployments')}\n`)
      console.log(`  run ${pc.bold('zero deploy --preview')} from an app directory\n`)
      return
    }
    console.log(pc.bold(`\n  zero preview\n`))
    for (const r of records) {
      const age    = Math.round((Date.now() - r.deployedAt) / 60_000)
      const ageStr = age < 60 ? `${age}m ago` : `${Math.round(age / 60)}h ago`
      console.log(`  ${pc.bold(r.app)}  ${pc.dim(r.branch)}  ${ageStr}`)
      if (r.frontendUrl) console.log(`    ${pc.dim('frontend')} → ${pc.cyan(r.frontendUrl)}`)
      if (r.backendUrl)  console.log(`    ${pc.dim('backend')}  → ${pc.cyan(r.backendUrl)}`)
    }
    console.log()
    return
  }

  if (sub === 'rm' || sub === 'remove') {
    const branch = args[1]
    if (!branch) { console.error(`${pc.red('error')} usage: zero preview rm <branch>`); process.exit(1) }
    const records = readDeploys()
    const target  = records.find(r => r.preview && r.branch === branch)
    if (!target) { console.error(`${pc.red('error')} no preview for branch: ${branch}`); process.exit(1) }
    try { await sendCommand({ type: 'cmd.stop', reqId: `preview-rm-${Date.now()}`, id: `${target.app}.${target.branch}` }) } catch { /* ok */ }
    writeDeploys(records.filter(r => !(r.preview && r.branch === branch)))
    console.log(`\n  ${pc.green('✓')} preview removed: ${branch}\n`)
    return
  }

  console.error(`${pc.red('error')} unknown subcommand: ${sub}`)
  console.error(`  usage: zero preview ls | zero preview rm <branch>`)
  process.exit(1)
}

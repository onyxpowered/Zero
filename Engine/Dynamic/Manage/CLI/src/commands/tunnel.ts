import { spawn, spawnSync } from 'node:child_process'
import os   from 'node:os'
import path from 'node:path'
import fs   from 'node:fs'
import pc   from 'picocolors'
import { readInformation } from '@zero/engine'

const INSTALL_INSTRUCTIONS: Record<string, string> = {
  darwin: 'brew install cloudflare/cloudflare/cloudflared',
  linux:  'curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared && chmod +x /usr/local/bin/cloudflared',
  win32:  'winget install --id Cloudflare.cloudflared',
}

function hasCloudflared(): boolean {
  const r = spawnSync('cloudflared', ['--version'], { stdio: 'ignore' })
  return r.status === 0
}

function parseUrl(line: string): string | null {
  const m = line.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/i)
  return m ? m[0] : null
}

export async function tunnel(args: string[]): Promise<void> {
  const portArg = args.find(a => /^\d+$/.test(a))
  const info    = readInformation()
  const port    = portArg ? parseInt(portArg, 10) : 3000

  console.log(pc.bold(`\n  zero tunnel\n`))
  console.log(`  exposing → ${pc.cyan(`http://localhost:${port}`)}`)
  console.log()

  if (!hasCloudflared()) {
    console.log(`  ${pc.red('✗')} cloudflared not found\n`)
    const install = INSTALL_INSTRUCTIONS[process.platform] ?? 'https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/'
    console.log(`  install:`)
    console.log(`    ${pc.dim(install)}`)
    console.log()
    console.log(`  then run ${pc.bold('zero tunnel')} again`)
    console.log()
    process.exit(1)
  }

  console.log(pc.dim('  starting cloudflare quick tunnel…'))
  console.log(pc.dim('  (no account required — url is ephemeral)'))
  console.log()

  const child = spawn('cloudflared', ['tunnel', '--url', `http://localhost:${port}`], {
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  let urlPrinted = false

  function onLine(line: string): void {
    if (urlPrinted) return
    const url = parseUrl(line)
    if (url) {
      urlPrinted = true
      console.log(`  ${pc.green('✓')} tunnel live\n`)
      console.log(`  ${pc.bold('→')} ${pc.cyan(url)}\n`)
      console.log(pc.dim('  ctrl+c to stop\n'))
    }
  }

  for (const src of [child.stdout, child.stderr]) {
    if (!src) continue
    let buf = ''
    src.on('data', (chunk: Buffer) => {
      buf += chunk.toString()
      const lines = buf.split('\n')
      buf = lines.pop() ?? ''
      for (const l of lines) onLine(l)
    })
  }

  child.on('error', (err) => {
    console.error(`${pc.red('error')} cloudflared failed: ${err.message}`)
    process.exit(1)
  })

  child.on('close', (code) => {
    console.log(`\n  ${pc.dim('tunnel closed')} (exit ${code})\n`)
    process.exit(0)
  })

  // keep process alive
  await new Promise(() => {})
}

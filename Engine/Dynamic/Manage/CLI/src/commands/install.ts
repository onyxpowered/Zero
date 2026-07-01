import fs   from 'node:fs'
import path from 'node:path'
import os   from 'node:os'
import { execSync } from 'node:child_process'

const LABEL     = 'com.zero.engine'
const AGENTS    = path.join(os.homedir(), 'Library', 'LaunchAgents')
const PLIST     = path.join(AGENTS, `${LABEL}.plist`)

export function install(_args: string[]): void {
  const cliDir  = path.dirname(new URL(import.meta.url).pathname)
  const zeroRun = path.resolve(cliDir, '../../../../../..', 'dist/Engine/Dynamic/Startup/core.js')

  if (!fs.existsSync(zeroRun)) {
    console.error('error: Zero is not built — run: pnpm build')
    process.exit(1)
  }

  fs.mkdirSync(AGENTS, { recursive: true })

  const logDir = path.join(os.homedir(), '.zero', 'logs')
  fs.mkdirSync(logDir, { recursive: true })

  const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${LABEL}</string>

  <key>ProgramArguments</key>
  <array>
    <string>${process.execPath}</string>
    <string>${zeroRun}</string>
  </array>

  <key>RunAtLoad</key>
  <true/>

  <key>KeepAlive</key>
  <true/>

  <key>StandardOutPath</key>
  <string>${path.join(logDir, 'zero.log')}</string>

  <key>StandardErrorPath</key>
  <string>${path.join(logDir, 'zero.err.log')}</string>

  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key>
    <string>/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin</string>
  </dict>
</dict>
</plist>`

  fs.writeFileSync(PLIST, plist, 'utf8')
  console.log(`[zero/install] LaunchAgent → ${PLIST}`)

  try {
    execSync(`launchctl unload "${PLIST}" 2>/dev/null || true`, { stdio: 'ignore' })
    execSync(`launchctl load -w "${PLIST}"`, { stdio: 'ignore' })
    console.log('[zero/install] Zero registered as login item and starting now.')
  } catch (err) {
    console.warn(`[zero/install] launchctl failed: ${err}`)
    console.warn(`  manual load: launchctl load -w "${PLIST}"`)
  }

  console.log(`  logs → ${logDir}`)
  console.log('  to remove: zero uninstall')
}

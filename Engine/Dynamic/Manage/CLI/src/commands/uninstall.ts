import fs   from 'node:fs'
import path from 'node:path'
import os   from 'node:os'
import { execSync } from 'node:child_process'

const LABEL = 'com.zero.engine'
const PLIST = path.join(os.homedir(), 'Library', 'LaunchAgents', `${LABEL}.plist`)

export function uninstall(_args: string[]): void {
  if (!fs.existsSync(PLIST)) {
    console.log('[zero/uninstall] Zero is not installed as a login item.')
    return
  }

  try {
    execSync(`launchctl unload -w "${PLIST}"`, { stdio: 'ignore' })
    console.log('[zero/uninstall] stopped and removed from login items.')
  } catch {
    console.warn('[zero/uninstall] launchctl unload failed — removing plist anyway.')
  }

  try {
    fs.unlinkSync(PLIST)
    console.log(`[zero/uninstall] removed ${PLIST}`)
  } catch (err) {
    console.error(`[zero/uninstall] could not remove plist: ${err}`)
  }

  console.log('[zero/uninstall] done. logs remain at ~/.zero/logs/')
}

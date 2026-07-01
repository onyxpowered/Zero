import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

export function runScript(
  cwd: string,
  scriptName: string,
  env?: NodeJS.ProcessEnv
): void {
  const pkgPath = path.join(cwd, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')) as { scripts?: Record<string, string> }
  const script = pkg.scripts?.[scriptName]
  if (!script) throw new Error(`No "${scriptName}" script in ${pkgPath}`)

  const pm = fs.existsSync(path.join(cwd, 'pnpm-lock.yaml')) ? 'pnpm'
           : fs.existsSync(path.join(cwd, 'yarn.lock'))      ? 'yarn'
           : 'npm'

  execFileSync(pm, ['run', scriptName], {
    cwd,
    stdio: 'inherit',
    env: { ...process.env, ...env },
    shell: process.platform === 'win32',
  })
}

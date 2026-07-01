import fs   from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'
import pc from 'picocolors'

export function dev(_args: string[]): void {
  const cwd   = process.cwd()
  const entry = path.join(cwd, 'src', 'index.ts')

  if (!fs.existsSync(path.join(cwd, 'zero.config.ts'))) {
    console.error(`${pc.red('error')} no zero.config.ts — are you inside a Zero app?`)
    process.exit(1)
  }
  if (!fs.existsSync(entry)) {
    console.error(`${pc.red('error')} src/index.ts not found`)
    process.exit(1)
  }

  console.log(pc.dim('[zero/dev] starting with tsx --watch'))

  const child = spawn('npx', ['tsx', '--watch', entry], { cwd, stdio: 'inherit', shell: true })

  process.on('SIGINT',  () => child.kill('SIGINT'))
  process.on('SIGTERM', () => child.kill('SIGTERM'))
  child.on('exit', code => process.exit(code ?? 0))
}

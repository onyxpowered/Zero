import fs   from 'node:fs'
import path from 'node:path'
import os   from 'node:os'
import pc   from 'picocolors'
import { readInformation } from '@zero/engine'

const TOPICS = ['zero', 'getting-started', 'commands', 'modules', 'build']

export function help(args: string[]): void {
  const topic = args[0]

  // find Docs/ — use Zero root from information.json, fall back to relative from CLI
  const info    = readInformation()
  const zeroRoot = info?.router?.zeroRoot
    ?? path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../../../../..')

  const docsDir = path.join(zeroRoot, 'Docs')

  if (!topic) {
    // list available topics
    console.log(pc.bold('\n  zero help\n'))
    if (fs.existsSync(docsDir)) {
      const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.txt'))
      for (const f of files) {
        console.log(`  ${pc.bold('zero help')} ${pc.cyan(path.basename(f, '.txt'))}`)
      }
    } else {
      for (const t of TOPICS) {
        console.log(`  ${pc.bold('zero help')} ${pc.cyan(t)}`)
      }
    }
    console.log()
    return
  }

  const file = path.join(docsDir, `${topic}.txt`)
  if (!fs.existsSync(file)) {
    console.error(`${pc.red('error')} no docs for: ${topic}`)
    console.error(`run ${pc.bold('zero help')} to see available topics`)
    process.exit(1)
  }

  const content = fs.readFileSync(file, 'utf8')
  console.log()
  for (const line of content.split('\n')) {
    console.log(`  ${line}`)
  }
}

#!/usr/bin/env node
import pc from 'picocolors'
import { commands } from './commands/index.js'
import { VERSION }  from './commands/index.js'

const [,, cmd, ...args] = process.argv

if (!cmd || cmd === '-h' || cmd === '--help') {
  printHelp()
  process.exit(0)
}

if (cmd === '-v' || cmd === '--version') {
  console.log(VERSION)
  process.exit(0)
}

const handler = commands[cmd]
if (!handler) {
  console.error(`${pc.red('error')} unknown command: ${pc.bold(cmd)}`)
  console.error(`run ${pc.bold('zero help')} to see available commands`)
  process.exit(1)
}

await handler(args)

function printHelp() {
  console.log(`
  ${pc.bold('zero')} ${pc.dim(`v${VERSION}`)}

  ${pc.dim('usage:')}  zero <command> [args]

  ${pc.dim('commands:')}
    ${pc.bold('new')} <name>              create a new app
    ${pc.bold('dev')}                     start in development mode
    ${pc.bold('build')}                   build for production
    ${pc.bold('deploy')}                  deploy your app
    ${pc.bold('status')}                  runtime status
    ${pc.bold('logs')} [n]                last n log entries  ${pc.dim('(default 50)')}
    ${pc.bold('install')}                 register as login item  ${pc.dim('(macOS)')}
    ${pc.bold('uninstall')}               remove login item
    ${pc.bold('help')} [topic]            show docs

  ${pc.dim('flags:')}
    ${pc.bold('-v')}, ${pc.bold('--version')}           print version
    ${pc.bold('-h')}, ${pc.bold('--help')}              print this help
`.trim())
}

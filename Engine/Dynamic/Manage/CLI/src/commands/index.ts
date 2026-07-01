import { newApp }              from './new.js'
import { dev }                 from './dev.js'
import { build_cmd }           from './build.js'
import { deploy, preview_cmd } from './deploy.js'
import { status }              from './status.js'
import { logs }                from './logs.js'
import { help }                from './help.js'
import { install }             from './install.js'
import { uninstall }           from './uninstall.js'
import { cache_cmd }           from './cache.js'
import { start_cmd }           from './start.js'
import { stop_cmd }            from './stop.js'
import { ps }                  from './ps.js'
import { module_cmd }          from './module.js'
import { tunnel }              from './tunnel.js'

export const VERSION = '0.1.0'

export const commands: Record<string, (args: string[]) => void | Promise<void>> = {
  new:       newApp,
  dev,
  build:     build_cmd,
  deploy,
  preview:   preview_cmd,
  start:     start_cmd,
  stop:      stop_cmd,
  ps,
  module:    module_cmd,
  tunnel,
  status,
  logs,
  help,
  install,
  uninstall,
  cache:     cache_cmd,
}

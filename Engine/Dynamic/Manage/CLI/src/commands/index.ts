import { newApp }    from './new.js'
import { dev }       from './dev.js'
import { build }     from './build.js'
import { deploy }    from './deploy.js'
import { status }    from './status.js'
import { logs }      from './logs.js'
import { help }      from './help.js'
import { install }   from './install.js'
import { uninstall } from './uninstall.js'

export const VERSION = '0.1.0'

export const commands: Record<string, (args: string[]) => void | Promise<void>> = {
  new:       newApp,
  dev,
  build,
  deploy,
  status,
  logs,
  help,
  install,
  uninstall,
}

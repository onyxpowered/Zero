import { intro, outro, text, confirm, spinner } from '@clack/prompts'
import fs           from 'node:fs'
import path         from 'node:path'
import os           from 'node:os'
import { execSync } from 'node:child_process'
import { readInformation } from '@zero/engine'

export async function newApp(args: string[]): Promise<void> {
  intro('zero new')

  let name = args[0]
  if (!name) {
    const a = await text({
      message:     'app name',
      placeholder: 'my-app',
      validate:    v => v.trim().length < 2 ? 'needs at least 2 characters' : undefined,
    })
    if (typeof a !== 'string') process.exit(0)
    name = a.trim()
  }

  // find the Zero workspace root from information.json
  const info = readInformation()
  let   root: string

  if (info?.router?.zeroRoot && fs.existsSync(info.router.zeroRoot)) {
    root = info.router.zeroRoot
  } else if (process.env.ZERO_ROOT && fs.existsSync(process.env.ZERO_ROOT)) {
    root = process.env.ZERO_ROOT
  } else {
    console.error('error: Zero has not run yet, or ZERO_ROOT is not set')
    console.error('  run Zero first, or: export ZERO_ROOT=/path/to/Zero')
    process.exit(1)
  }

  const targetDir = path.join(root, 'Apps', name)

  if (fs.existsSync(targetDir)) {
    console.error(`error: Apps/${name} already exists`)
    process.exit(1)
  }

  const ok = await confirm({ message: `create Apps/${name}?` })
  if (!ok) { outro('cancelled'); process.exit(0) }

  const s = spinner()

  s.start('scaffolding')
  scaffold(targetDir, name)
  s.stop('files created')

  s.start('installing')
  execSync('pnpm install', { cwd: root, stdio: 'ignore' })
  s.stop('done')

  outro(`Apps/${name} ready\n  cd Apps/${name} && zero dev`)
}

function write(dir: string, file: string, content: string): void {
  const full = path.join(dir, file)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, content, 'utf8')
}

function scaffold(dir: string, name: string): void {
  write(dir, 'package.json', JSON.stringify({
    name, version: '0.0.1', private: true, type: 'module',
    scripts: { dev: 'zero dev', build: 'tsc' },
    dependencies:    { '@zero/engine': 'workspace:*' },
    devDependencies: { '@types/node': '^22.0.0', tsx: '^4.0.0', typescript: '^5.4.5' },
  }, null, 2))

  write(dir, 'tsconfig.json', JSON.stringify({
    compilerOptions: {
      target: 'ES2022', module: 'NodeNext', moduleResolution: 'NodeNext',
      lib: ['ES2022'], strict: true, esModuleInterop: true, skipLibCheck: true,
      declaration: true, sourceMap: true, outDir: 'dist', rootDir: 'src',
    },
    include: ['src/**/*', 'zero.config.ts'],
    exclude: ['node_modules', 'dist'],
  }, null, 2))

  write(dir, 'zero.config.ts',
`import type { ZeroConfig } from '@zero/engine'

const config: Partial<ZeroConfig> = {}

export default config
`)

  write(dir, 'src/index.ts',
`import { Zero } from '@zero/engine'
import { ExampleModule } from '../Modules/example.js'

Zero
  .use(ExampleModule)
  .init()
  .then(() => { console.log('[${name}] started') })
`)

  write(dir, 'Modules/example.ts',
`import type { ZeroModule } from '@zero/engine'

export const ExampleModule: ZeroModule = {
  id:      'example',
  version: '0.0.1',

  async boot()     { console.log('[example] booted') },
  async teardown() { console.log('[example] torn down') },
  onAllocation(_a) {},

  bids() {
    return [{
      moduleId:  'example',
      resource:  'ram',
      requested: 0.25,
      priority:  50,
      reason:    'example module baseline',
      timestamp: Date.now(),
    }]
  },
}
`)

  write(dir, '.gitignore', 'node_modules/\ndist/\n')
}

import { intro, outro, text, confirm, spinner } from '@clack/prompts'
import fs           from 'node:fs'
import path         from 'node:path'
import { execSync } from 'node:child_process'
import { readInformation } from '@zero/engine'

export async function newApp(args: string[]): Promise<void> {
  const yes  = args.includes('--yes') || args.includes('-y')
  const rest = args.filter(a => a !== '--yes' && a !== '-y')

  intro('zero new')

  let name = rest[0]
  if (!name) {
    const a = await text({
      message:     'app name',
      placeholder: 'my-app',
      validate:    v => v.trim().length < 2 ? 'needs at least 2 characters' : undefined,
    })
    if (typeof a !== 'string') process.exit(0)
    name = a.trim()
  }

  const info = readInformation()
  let   root: string

  if (info?.router?.zeroRoot && fs.existsSync(info.router.zeroRoot)) {
    root = info.router.zeroRoot
  } else if (process.env.ZERO_ROOT && fs.existsSync(process.env.ZERO_ROOT)) {
    root = process.env.ZERO_ROOT
  } else {
    console.error('error: Zero is not running. start Zero first, or: export ZERO_ROOT=/path/to/Zero')
    process.exit(1)
  }

  const targetDir = path.join(root, 'Apps', name)

  if (fs.existsSync(targetDir)) {
    console.error(`error: Apps/${name} already exists`)
    process.exit(1)
  }

  const ok = yes ? true : await confirm({ message: `create Apps/${name}?` })
  if (!ok) { outro('cancelled'); process.exit(0) }

  const s = spinner()

  s.start('scaffolding')
  scaffoldApp(targetDir, name, root)
  s.stop('files written')

  s.start('installing frontend dependencies')
  execSync('npm install', { cwd: path.join(targetDir, 'Frontend'), stdio: 'ignore' })
  s.stop('done')

  s.start('installing backend dependencies')
  execSync('npm install', { cwd: path.join(targetDir, 'Backend'), stdio: 'ignore' })
  s.stop('done')

  s.start('verifying types')
  try {
    execSync('npx tsc --noEmit', { cwd: path.join(targetDir, 'Backend'), stdio: 'ignore' })
    s.stop('types ok')
  } catch {
    s.stop('type errors found — run: cd Apps/' + name + '/Backend && npx tsc --noEmit')
  }

  outro(`Apps/${name} ready

  frontend  →  cd Apps/${name}/Frontend && zero dev
  backend   →  cd Apps/${name}/Backend  && zero dev
  modules   →  Apps/${name}/Modules/ (Zero-monitored, live-loaded)`)
}

function write(dir: string, file: string, content: string): void {
  const full = path.join(dir, file)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, content, 'utf8')
}

function scaffoldApp(dir: string, name: string, zeroRoot: string): void {
  // ── root ──────────────────────────────────────────────────────────────────
  write(dir, 'zero.config.ts',
`import type { ZeroConfig } from '@zero/engine'

const config: Partial<ZeroConfig> = {}

export default config
`)

  write(dir, '.gitignore', 'node_modules/\ndist/\n.next/\n')

  // ── Frontend ──────────────────────────────────────────────────────────────
  scaffoldFrontend(path.join(dir, 'Frontend'), name, zeroRoot)

  // ── Backend ───────────────────────────────────────────────────────────────
  scaffoldBackend(path.join(dir, 'Backend'), name)

  // ── Modules ───────────────────────────────────────────────────────────────
  scaffoldModules(path.join(dir, 'Modules'), name)
}

// ─── Frontend (Next.js + Zero UI) ─────────────────────────────────────────────

function scaffoldFrontend(dir: string, name: string, zeroRoot: string): void {
  write(dir, 'package.json', JSON.stringify({
    name:    `${name}-frontend`,
    version: '0.0.1',
    private: true,
    type:    'module',
    scripts: {
      dev:       'next dev',
      build:     'next build',
      start:     'next start',
      typecheck: 'tsc --noEmit',
    },
    dependencies: {
      'next':                      '^16.2.6',
      'react':                     '^19.0.0',
      'react-dom':                 '^19.0.0',
      'next-themes':               '^0.4.6',
      '@base-ui/react':            '^1.6.0',
      'class-variance-authority':  '^0.7.1',
      'clsx':                      '^2.1.1',
      'tailwind-merge':            '^3.6.0',
      'lucide-react':              '^0.474.0',
      'cmdk':                      '^1.0.0',
      'embla-carousel-react':      '^8.6.0',
      'input-otp':                 '^1.4.2',
      'react-day-picker':          '^9.7.0',
      'react-resizable-panels':    '^2.1.7',
      'recharts':                  '^3.0.0',
      'sonner':                    '^2.0.3',
      'vaul':                      '^1.1.2',
    },
    devDependencies: {
      '@tailwindcss/postcss': '^4',
      '@types/node':          '^20',
      '@types/react':         '^19',
      '@types/react-dom':     '^19',
      'tailwindcss':          '^4',
      'tw-animate-css':       '^1.2.9',
      'typescript':           '^5',
    },
  }, null, 2))

  write(dir, 'tsconfig.json', JSON.stringify({
    compilerOptions: {
      target:          'ES2017',
      lib:             ['dom', 'dom.iterable', 'esnext'],
      allowJs:         true,
      skipLibCheck:    true,
      strict:          true,
      noEmit:          true,
      esModuleInterop: true,
      module:          'esnext',
      moduleResolution:'bundler',
      resolveJsonModule: true,
      isolatedModules: true,
      jsx:             'preserve',
      incremental:     true,
      plugins:         [{ name: 'next' }],
      paths:           { '@/*': ['./*'] },
    },
    include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
    exclude: ['node_modules'],
  }, null, 2))

  write(dir, 'next.config.ts',
`import type { NextConfig } from 'next'

const config: NextConfig = {}

export default config
`)

  write(dir, 'postcss.config.mjs',
`const config = {
  plugins: { '@tailwindcss/postcss': {} },
}

export default config
`)

  // copy Zero UI components (skip components with unpublished peer deps)
  const SKIP_COMPONENTS = new Set(['message-scroller.tsx'])
  const uiSrc = path.join(zeroRoot, 'Engine', 'Static', 'UI', 'components', 'ui')
  const uiDst = path.join(dir, 'components', 'ui')
  if (fs.existsSync(uiSrc)) {
    fs.mkdirSync(uiDst, { recursive: true })
    for (const file of fs.readdirSync(uiSrc)) {
      if (SKIP_COMPONENTS.has(file)) continue
      fs.copyFileSync(path.join(uiSrc, file), path.join(uiDst, file))
    }
  }

  // hooks/use-mobile.ts
  write(dir, 'hooks/use-mobile.ts',
`import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(\`(max-width: \${MOBILE_BREAKPOINT - 1}px)\`)
    const onChange = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
`)

  // lib/utils.ts
  write(dir, 'lib/utils.ts',
`import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
`)

  // globals.css — copy from Zero UI
  const globalsSrc = path.join(zeroRoot, 'Engine', 'Static', 'UI', 'styles', 'globals.css')
  if (fs.existsSync(globalsSrc)) {
    write(dir, 'app/globals.css', fs.readFileSync(globalsSrc, 'utf8'))
  }

  write(dir, 'app/layout.tsx',
`import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import './globals.css'

const fontSans = Geist({ subsets: ['latin'], variable: '--font-sans' })
const fontMono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: '${name}',
  description: 'Built with Zero',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={\`\${fontSans.variable} \${fontMono.variable} font-sans antialiased\`}>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
`)

  write(dir, 'app/page.tsx', zeroWelcomePage(name))
}

function zeroWelcomePage(name: string): string {
  return `import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function Page() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-background p-8">
      <div className="w-full max-w-lg space-y-6">

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">${name}</h1>
            <Badge variant="secondary">Zero</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Your app is running. Start building in <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">Frontend/app/</code>
          </p>
        </div>

        <Separator />

        <div className="grid gap-3">
          <Card>
            <CardHeader>
              <CardTitle>Frontend</CardTitle>
              <CardDescription>Next.js · Zero UI · Tailwind v4</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Edit <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">app/page.tsx</code> to get started.
                All 60 Zero UI components are available in <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">components/ui/</code>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Backend</CardTitle>
              <CardDescription>Node.js · TypeScript</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Your backend lives in <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">../Backend/src/</code>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Modules</CardTitle>
              <CardDescription>Zero-monitored · live-loaded</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Drop a <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">.ts</code> file in <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">../Modules/</code> and Zero picks it up instantly.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2">
          <Button size="sm">Open docs</Button>
          <Button size="sm" variant="outline">zero help</Button>
        </div>

      </div>
    </main>
  )
}
`
}

// ─── Backend ──────────────────────────────────────────────────────────────────

function scaffoldBackend(dir: string, name: string): void {
  write(dir, 'package.json', JSON.stringify({
    name:    `${name}-backend`,
    version: '0.0.1',
    private: true,
    type:    'module',
    scripts: { dev: 'tsx --watch src/index.ts', build: 'tsc', start: 'node dist/index.js' },
    dependencies:    {},
    devDependencies: { '@types/node': '^22', tsx: '^4', typescript: '^5' },
  }, null, 2))

  write(dir, 'tsconfig.json', JSON.stringify({
    compilerOptions: {
      target: 'ES2022', module: 'NodeNext', moduleResolution: 'NodeNext',
      lib: ['ES2022'], strict: true, esModuleInterop: true, skipLibCheck: true,
      outDir: 'dist', rootDir: 'src',
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist'],
  }, null, 2))

  write(dir, 'zero.config.ts',
`import type { ZeroConfig } from '@zero/engine'

const config: Partial<ZeroConfig> = {}

export default config
`)

  write(dir, 'src/index.ts',
`console.log('[${name}/backend] started')
`)
}

// ─── Modules ──────────────────────────────────────────────────────────────────

function scaffoldModules(dir: string, name: string): void {
  write(dir, 'example.ts',
`import type { ZeroModule, ManageAPI } from '@zero/engine/manage'

export const ExampleModule: ZeroModule = {
  id:      '${name}.example',
  version: '0.0.1',

  async boot(api: ManageAPI) {
    console.log('[${name}/modules] example booted')
    api.emit({ type: 'module.load', id: '${name}.example', version: '0.0.1' })
  },
  async teardown() {},
  onAllocation(_a) {},

  bids() {
    return [{
      moduleId:  '${name}.example',
      resource:  'ram',
      requested: 0.25,
      priority:  50,
      reason:    '${name} example module',
      timestamp: Date.now(),
    }]
  },
}
`)
}

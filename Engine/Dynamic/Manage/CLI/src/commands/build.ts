import fs   from 'node:fs'
import path from 'node:path'
import pc   from 'picocolors'
import { readInformation }                    from '@zero/engine'
import { build, buildApp, detect, isZeroApp } from '@zero/engine/build'
import { ZeroBuildError }                     from '@zero/engine/build/run'
import { emitToBus }                          from '../bus.js'

function fmt(ms: number): string {
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`
}

function appName(cwd: string): string {
  return path.basename(cwd)
}

export async function build_cmd(args: string[]): Promise<void> {
  const cwd     = process.cwd()
  const info    = readInformation()
  const noCache = args.includes('--no-cache')
  const outDir  = args.find(a => a.startsWith('--out='))?.replace('--out=', '')

  if (!info) {
    console.error(`${pc.red('error')} Zero has not run yet — start Zero first`)
    process.exit(1)
  }

  console.log(pc.bold(`\n  zero build\n`))
  console.log(pc.dim(`  host  → ${info.hardware.cpu.brand} · ${info.system.platform}`))
  console.log()

  try {
    // Zero app (has Frontend/ and/or Backend/) — task graph build
    if (isZeroApp(cwd)) {
      const app_  = appName(cwd)
      await emitToBus('builds', { type: 'build.start', app: app_, part: 'app', engine: 'zero', cacheKey: '' })

      const app = await buildApp(cwd, info, { noCache, ...(outDir ? { outDir } : {}) })

      console.log()
      for (const { name, result } of app.parts) {
        const label = result.cached
          ? `${pc.cyan('cached')} · ${result.cacheKey?.slice(0, 8)}`
          : `${result.files.length} files · ${fmt(result.duration)}`
        const steps = result.cached
          ? ''
          : '  ' + result.steps.map(s => `${s.step} ${fmt(s.duration)}`).join(' · ')
        console.log(`  ${pc.green('✓')} ${name.padEnd(10)} ${label}`)
        if (steps) console.log(pc.dim(steps))

        await emitToBus('builds', {
          type: 'build.done', app: app_, part: name, engine: 'node',
          duration: result.duration, cached: result.cached ?? false,
          files: result.files.length, cacheKey: result.cacheKey ?? '',
        })
      }
      console.log()
      console.log(pc.dim(`  total  ${fmt(app.duration)}`))
      console.log()
      return
    }

    // Single project build
    if (!fs.existsSync(path.join(cwd, 'package.json')) &&
        !fs.existsSync(path.join(cwd, 'go.mod'))        &&
        !fs.existsSync(path.join(cwd, 'Cargo.toml'))    &&
        !fs.existsSync(path.join(cwd, 'Gemfile'))        &&
        !fs.existsSync(path.join(cwd, 'requirements.txt')) &&
        !fs.existsSync(path.join(cwd, 'index.html'))) {
      console.error(`${pc.red('error')} no project detected in current directory`)
      process.exit(1)
    }

    const found = await detect(cwd)
    if (!found) {
      console.error(`${pc.red('error')} no build engine detected`)
      console.error(`  supported: Node.js · Python · Go · Ruby · Rust · Static`)
      process.exit(1)
    }

    console.log(pc.dim(`  engine    → ${found.engine.name}`))
    if (found.framework) console.log(pc.dim(`  framework → ${found.framework}`))
    console.log()

    const app_ = appName(cwd)
    await emitToBus('builds', { type: 'build.start', app: app_, part: 'default', engine: found.engine.name, cacheKey: '' })

    const result = await build(cwd, info, { noCache, ...(outDir ? { outDir } : {}) })

    await emitToBus('builds', {
      type: 'build.done', app: app_, part: 'default', engine: found.engine.name,
      duration: result.duration, cached: result.cached ?? false,
      files: result.files.length, cacheKey: result.cacheKey ?? '',
    })

    console.log()
    if (result.cached) {
      console.log(`  ${pc.green('✓')} ${result.files.length} files · ${pc.cyan('from cache')} · ${result.cacheKey?.slice(0, 8)}`)
    } else {
      const steps = result.steps.map(s => `${s.step} ${fmt(s.duration)}`).join(' · ')
      console.log(`  ${pc.green('✓')} ${result.files.length} files · ${fmt(result.duration)}`)
      if (steps) console.log(pc.dim(`  ${steps}`))
    }
    console.log()

  } catch (err) {
    console.log()

    if (err instanceof ZeroBuildError) {
      await emitToBus('builds', {
        type: 'build.error', app: appName(cwd), part: 'unknown', engine: 'node',
        step: err.step, exitCode: err.exitCode ?? 1, hints: err.hints,
      })

      const combined = [err.stdout, err.stderr].filter(Boolean).join('\n').trim()
      if (combined) {
        console.error(pc.dim('─'.repeat(60)))
        console.error(combined)
        console.error(pc.dim('─'.repeat(60)))
      }

      console.error(`\n  ${pc.red('✗')} ${pc.bold(err.step)} failed  (exit ${err.exitCode})`)
      console.error(`    ${pc.dim(err.command)}`)
      for (const hint of err.hints) {
        console.error(`\n  ${pc.yellow('hint')}  ${hint}`)
      }
    } else {
      console.error(`  ${pc.red('error')}  ${(err as Error).message}`)
    }

    console.log()
    process.exit(1)
  }
}

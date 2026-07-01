import fs   from 'node:fs'
import path from 'node:path'
import os   from 'node:os'
import pc   from 'picocolors'

const ZERO_DIR     = path.join(os.homedir(), '.zero')
const MODULES_DIR  = path.join(ZERO_DIR, 'modules')
const MANIFEST     = path.join(ZERO_DIR, 'modules.json')

interface ModuleEntry {
  id:        string
  source:    string
  file:      string
  addedAt:   number
}

function readManifest(): ModuleEntry[] {
  try { return JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) } catch { return [] }
}

function writeManifest(entries: ModuleEntry[]): void {
  fs.mkdirSync(ZERO_DIR, { recursive: true })
  fs.writeFileSync(MANIFEST, JSON.stringify(entries, null, 2))
}

// resolve a GitHub shorthand owner/repo[/path/to/file.ts] → raw URL
function githubToRaw(spec: string): string | null {
  // must match owner/repo or owner/repo/path...
  if (!/^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+/.test(spec)) return null
  const parts = spec.split('/')
  const [owner, repo, ...rest] = parts
  const filePath = rest.length ? rest.join('/') : 'module.ts'
  const file = filePath.endsWith('.ts') ? filePath : `${filePath}.ts`
  return `https://raw.githubusercontent.com/${owner}/${repo}/main/${file}`
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, { signal: AbortSignal.timeout(10_000) })
  if (!res.ok) throw new Error(`fetch failed: ${res.status} ${res.statusText}`)
  return res.text()
}

function slugify(s: string): string {
  return s.replace(/[^a-zA-Z0-9_-]/g, '-').replace(/-+/g, '-').toLowerCase()
}

export async function module_cmd(args: string[]): Promise<void> {
  const sub = args[0]

  // ── zero module ls ───────────────────────────────────────────────────────────
  if (!sub || sub === 'ls' || sub === 'list') {
    const entries = readManifest()
    if (!entries.length) {
      console.log(`\n  ${pc.dim('no remote modules installed')}\n`)
      console.log(`  run ${pc.bold('zero module add <url|owner/repo>')}\n`)
      return
    }
    console.log(pc.bold(`\n  zero module\n`))
    for (const e of entries) {
      const age    = Math.round((Date.now() - e.addedAt) / 86_400_000)
      const ageStr = age === 0 ? 'today' : `${age}d ago`
      console.log(`  ${pc.bold(e.id)}  ${pc.dim(ageStr)}`)
      console.log(`    ${pc.dim(e.source)}`)
    }
    console.log()
    return
  }

  // ── zero module add <specifier> ──────────────────────────────────────────────
  if (sub === 'add') {
    const spec = args[1]
    if (!spec) {
      console.error(`${pc.red('error')} usage: zero module add <url | owner/repo | ./local.ts>`)
      process.exit(1)
    }

    let url: string
    let id: string

    if (spec.startsWith('http://') || spec.startsWith('https://')) {
      url = spec
      id  = slugify(path.basename(new URL(spec).pathname, '.ts'))
    } else if (spec.startsWith('./') || spec.startsWith('/')) {
      // local copy
      const abs = path.resolve(spec)
      if (!fs.existsSync(abs)) { console.error(`${pc.red('error')} file not found: ${abs}`); process.exit(1) }
      id = slugify(path.basename(abs, '.ts'))
      fs.mkdirSync(MODULES_DIR, { recursive: true })
      const dest = path.join(MODULES_DIR, `${id}.ts`)
      fs.copyFileSync(abs, dest)
      const entries = readManifest().filter(e => e.id !== id)
      entries.push({ id, source: abs, file: dest, addedAt: Date.now() })
      writeManifest(entries)
      console.log(`\n  ${pc.green('✓')} module added: ${pc.bold(id)}`)
      console.log(`  ${pc.dim('restart Zero to load it')}\n`)
      return
    } else {
      const raw = githubToRaw(spec)
      if (!raw) { console.error(`${pc.red('error')} unrecognised specifier: ${spec}`); process.exit(1) }
      url = raw
      const [, repo, ...rest] = spec.split('/')
      id  = slugify(rest.length ? path.basename(rest.join('/'), '.ts') : repo)
    }

    console.log(`\n  ${pc.dim('fetching')} ${url}`)
    let source: string
    try {
      source = await fetchText(url)
    } catch (e) {
      console.error(`${pc.red('error')} ${(e as Error).message}`)
      process.exit(1)
    }

    fs.mkdirSync(MODULES_DIR, { recursive: true })
    const dest = path.join(MODULES_DIR, `${id}.ts`)
    fs.writeFileSync(dest, source, 'utf8')

    const entries = readManifest().filter(e => e.id !== id)
    entries.push({ id, source: url, file: dest, addedAt: Date.now() })
    writeManifest(entries)

    console.log(`  ${pc.green('✓')} module added: ${pc.bold(id)}`)
    console.log(`  ${pc.dim('file')} → ${dest}`)
    console.log(`  ${pc.dim('restart Zero to load it')}\n`)
    return
  }

  // ── zero module rm <id> ──────────────────────────────────────────────────────
  if (sub === 'rm' || sub === 'remove') {
    const id = args[1]
    if (!id) { console.error(`${pc.red('error')} usage: zero module rm <id>`); process.exit(1) }
    const entries = readManifest()
    const target  = entries.find(e => e.id === id)
    if (!target) { console.error(`${pc.red('error')} module not found: ${id}`); process.exit(1) }
    try { fs.unlinkSync(target.file) } catch { /* already gone */ }
    writeManifest(entries.filter(e => e.id !== id))
    console.log(`\n  ${pc.green('✓')} module removed: ${id}\n`)
    return
  }

  // ── zero module update <id> ──────────────────────────────────────────────────
  if (sub === 'update') {
    const id = args[1]
    if (!id) { console.error(`${pc.red('error')} usage: zero module update <id>`); process.exit(1) }
    const entries = readManifest()
    const target  = entries.find(e => e.id === id)
    if (!target) { console.error(`${pc.red('error')} module not found: ${id}`); process.exit(1) }
    if (!target.source.startsWith('http')) { console.error(`${pc.red('error')} local modules can't be auto-updated`); process.exit(1) }
    console.log(`\n  ${pc.dim('fetching')} ${target.source}`)
    const source = await fetchText(target.source)
    fs.writeFileSync(target.file, source, 'utf8')
    target.addedAt = Date.now()
    writeManifest(entries)
    console.log(`  ${pc.green('✓')} ${id} updated · restart Zero to reload\n`)
    return
  }

  console.error(`${pc.red('error')} unknown subcommand: ${sub}`)
  console.error(`  usage: zero module ls | add <spec> | rm <id> | update <id>`)
  process.exit(1)
}

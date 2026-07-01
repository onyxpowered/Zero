import type { ZeroDetectorFilesystem } from './filesystem.js'
import type { ZeroFramework, ZeroFrameworkDetector } from './types.js'

function filterFrameworks(list: readonly ZeroFramework[]): ZeroFramework[] {
  return list.filter(f => !f.experimental) as ZeroFramework[]
}

async function checkDetector(
  fs: ZeroDetectorFilesystem,
  detector: ZeroFrameworkDetector,
  slug: string
): Promise<{ detectedVersion?: string } | null> {
  if (detector.matchPackage && detector.matchContent) {
    throw new Error(`Cannot specify "matchPackage" and "matchContent" in detector for "${slug}"`)
  }
  if (detector.matchPackage && detector.path) {
    throw new Error(`Cannot specify "matchPackage" and "path" in detector for "${slug}"`)
  }
  if (!detector.path && !detector.matchPackage) {
    throw new Error(`Must specify "path" or "matchPackage" in detector for "${slug}"`)
  }

  const filePath      = detector.path ?? 'package.json'
  const matchContent  = detector.matchPackage
    ? `"(dev)?(d|D)ependencies":\\s*{[^}]*"${detector.matchPackage}":\\s*"(.+?)"[^}]*}`
    : detector.matchContent

  if (!await fs.hasPath(filePath)) return null
  if (matchContent) {
    if (!await fs.isFile(filePath)) return null
    const text  = (await fs.readFile(filePath)).toString()
    const match = text.match(new RegExp(matchContent, 'm'))
    if (!match) return null
    if (detector.matchPackage && match[3]) return { detectedVersion: match[3] }
  }
  return {}
}

async function matchFramework(
  fs: ZeroDetectorFilesystem,
  framework: ZeroFramework
): Promise<{ framework: ZeroFramework; detectedVersion?: string } | null> {
  const { detectors } = framework
  if (!detectors) return null
  const { every, some } = detectors
  if (every !== undefined && !Array.isArray(every)) return null
  if (some  !== undefined && !Array.isArray(some))  return null

  const results: ({ detectedVersion?: string } | null)[] = []

  if (every) {
    const everyResults = await Promise.all(every.map(d => checkDetector(fs, d, framework.slug ?? 'unknown')))
    results.push(...everyResults)
  }
  if (some) {
    let found: { detectedVersion?: string } | null = null
    for (const d of some) {
      const r = await checkDetector(fs, d, framework.slug ?? 'unknown')
      if (r) { found = r; break }
    }
    results.push(found)
  }

  if (!results.every(r => r !== null)) return null

  const detectedVersion = results.find(r => r?.detectedVersion)?.detectedVersion
  return { framework, detectedVersion }
}

function removeSuperseded(matches: (ZeroFramework | null)[], slug: string): void {
  const idx = matches.findIndex(f => f?.slug === slug)
  if (idx === -1) return
  const f = matches[idx]!
  if (f.supersedes) for (const s of f.supersedes) removeSuperseded(matches, s)
  matches.splice(idx, 1)
}

export function removeSupersededFrameworks(matches: (ZeroFramework | null)[]): void {
  for (const m of matches.slice()) {
    if (m?.supersedes) for (const s of m.supersedes) removeSuperseded(matches, s)
  }
}

export async function detectFramework(opts: {
  fs: ZeroDetectorFilesystem
  frameworkList: readonly ZeroFramework[]
  includeExperimental?: boolean
}): Promise<string | null> {
  const list = opts.includeExperimental ? [...opts.frameworkList] : filterFrameworks(opts.frameworkList)
  const results = await Promise.all(
    list.map(async f => (await matchFramework(opts.fs, f)) ? f : null)
  )
  removeSupersededFrameworks(results)
  return results.find(r => r !== null)?.slug ?? null
}

export async function detectFrameworks(opts: {
  fs: ZeroDetectorFilesystem
  frameworkList: readonly ZeroFramework[]
  includeExperimental?: boolean
}): Promise<ZeroFramework[]> {
  const list = opts.includeExperimental ? [...opts.frameworkList] : filterFrameworks(opts.frameworkList)
  const results = await Promise.all(
    list.map(async f => (await matchFramework(opts.fs, f)) ? f : null)
  )
  removeSupersededFrameworks(results)
  return results.filter((r): r is ZeroFramework => r !== null)
}

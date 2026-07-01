import fs   from 'node:fs'
import path from 'node:path'
import { ZeroDetectorFilesystem } from './Internals/filesystem.js'
import { detectFramework }         from './Internals/detect.js'
import { zeroFrameworks }          from './Internals/frameworks.js'
import type { ZeroFilesystemStat, ZeroEngineName } from './Internals/types.js'

class LocalFS extends ZeroDetectorFilesystem {
  constructor(private root: string) { super() }

  protected async _hasPath(name: string): Promise<boolean> {
    return fs.existsSync(path.join(this.root, name))
  }

  protected async _isFile(name: string): Promise<boolean> {
    const p = path.join(this.root, name)
    try { return fs.statSync(p).isFile() } catch { return false }
  }

  protected async _readFile(name: string): Promise<Buffer> {
    return fs.readFileSync(path.join(this.root, name))
  }

  protected async _readdir(name: string): Promise<ZeroFilesystemStat[]> {
    const dir = path.join(this.root, name)
    if (!fs.existsSync(dir)) return []
    return fs.readdirSync(dir).map(entry => {
      const full = path.join(dir, entry)
      const rel  = path.posix.join(name === '.' ? '' : name, entry).replace(/^\//, '')
      return {
        name: entry,
        path: rel,
        type: (fs.statSync(full).isDirectory() ? 'dir' : 'file') as 'dir' | 'file',
      }
    })
  }

  protected _chdir(name: string): ZeroDetectorFilesystem {
    return new LocalFS(path.join(this.root, name))
  }
}

export interface FrameworkMatch {
  slug:       string | null
  engineName: ZeroEngineName | null
}

export async function detectFrameworkWithEngine(root: string): Promise<FrameworkMatch | null> {
  const lfs   = new LocalFS(root)
  const slug  = await detectFramework({ fs: lfs, frameworkList: zeroFrameworks })
  if (!slug) return null

  const entry = zeroFrameworks.find(f => f.slug === slug)
  return {
    slug,
    engineName: entry?.engine ?? null,
  }
}

export async function detectProjectFramework(root: string): Promise<string | null> {
  const match = await detectFrameworkWithEngine(root)
  return match?.slug ?? null
}

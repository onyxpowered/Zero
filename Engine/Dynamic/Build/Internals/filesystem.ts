import { posix } from 'node:path'
import type { ZeroFilesystemStat } from './types.js'

export abstract class ZeroDetectorFilesystem {
  private pathCache    = new Map<string, Promise<boolean>>()
  private fileCache    = new Map<string, Promise<boolean>>()
  private readCache    = new Map<string, Promise<Buffer>>()
  private readdirCache = new Map<string, Promise<ZeroFilesystemStat[]>>()

  protected abstract _hasPath(path: string): Promise<boolean>
  protected abstract _isFile(name: string):  Promise<boolean>
  protected abstract _readFile(name: string): Promise<Buffer>
  protected abstract _readdir(name: string): Promise<ZeroFilesystemStat[]>
  protected abstract _chdir(name: string): ZeroDetectorFilesystem

  hasPath = async (path: string): Promise<boolean> => {
    let p = this.pathCache.get(path)
    if (!p) { p = this._hasPath(path); this.pathCache.set(path, p) }
    return p
  }

  isFile = async (name: string): Promise<boolean> => {
    let p = this.fileCache.get(name)
    if (!p) { p = this._isFile(name); this.fileCache.set(name, p) }
    return p
  }

  readFile = async (name: string): Promise<Buffer> => {
    let p = this.readCache.get(name)
    if (!p) { p = this._readFile(name); this.readCache.set(name, p) }
    return p
  }

  readdir = async (dirPath: string, opts?: { potentialFiles?: string[] }): Promise<ZeroFilesystemStat[]> => {
    let p = this.readdirCache.get(dirPath)
    if (!p) { p = this._readdir(dirPath); this.readdirCache.set(dirPath, p) }
    const entries = await p
    const names = new Set<string>()
    for (const e of entries) {
      if (e.type === 'file') {
        this.fileCache.set(e.path, Promise.resolve(true))
        this.pathCache.set(e.path, Promise.resolve(true))
        names.add(e.name)
      }
    }
    if (opts?.potentialFiles) {
      for (const f of opts.potentialFiles) {
        if (posix.basename(f) === f && !names.has(f)) {
          const full = dirPath === '/' ? f : posix.join(dirPath, f)
          this.fileCache.set(full, Promise.resolve(false))
          this.pathCache.set(full, Promise.resolve(false))
        }
      }
    }
    return p
  }

  chdir = (name: string): ZeroDetectorFilesystem => this._chdir(name)

  writeFile = async (name: string, content: string): Promise<void> => {
    this.readCache.set(name, Promise.resolve(Buffer.from(content)))
    this.fileCache.set(name, Promise.resolve(true))
    this.pathCache.set(name, Promise.resolve(true))
  }
}

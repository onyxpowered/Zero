import { getCacheStats, clearCache, listCacheEntries } from '@zero/engine/build/cache'

function formatBytes(mb: number): string {
  if (mb < 1) return `${Math.round(mb * 1024)} KB`
  if (mb < 1024) return `${mb} MB`
  return `${Math.round(mb / 1024 * 10) / 10} GB`
}

function timeAgo(ts: number): string {
  const s = Math.round((Date.now() - ts) / 1000)
  if (s < 60)   return `${s}s ago`
  if (s < 3600) return `${Math.round(s / 60)}m ago`
  return `${Math.round(s / 3600)}h ago`
}

export async function cache_cmd(args: string[]): Promise<void> {
  const sub = args[0]

  if (sub === 'clean' || sub === 'clear') {
    const key = args[1]
    clearCache(key)
    console.log(key ? `cleared cache entry ${key.slice(0, 8)}` : 'cache cleared')
    return
  }

  if (sub === 'ls' || sub === 'list') {
    const entries = listCacheEntries()
    if (!entries.length) { console.log('cache is empty'); return }
    for (const e of entries) {
      const age      = timeAgo(e.timestamp)
      const stepLine = e.steps?.length
        ? e.steps.map(s => `${s.step} ${s.duration}ms`).join(' · ')
        : `${e.duration}ms`
      console.log(`  ${e.key.slice(0, 8)}  ${e.engine.padEnd(8)}  ${String(e.files.length).padStart(4)} files  ${age}`)
      console.log(`             ${stepLine}`)
    }
    return
  }

  const { entries, sizeMB } = getCacheStats()
  console.log(`zero build cache`)
  console.log(`  entries  ${entries}`)
  console.log(`  size     ${formatBytes(sizeMB)}`)
  console.log(`  path     ~/.zero/cache/`)
  console.log()
  console.log(`  zero cache ls       list entries`)
  console.log(`  zero cache clean    clear all`)
}

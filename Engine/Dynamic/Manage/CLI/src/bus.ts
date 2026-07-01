import { WebSocket } from 'ws'
import { readInformation } from '@zero/engine'

function busPort(): number {
  const info = readInformation()
  return info ? 7770 : 7770
}

export async function emitToBus(channel: string, event: object): Promise<void> {
  try {
    await fetch(`http://localhost:${busPort()}/emit`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ channel, event }),
      signal:  AbortSignal.timeout(2000),
    })
  } catch { /* engine not running — silent */ }
}

export async function sendCommand(cmd: object, timeoutMs = 8000): Promise<{ ok: boolean; message: string; data?: unknown }> {
  const port = busPort()
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://localhost:${port}/manage`)

    const timer = setTimeout(() => {
      ws.terminate()
      reject(new Error(`Zero did not respond within ${timeoutMs / 1000}s — is Zero running?`))
    }, timeoutMs)

    ws.on('open', () => ws.send(JSON.stringify(cmd)))

    ws.on('message', (raw) => {
      clearTimeout(timer)
      try {
        const msg = JSON.parse(raw.toString()) as { ok: boolean; message: string; data?: unknown }
        resolve(msg)
      } catch {
        resolve({ ok: false, message: 'bad response from Zero' })
      }
      ws.close()
    })

    ws.on('error', (err) => {
      clearTimeout(timer)
      if ((err as NodeJS.ErrnoException).code === 'ECONNREFUSED') {
        reject(new Error('Zero is not running — start Zero first'))
      } else {
        reject(err)
      }
    })
  })
}

import pc from 'picocolors'

export async function deploy(_args: string[]): Promise<void> {
  // Zero deploy — coming with the Vercel layer
  console.log(pc.yellow('[zero/deploy] coming soon'))
  console.log(pc.dim('deployment targets will be configured in zero.config.ts'))
}

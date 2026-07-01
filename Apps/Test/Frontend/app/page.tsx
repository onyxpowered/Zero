import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function Page() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-background p-8">
      <div className="w-full max-w-lg space-y-6">

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Test</h1>
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

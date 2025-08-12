import { listVotes } from "@/app/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VoteTrendsChart } from "@/components/charts/vote-trends-chart"

export default async function AnalyticsPage() {
  const votes = await listVotes()
  const byDay = new Map<string, number>()
  votes.forEach(v =>
    (v.ballots ?? []).forEach(b => {
      const d = new Date(b.createdAt).toISOString().slice(0, 10)
      byDay.set(d, (byDay.get(d) ?? 0) + 1)
    })
  )
  const trend = Array.from(byDay.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, votes]) => ({ date, votes }))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analityka</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <VoteTrendsChart data={trend} title="Aktywność głosowań" />
        <Card>
          <CardHeader><CardTitle>Udział łączny</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Liczba oddanych głosów: <span className="font-semibold">{trend.reduce((a, b) => a + b.votes, 0)}</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
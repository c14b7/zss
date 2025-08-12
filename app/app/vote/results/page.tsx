import { listVotes } from "@/app/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function VoteResultsPage() {
  const polls = await listVotes()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Wyniki głosowań</h1>
      <div className="grid gap-6">
        {polls.map(poll => {
          const total = poll.ballots.length || 1
          const counts = poll.candidates.map(c => ({
            candidate: c,
            count: poll.ballots.filter(b => b.choice === c.id).length,
          }))
          return (
            <Card key={poll.id}>
              <CardHeader><CardTitle>{poll.title}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {counts.map(({ candidate, count }) => {
                  const pct = Math.round((count / total) * 100)
                  return (
                    <div key={candidate.id} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{candidate.name} — {candidate.department}</span>
                        <span className="font-mono">{count} / {total} ({pct}%)</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded">
                        <div className="h-2 bg-primary rounded" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
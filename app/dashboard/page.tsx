import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { EmployeesTable } from "@/components/tables/employees-table"
import { VoteTrendsChart } from "@/components/charts/vote-trends-chart"
import { listEmployees, listVotes } from "@/app/lib/store"

async function getData() {
  try {
    const [employees, votes] = await Promise.all([
      listEmployees(),
      listVotes(),
    ])
    
    const totalBallots = votes.reduce((acc, v) => acc + (v.ballots?.length ?? 0), 0)
    
    // proste trendy: sumy per dzień
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

    return { employees, votes, totalBallots, trend }
  } catch (error) {
    console.error("Error loading dashboard data:", error)
    return { employees: [], votes: [], totalBallots: 0, trend: [] }
  }
}

export default async function DashboardPage() {
  const { employees, votes, totalBallots, trend } = await getData()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Pracownicy</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{employees.length}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Aktywne głosowania</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{votes.length}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Oddane głosy</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{totalBallots}</CardContent>
        </Card>
      </div>

      {trend.length > 0 && <VoteTrendsChart data={trend} />}

      <Separator />

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Pracownicy</h2>
        <Link className="underline" href="/employees">Zobacz wszystkich</Link>
      </div>
      
      {employees.length > 0 ? (
        <EmployeesTable data={employees.slice(0, 5)} />
      ) : (
        <p className="text-muted-foreground">Brak pracowników do wyświetlenia</p>
      )}

      <div className="flex gap-4 pt-2">
        <Link className="underline" href="/dashboard/analytics">Analityka</Link>
        <Link className="underline" href="/vote/results">Wyniki głosowań</Link>
      </div>
    </div>
  )
}
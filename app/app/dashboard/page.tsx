import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { EmployeesTable } from "@/components/tables/employees-table"
import { VoteTrendsChart } from "@/components/charts/vote-trends-chart"

import data from "./data.json"
import { listEmployees, listVotes } from "@/app/lib/store"

async function getData() {
  // Use direct function calls instead of fetch to avoid URL parsing issues
  const [employees, votes] = await Promise.all([
    listEmployees(),
    listVotes(),
  ])
  const totalBallots = votes.reduce((acc: number, v: any) => acc + (v.ballots?.length ?? 0), 0)
  // proste trendy: sumy per dzień
  const byDay = new Map<string, number>()
  votes.forEach((v: any) =>
    (v.ballots ?? []).forEach((b: any) => {
      const d = new Date(b.createdAt).toISOString().slice(0, 10)
      byDay.set(d, (byDay.get(d) ?? 0) + 1)
    })
  )
  const trend = Array.from(byDay.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, votes]) => ({ date, votes }))

  return { employees, votes, totalBallots, trend }
}

export default async function DashboardPage() {
  const { employees, votes, totalBallots, trend } = await getData()

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <DataTable data={data} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

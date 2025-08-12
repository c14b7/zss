import Link from "next/link"
import { EmployeesTable } from "@/components/tables/employees-table"

export const dynamic = "force-dynamic"

export default async function EmployeesPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/employees`, { cache: "no-store" })
  const employees = await res.json()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pracownicy</h1>
        <Link className="underline" href="/employees/new">Dodaj</Link>
      </div>
      <EmployeesTable data={employees} />
    </div>
  )
}
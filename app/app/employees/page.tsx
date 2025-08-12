import Link from "next/link"
import { EmployeesTable } from "@/components/tables/employees-table"
import { listEmployees } from "@/app/lib/store"

export const dynamic = "force-dynamic"

export default async function EmployeesPage() {
  const employees = await listEmployees()

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
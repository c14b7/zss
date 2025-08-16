import Link from "next/link"
import { EmployeesTable } from "@/components/tables/employees-table"
import { listEmployees } from "@/app/lib/store"

export const dynamic = "force-dynamic"

export default async function EmployeesPage() {
  try {
    const employees = await listEmployees()

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Pracownicy</h1>
          <Link className="underline" href="/employees/new">Dodaj</Link>
        </div>
        
        {employees.length > 0 ? (
          <EmployeesTable data={employees} />
        ) : (
          <p className="text-muted-foreground">Brak pracowników do wyświetlenia</p>
        )}
      </div>
    )
  } catch (error) {
    console.error("Error loading employees:", error)
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Pracownicy</h1>
        <p className="text-destructive">Błąd podczas ładowania pracowników</p>
      </div>
    )
  }
}
import { getEmployee } from "@/app/lib/store"
import { notFound } from "next/navigation"
import { EmployeeForm } from "@/components/forms/employee-form"

type Params = { params: { id: string } }

export default async function EditEmployee({ params }: Params) {
  const emp = await getEmployee(params.id)
  if (!emp) return notFound()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edytuj pracownika</h1>
      <EmployeeForm initial={emp} />
    </div>
  )
}
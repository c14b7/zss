import { getEmployee } from "@/app/lib/store"
import { notFound } from "next/navigation"
import { ProfileCard } from "@/components/employees/profile-card"

type Params = { params: { id: string } }

export default async function EmployeeProfile({ params }: Params) {
  const emp = await getEmployee(params.id)
  if (!emp) return notFound()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Profil pracownika</h1>
      <ProfileCard employee={emp} />
    </div>
  )
}
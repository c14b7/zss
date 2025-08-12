import { NextResponse } from "next/server"
import { deleteEmployee, getEmployee, upsertEmployee } from "@/app/lib/store"
import { Employee } from "@/app/lib/types"

type Params = { params: { id: string } }

export async function GET(_req: Request, { params }: Params) {
  const emp = await getEmployee(params.id)
  if (!emp) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(emp)
}

export async function PATCH(req: Request, { params }: Params) {
  const existing = await getEmployee(params.id)
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const patch = (await req.json()) as Partial<Employee>
  const updated: Employee = { ...existing, ...patch, id: existing.id }
  await upsertEmployee(updated)
  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: Params) {
  const res = await deleteEmployee(params.id)
  return NextResponse.json(res)
}
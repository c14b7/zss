import { NextResponse } from "next/server"
import { listEmployees, upsertEmployee } from "@/app/lib/store"
import { Employee } from "@/app/lib/types"

export async function GET() {
  try {
    const employees = await listEmployees()
    return NextResponse.json(employees)
  } catch (error) {
    console.error("Error fetching employees:", error)
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<Employee>
    if (!body.name || !body.department || !body.role) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }
    const id = body.id ?? `e${Date.now()}`
    const emp: Employee = {
      id,
      name: body.name,
      department: body.department,
      role: body.role,
      hiredAt: body.hiredAt ?? new Date().toISOString(),
      score: body.score ?? 0,
    }
    await upsertEmployee(emp)
    return NextResponse.json(emp, { status: 201 })
  } catch (error) {
    console.error("Error creating employee:", error)
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 })
  }
}
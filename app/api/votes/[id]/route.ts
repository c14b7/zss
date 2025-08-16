import { NextResponse } from "next/server"
import { addBallot, getVote } from "@/app/lib/store"

type Params = { params: { id: string } }

export async function GET(_req: Request, { params }: Params) {
  try {
    const poll = await getVote(params.id)
    if (!poll) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(poll)
  } catch (error) {
    console.error("Error fetching vote:", error)
    return NextResponse.json({ error: "Failed to fetch vote" }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const poll = await getVote(params.id)
    if (!poll) return NextResponse.json({ error: "Not found" }, { status: 404 })
    const { employeeId, choice } = (await req.json()) as { employeeId?: string; choice?: string }
    if (!employeeId || !choice) {
      return NextResponse.json({ error: "Missing employeeId or choice" }, { status: 400 })
    }
    const updated = await addBallot(params.id, {
      employeeId,
      choice,
      createdAt: new Date().toISOString(),
    })
    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error adding ballot:", error)
    return NextResponse.json({ error: "Failed to add ballot" }, { status: 500 })
  }
}
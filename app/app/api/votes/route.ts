import { NextResponse } from "next/server"
import { createVote, listVotes } from "@/app/lib/store"
import { VotePoll } from "@/app/lib/types"

export async function GET() {
  const votes = await listVotes()
  return NextResponse.json(votes)
}

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<VotePoll>
  if (!body.title || !Array.isArray(body.candidates)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }
  const poll: VotePoll = {
    id: body.id ?? `poll-${Date.now()}`,
    title: body.title!,
    createdAt: new Date().toISOString(),
    candidates: body.candidates!,
    ballots: [],
  }
  await createVote(poll)
  return NextResponse.json(poll, { status: 201 })
}
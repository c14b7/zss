import fs from "fs/promises"
import path from "path"
import { Employee, VotePoll, Ballot } from "./types"

const DATA_DIR = path.join(process.cwd(), "app", "_data")
const EMP_FILE = path.join(DATA_DIR, "employees.json")
const VOTE_FILE = path.join(DATA_DIR, "votes.json")

async function readJSON<T>(file: string, fallback: T): Promise<T> {
  try {
    const data = await fs.readFile(file, "utf-8")
    return JSON.parse(data) as T
  } catch {
    return fallback
  }
}

async function writeJSON<T>(file: string, data: T) {
  await fs.mkdir(path.dirname(file), { recursive: true })
  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf-8")
}

// Employees
export async function listEmployees() {
  return readJSON<Employee[]>(EMP_FILE, [])
}

export async function getEmployee(id: string) {
  const employees = await listEmployees()
  return employees.find(e => e.id === id) ?? null
}

export async function upsertEmployee(emp: Employee) {
  const employees = await listEmployees()
  const idx = employees.findIndex(e => e.id === emp.id)
  if (idx >= 0) employees[idx] = emp
  else employees.push(emp)
  await writeJSON(EMP_FILE, employees)
  return emp
}

export async function deleteEmployee(id: string) {
  const employees = await listEmployees()
  const next = employees.filter(e => e.id !== id)
  await writeJSON(EMP_FILE, next)
  return { deleted: employees.length - next.length }
}

// Votes
export async function listVotes() {
  return readJSON<VotePoll[]>(VOTE_FILE, [])
}

export async function getVote(id: string) {
  const votes = await listVotes()
  return votes.find(v => v.id === id) ?? null
}

export async function createVote(poll: VotePoll) {
  const votes = await listVotes()
  votes.push(poll)
  await writeJSON(VOTE_FILE, votes)
  return poll
}

export async function addBallot(voteId: string, ballot: Ballot) {
  const votes = await listVotes()
  const idx = votes.findIndex(v => v.id === voteId)
  if (idx < 0) throw new Error("Vote not found")
  // overwrite previous vote by the same employee (idempotent per poll)
  const existingIdx = votes[idx].ballots.findIndex(b => b.employeeId === ballot.employeeId)
  if (existingIdx >= 0) votes[idx].ballots[existingIdx] = ballot
  else votes[idx].ballots.push(ballot)
  await writeJSON(VOTE_FILE, votes)
  return votes[idx]
}
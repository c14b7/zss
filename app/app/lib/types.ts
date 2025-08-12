export type Employee = {
  id: string
  name: string
  department: string
  role: string
  hiredAt: string
  score?: number
}

export type Ballot = {
  employeeId: string
  choice: string // candidateId
  createdAt: string
}

export type VoteCandidate = {
  id: string // employeeId
  name: string
  department: string
}

export type VotePoll = {
  id: string
  title: string
  createdAt: string
  candidates: VoteCandidate[]
  ballots: Ballot[]
}
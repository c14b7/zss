"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Employee } from "@/app/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function EmployeeForm({ initial }: { initial?: Partial<Employee> }) {
  const router = useRouter()
  const [state, setState] = React.useState<Partial<Employee>>(initial ?? {})

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const method = initial?.id ? "PATCH" : "POST"
    const url = initial?.id ? `/api/employees/${initial.id}` : "/api/employees"
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    })
    if (res.ok) {
      const emp: Employee = await res.json()
      router.push(`/employees/${emp.id}`)
      router.refresh()
    } else {
      alert("Błąd zapisu")
    }
  }

  return (
    <Card asChild>
      <form onSubmit={onSubmit}>
        <CardHeader>
          <CardTitle>{initial?.id ? "Edytuj pracownika" : "Nowy pracownik"}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label>Imię i nazwisko</Label>
            <Input
              value={state.name ?? ""}
              onChange={e => setState(s => ({ ...s, name: e.target.value }))}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label>Dział</Label>
            <Input
              value={state.department ?? ""}
              onChange={e => setState(s => ({ ...s, department: e.target.value }))}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label>Rola</Label>
            <Input
              value={state.role ?? ""}
              onChange={e => setState(s => ({ ...s, role: e.target.value }))}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit">{initial?.id ? "Zapisz" : "Utwórz"}</Button>
        </CardFooter>
      </form>
    </Card>
  )
}
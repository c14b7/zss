import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Employee } from "@/app/lib/types"

export function ProfileCard({ employee }: { employee: Employee }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{employee.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>Rola: <Badge variant="secondary">{employee.role}</Badge></div>
        <div>Dział: <Badge>{employee.department}</Badge></div>
        <div>Zatrudniony: {new Date(employee.hiredAt).toLocaleDateString()}</div>
        {typeof employee.score === "number" && (
          <div>Wynik: <Badge variant="outline">{employee.score}</Badge></div>
        )}
      </CardContent>
    </Card>
  )
}
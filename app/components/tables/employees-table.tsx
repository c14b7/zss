import { Employee } from "@/app/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function EmployeesTable({ data }: { data: Employee[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Pracownik</TableHead>
          <TableHead>Dział</TableHead>
          <TableHead>Rola</TableHead>
          <TableHead className="text-right">Akcje</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map(e => (
          <TableRow key={e.id}>
            <TableCell className="font-medium">
              <Link href={`/employees/${e.id}`} className="underline">{e.name}</Link>
            </TableCell>
            <TableCell>{e.department}</TableCell>
            <TableCell>{e.role}</TableCell>
            <TableCell className="text-right">
              <Button size="sm" variant="outline" asChild>
                <Link href={`/employees/${e.id}/edit`}>Edytuj</Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
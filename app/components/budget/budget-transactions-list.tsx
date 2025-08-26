"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { Client, Databases } from "appwrite"
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Edit,
  Trash2,
  MoreHorizontal
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("687abe96000d2d31f914")

const databases = new Databases(client)

interface BudgetTransaction {
  $id: string
  title: string
  amount: number
  category: string
  type: "income" | "expense"
  date: string
  description?: string
  $createdAt: string
  $updatedAt: string
}

interface BudgetTransactionsListProps {
  transactions: BudgetTransaction[]
  onRefresh: () => void
}

export function BudgetTransactionsList({ transactions, onRefresh }: BudgetTransactionsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN"
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("pl-PL", {
        year: "numeric",
        month: "short",
        day: "numeric"
      })
    } catch {
      return dateString
    }
  }

  const handleDelete = async (transactionId: string) => {
    console.log("🗑️ Usuwanie transakcji:", transactionId)
    setDeletingId(transactionId)

    try {
      await databases.deleteDocument(
        "votes", // databaseId
        "budget_transactions", // collectionId
        transactionId
      )

      console.log("✅ Transakcja została usunięta")
      toast.success("Transakcja została usunięta")
      onRefresh()
    } catch (error: any) {
      console.error("❌ Błąd podczas usuwania transakcji:", error)
      toast.error("Nie udało się usunąć transakcji", {
        description: error.message
      })
    } finally {
      setDeletingId(null)
    }
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
            <Calendar className="h-8 w-8 text-slate-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              Brak transakcji
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Nie ma jeszcze żadnych transakcji w wybranym okresie.
            </p>
            <Button>
              <TrendingUp className="mr-2 h-4 w-4" />
              Dodaj pierwszą transakcję
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Tabela transakcji */}
      <div className="rounded-md border border-slate-200 dark:border-slate-700">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Typ</TableHead>
              <TableHead className="w-[30%]">Tytuł</TableHead>
              <TableHead className="w-[15%]">Kategoria</TableHead>
              <TableHead className="w-[15%]">Kwota</TableHead>
              <TableHead className="w-[15%]">Data</TableHead>
              <TableHead className="w-[50px] text-right">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.$id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <TableCell>
                  <div className="flex justify-center">
                    {transaction.type === "income" ? (
                      <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {transaction.title}
                    </p>
                    {transaction.description && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {transaction.description}
                      </p>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <Badge variant="secondary" className="text-xs">
                    {transaction.category}
                  </Badge>
                </TableCell>
                
                <TableCell>
                  <span className={`font-medium ${
                    transaction.type === "income" 
                      ? "text-green-600 dark:text-green-400" 
                      : "text-red-600 dark:text-red-400"
                  }`}>
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </span>
                </TableCell>
                
                <TableCell className="text-slate-600 dark:text-slate-400">
                  {formatDate(transaction.date)}
                </TableCell>
                
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem disabled>
                        <Edit className="mr-2 h-4 w-4" />
                        Edytuj
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600 dark:text-red-400"
                        disabled={deletingId === transaction.$id}
                      >
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <div className="flex items-center w-full cursor-pointer">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Usuń
                            </div>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Czy na pewno chcesz usunąć?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Ta akcja nie może być cofnięta. Transakcja "{transaction.title}" 
                                zostanie trwale usunięta z systemu.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Anuluj</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(transaction.$id)}
                                className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                                disabled={deletingId === transaction.$id}
                              >
                                {deletingId === transaction.$id ? "Usuwanie..." : "Usuń"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Podsumowanie */}
      <div className="flex justify-between items-center text-sm text-slate-600 dark:text-slate-400 px-2">
        <p>
          Wyświetlane: {transactions.length} transakcji
        </p>
        <div className="flex gap-4">
          <span>
            Przychody: {formatCurrency(
              transactions
                .filter(t => t.type === "income")
                .reduce((sum, t) => sum + t.amount, 0)
            )}
          </span>
          <span>
            Wydatki: {formatCurrency(
              transactions
                .filter(t => t.type === "expense")
                .reduce((sum, t) => sum + t.amount, 0)
            )}
          </span>
        </div>
      </div>
    </div>
  )
}

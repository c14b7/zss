"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Client, Databases } from "appwrite"
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart,
  BarChart3,
  Calendar,
  Filter
} from "lucide-react"
import { BudgetOverviewChart } from "@/components/charts/budget-overview-chart"
import { BudgetCategoryChart } from "@/components/charts/budget-category-chart"
import { BudgetTransactionsList } from "@/components/budget/budget-transactions-list"

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

interface BudgetSummary {
  totalIncome: number
  totalExpenses: number
  balance: number
  monthlyIncome: number
  monthlyExpenses: number
  monthlyBalance: number
}

export default function BudgetPage() {
  console.log("🏗️ Inicjalizacja komponentu BudgetPage")
  
  const router = useRouter()
  const [transactions, setTransactions] = useState<BudgetTransaction[]>([])
  const [summary, setSummary] = useState<BudgetSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    monthlyBalance: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")

  useEffect(() => {
    fetchBudgetData()
  }, [selectedPeriod, selectedCategory])

  const fetchBudgetData = async () => {
    console.log("🔍 Pobieranie danych budżetu...")
    setIsLoading(true)

    try {
      const result = await databases.listDocuments(
        "votes", // databaseId
        "budget_transactions" // collectionId
      )

      console.log("✅ Pobrano transakcje z bazy danych:", result)
      const transactionsData = result.documents as unknown as BudgetTransaction[]
      
      // Filtrowanie danych według wybranych kryteriów
      const filteredTransactions = filterTransactions(transactionsData)
      setTransactions(filteredTransactions)
      
      // Obliczanie podsumowania
      const calculatedSummary = calculateSummary(transactionsData)
      setSummary(calculatedSummary)

    } catch (error: any) {
      console.error("❌ Błąd podczas pobierania danych budżetu:", error)
      toast.error("Nie udało się załadować danych budżetu", {
        description: error.message
      })
    } finally {
      setIsLoading(false)
      console.log("🏁 Zakończono pobieranie danych budżetu")
    }
  }

  const filterTransactions = (transactions: BudgetTransaction[]) => {
    let filtered = [...transactions]

    // Filtrowanie według okresu
    if (selectedPeriod !== "all") {
      const now = new Date()
      const startDate = new Date()

      switch (selectedPeriod) {
        case "month":
          startDate.setMonth(now.getMonth())
          startDate.setDate(1)
          break
        case "quarter":
          startDate.setMonth(now.getMonth() - 3)
          break
        case "year":
          startDate.setFullYear(now.getFullYear())
          startDate.setMonth(0)
          startDate.setDate(1)
          break
      }

      filtered = filtered.filter(t => new Date(t.date) >= startDate)
    }

    // Filtrowanie według kategorii
    if (selectedCategory !== "all") {
      filtered = filtered.filter(t => t.category === selectedCategory)
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  const calculateSummary = (transactions: BudgetTransaction[]): BudgetSummary => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const totalIncome = transactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = transactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0)

    const monthlyTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date)
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear
    })

    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0)

    const monthlyExpenses = monthlyTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0)

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      monthlyIncome,
      monthlyExpenses,
      monthlyBalance: monthlyIncome - monthlyExpenses
    }
  }

  const handleNewTransaction = () => {
    console.log("➕ Przechodzenie do dodawania nowej transakcji")
    router.push("/budget/new")
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN"
    }).format(amount)
  }

  const getCategories = () => {
    const categories = Array.from(new Set(transactions.map(t => t.category)))
    return categories.filter(Boolean)
  }

  if (isLoading) {
    return (
      <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
              Budżet
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Ładowanie danych...
            </p>
          </div>
        </div>
        
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4 sm:p-6">
                <div className="h-3 sm:h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                <div className="h-6 sm:h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Nagłówek - zoptymalizowany dla mobile */}
      <div className="flex flex-col space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
              Budżet
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Zarządzanie finansami organizacji
            </p>
          </div>
          
          <Button 
            onClick={handleNewTransaction}
            className="w-full sm:w-auto"
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            <span className="sm:hidden">Dodaj</span>
            <span className="hidden sm:inline">Nowa transakcja</span>
          </Button>
        </div>
        
        {/* Filtry - responsywne dla mobile */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystko</SelectItem>
              <SelectItem value="month">Ten miesiąc</SelectItem>
              <SelectItem value="quarter">Ostatni kwartał</SelectItem>
              <SelectItem value="year">Ten rok</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie</SelectItem>
              {getCategories().map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Karty z podsumowaniem - zoptymalizowane dla mobile */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Saldo ogółem
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className={`text-lg sm:text-2xl font-bold ${
              summary.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {formatCurrency(summary.balance)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.balance >= 0 ? 'Dodatnie' : 'Ujemne'} saldo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Przychody (miesiąc)
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(summary.monthlyIncome)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Ogółem: {formatCurrency(summary.totalIncome)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Wydatki (miesiąc)
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-lg sm:text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(summary.monthlyExpenses)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Ogółem: {formatCurrency(summary.totalExpenses)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Saldo (miesiąc)
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className={`text-lg sm:text-2xl font-bold ${
              summary.monthlyBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {formatCurrency(summary.monthlyBalance)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Różnica w tym miesiącu
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Wykresy i lista transakcji - responsywne */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Przegląd</span>
            <span className="sm:hidden">Wykres</span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Kategorie</span>
            <span className="sm:hidden">Kat.</span>
          </TabsTrigger>
          <TabsTrigger value="transactions" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Transakcje</span>
            <span className="sm:hidden">Lista</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">Przegląd budżetu</CardTitle>
              <CardDescription className="text-sm">
                Przychody i wydatki w czasie
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[200px] sm:h-[300px] md:h-[400px]">
                <BudgetOverviewChart transactions={transactions} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">Wydatki według kategorii</CardTitle>
                <CardDescription className="text-sm">
                  Rozkład wydatków na kategorie
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[200px] sm:h-[250px]">
                  <BudgetCategoryChart 
                    transactions={transactions.filter(t => t.type === "expense")} 
                    type="expense"
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">Przychody według kategorii</CardTitle>
                <CardDescription className="text-sm">
                  Rozkład przychodów na kategorie
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[200px] sm:h-[250px]">
                  <BudgetCategoryChart 
                    transactions={transactions.filter(t => t.type === "income")} 
                    type="income"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">Lista transakcji</CardTitle>
              <CardDescription className="text-sm">
                Wszystkie transakcje budżetowe ({transactions.length})
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 px-0 sm:px-6">
              <BudgetTransactionsList 
                transactions={transactions}
                onRefresh={fetchBudgetData}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

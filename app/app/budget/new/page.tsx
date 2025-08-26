"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"
import { Client, Databases, ID } from "appwrite"
import { ArrowLeft, Plus, TrendingUp, TrendingDown } from "lucide-react"

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("687abe96000d2d31f914")

const databases = new Databases(client)

const EXPENSE_CATEGORIES = [
  "Administracja",
  "Marketing",
  "IT",
  "Biuro",
  "Podróże",
  "Szkolenia",
  "Ubezpieczenia",
  "Podatki",
  "Usługi",
  "Wyposażenie",
  "Inne wydatki"
]

const INCOME_CATEGORIES = [
  "Dotacje",
  "Składki członkowskie",
  "Darowizny",
  "Sprzedaż",
  "Usługi",
  "Odsetki",
  "Refundacje",
  "Inne przychody"
]

export default function NewBudgetTransactionPage() {
  console.log("🏗️ Inicjalizacja komponentu NewBudgetTransactionPage")
  
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [type, setType] = useState<"income" | "expense">("expense")
  const [category, setCategory] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log("🚀 Rozpoczynam zapisywanie transakcji...")
    console.log("📝 Dane transakcji:", {
      title: title.trim(),
      amount: parseFloat(amount),
      type,
      category,
      date,
      description: description.trim()
    })
    
    if (!title.trim() || !amount || !category || !date) {
      toast.error("Wypełnij wszystkie wymagane pola")
      return
    }

    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Kwota musi być liczbą większą od 0")
      return
    }

    setIsLoading(true)
    
    try {
      const transactionData = {
        title: title.trim(),
        amount: parsedAmount,
        type,
        category,
        date,
        description: description.trim() || undefined,
      }
      
      console.log("📤 Wysyłam dane do Appwrite:", transactionData)
      
      const result = await databases.createDocument(
        "votes", // databaseId
        "budget_transactions", // collectionId
        ID.unique(),
        transactionData
      )
      
      console.log("✅ Transakcja została zapisana pomyślnie:", result)
      toast.success("Transakcja została dodana!")
      
      setTimeout(() => {
        console.log("🔄 Przekierowanie do /budget")
        router.push("/budget")
      }, 1200)
    } catch (error: any) {
      console.error("❌ Błąd podczas zapisu transakcji:", {
        error: error,
        message: error.message,
        code: error.code,
        type: error.type,
        stack: error.stack
      })
      toast.error("Błąd zapisu transakcji", { description: error.message })
    } finally {
      setIsLoading(false)
      console.log("🏁 Zakończono proces zapisywania")
    }
  }

  const getCurrentCategories = () => {
    return type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
  }

  return (
    <div className="py-6 px-2">
      <div className="w-full max-w-4xl mx-auto px-2">
        {/* Nagłówek z przyciskiem powrotu */}
        <div className="mb-8 flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Powrót
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Nowa transakcja
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Dodaj nową transakcję do budżetu
            </p>
          </div>
        </div>
        
        <Card className="w-full shadow-xl">
          <form onSubmit={handleSave}>
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl font-semibold text-slate-800 dark:text-slate-200">
                Szczegóły transakcji
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Typ transakcji */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Typ transakcji
                </Label>
                <RadioGroup 
                  value={type} 
                  onValueChange={(value: "income" | "expense") => {
                    setType(value)
                    setCategory("") // Reset kategorii przy zmianie typu
                  }}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="income" id="income" />
                    <Label htmlFor="income" className="flex items-center gap-2 cursor-pointer">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      Przychód
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="expense" id="expense" />
                    <Label htmlFor="expense" className="flex items-center gap-2 cursor-pointer">
                      <TrendingDown className="h-4 w-4 text-red-600" />
                      Wydatek
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tytuł */}
                <div className="space-y-3">
                  <Label htmlFor="title" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Tytuł transakcji *
                  </Label>
                  <Input
                    id="title"
                    placeholder="np. Zakup laptopa, Otrzymane dotacje"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    disabled={isLoading}
                    required
                    className="h-11 text-base"
                  />
                </div>

                {/* Kwota */}
                <div className="space-y-3">
                  <Label htmlFor="amount" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Kwota (PLN) *
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    disabled={isLoading}
                    required
                    className="h-11 text-base"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Kategoria */}
                <div className="space-y-3">
                  <Label htmlFor="category" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Kategoria *
                  </Label>
                  <Select value={category} onValueChange={setCategory} disabled={isLoading}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Wybierz kategorię" />
                    </SelectTrigger>
                    <SelectContent>
                      {getCurrentCategories().map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Data */}
                <div className="space-y-3">
                  <Label htmlFor="date" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Data transakcji *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    disabled={isLoading}
                    required
                    className="h-11 text-base"
                  />
                </div>
              </div>

              {/* Opis */}
              <div className="space-y-3">
                <Label htmlFor="description" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Opis (opcjonalny)
                </Label>
                <Textarea
                  id="description"
                  placeholder="Dodatkowe informacje o transakcji..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  disabled={isLoading}
                  rows={4}
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between px-8 py-6">
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Pola oznaczone * są wymagane
              </div>
              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.back()}
                  disabled={isLoading}
                  className="px-6"
                >
                  Anuluj
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className={`px-8 ${
                    type === "income" 
                      ? "bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600" 
                      : "bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Zapisywanie...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Dodaj transakcję
                    </>
                  )}
                </Button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}

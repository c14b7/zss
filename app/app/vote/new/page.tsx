"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { X, Plus, Loader2, Eye, EyeOff } from "lucide-react"
import { Client, Databases, ID } from "appwrite"
import { useRouter } from "next/navigation"

interface VoteOption {
  value: number
  label: string
  description: string
  variant: "default" | "destructive" | "outline"
}

interface VoteData {
  title: string
  description: string
  category: string
  options: VoteOption[]
  deadline: string
  totalVotes: number
  results: Record<string, number>
  isAnonymous: boolean
  voters: string[]
}

// Konfiguracja Appwrite
const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('687abe96000d2d31f914')

const databases = new Databases(client)

export default function NewVotePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [deadline, setDeadline] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [options, setOptions] = useState<VoteOption[]>([
    { value: 1, label: "Za", description: "Popieram tę propozycję", variant: "default" },
    { value: -1, label: "Przeciw", description: "Jestem przeciwny tej propozycji", variant: "destructive" },
    { value: 0, label: "Wstrzymuję się", description: "Nie mam zdania w tej sprawie", variant: "outline" }
  ])

  const addOption = () => {
    const newValue = Math.max(...options.map(o => Math.abs(o.value))) + 1
    setOptions([...options, {
      value: newValue,
      label: "",
      description: "",
      variant: "default"
    }])
  }

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const updateOption = (index: number, field: keyof VoteOption, value: string | number) => {
    const updatedOptions = [...options]
    updatedOptions[index] = { ...updatedOptions[index], [field]: value }
    setOptions(updatedOptions)
  }

  const saveToDatabase = async () => {
    setIsLoading(true)
    
    try {
      const results: Record<string, number> = {}
      options.forEach(option => {
        results[option.value.toString()] = 0
      })

      const voteData = {
        title,
        description,
        category,
        deadline,
        totalVotes: 0,
        results: JSON.stringify(results),
        options: JSON.stringify(options),
        isAnonymous,
        voters: JSON.stringify([]) // Lista głosujących
      }

      const voteId = ID.unique()

      const response = await databases.createDocument(
        'votes',
        'votes',
        voteId,
        voteData
      )

      console.log("Zapisano:", response)
      alert(`Głosowanie zostało utworzone! ID: ${voteId}`)
      router.push(`/vote/${voteId}`)

    } catch (error) {
      console.error("Błąd podczas zapisywania głosowania:", error)
      alert("Wystąpił błąd podczas zapisywania głosowania. Szczegóły w konsoli.")
    } finally {
      setIsLoading(false)
    }
  }

  const generateJSON = () => {
    const results: Record<string, number> = {}
    options.forEach(option => {
      results[option.value.toString()] = 0
    })

    const voteData: VoteData = {
      title,
      description,
      category,
      options,
      deadline,
      totalVotes: 0,
      results,
      isAnonymous,
      voters: []
    }

    const jsonString = JSON.stringify(voteData, null, 2)
    console.log("Generated Vote Data JSON:")
    console.log(jsonString)
    
    navigator.clipboard.writeText(jsonString).then(() => {
      alert("JSON został skopiowany do schowka!")
    }).catch(() => {
      alert("Nie udało się skopiować do schowka. Sprawdź konsolę!")
    })
  }

  const isFormValid = () => {
    return title.trim() && 
           description.trim() && 
           category.trim() && 
           deadline && 
           options.length >= 2 && 
           options.every(opt => opt.label.trim() && opt.description.trim())
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Utwórz nową ankietę głosowania</CardTitle>
            <CardDescription>
              Wypełnij formularz, aby utworzyć nową ankietę. Zostanie zapisana w bazie danych Appwrite.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Podstawowe informacje */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Tytuł ankiety</Label>
                <Input
                  id="title"
                  placeholder="np. Głosowanie nad budżetem na 2025 rok"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="description">Opis</Label>
                <Textarea
                  id="description"
                  placeholder="Szczegółowy opis ankiety..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="category">Kategoria</Label>
                <Input
                  id="category"
                  placeholder="np. Budżet i Finanse"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="deadline">Termin końcowy</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>

              {/* Opcja anonimowości */}
              <div className="flex items-center space-x-2 p-4 border rounded-lg bg-purple-50/30">
                <Switch
                  id="anonymous-mode"
                  checked={isAnonymous}
                  onCheckedChange={setIsAnonymous}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="anonymous-mode"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                  >
                    {isAnonymous ? (
                      <>
                        <EyeOff className="w-4 h-4 text-purple-600" />
                        Głosowanie niejawne
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        Głosowanie jawne
                      </>
                    )}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {isAnonymous 
                      ? "Nie będzie widać kto głosował. Strona będzie miała specjalny wygląd." 
                      : "Będzie widać listę osób które zagłosowały (bez szczegółów głosu)."}
                  </p>
                </div>
              </div>
            </div>

            {/* Opcje głosowania */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">Opcje głosowania</Label>
                <Button onClick={addOption} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Dodaj opcję
                </Button>
              </div>

              {options.map((option, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="font-medium">Opcja {index + 1}</Label>
                      {options.length > 2 && (
                        <Button
                          onClick={() => removeOption(index)}
                          variant="outline"
                          size="sm"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor={`value-${index}`}>Wartość</Label>
                        <Input
                          id={`value-${index}`}
                          type="number"
                          value={option.value}
                          onChange={(e) => updateOption(index, "value", parseInt(e.target.value) || 0)}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`label-${index}`}>Etykieta</Label>
                        <Input
                          id={`label-${index}`}
                          placeholder="np. Za"
                          value={option.label}
                          onChange={(e) => updateOption(index, "label", e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`variant-${index}`}>Wariant</Label>
                        <Select
                          value={option.variant}
                          onValueChange={(value) => updateOption(index, "variant", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">Default</SelectItem>
                            <SelectItem value="destructive">Destructive</SelectItem>
                            <SelectItem value="outline">Outline</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`description-${index}`}>Opis</Label>
                      <Textarea
                        id={`description-${index}`}
                        placeholder="Opis opcji..."
                        value={option.description}
                        onChange={(e) => updateOption(index, "description", e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Przyciski */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={generateJSON}
                disabled={!isFormValid() || isLoading}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                Generuj JSON w konsoli
              </Button>
              
              <Button
                onClick={saveToDatabase}
                disabled={!isFormValid() || isLoading}
                size="lg"
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Zapisywanie...
                  </>
                ) : (
                  "Zapisz w bazie danych"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
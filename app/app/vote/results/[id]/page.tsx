"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, Minus, Calendar, Users, BarChart3, EyeOff } from "lucide-react"
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import { Client, Databases } from "appwrite"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

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

interface ChartDataItem {
  option: string
  votes: number
  percentage: number
  fill: string
  label: string
  value: number
}

// Konfiguracja Appwrite
const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('687abe96000d2d31f914')

const databases = new Databases(client)

// Konfiguracja kolorów dla wykresu
const chartConfig = {
  votes: {
    label: "Głosy",
  },
  za: {
    label: "Za",
    color: "hsl(142, 76%, 36%)", // Zielony
  },
  przeciw: {
    label: "Przeciw", 
    color: "hsl(0, 84%, 60%)", // Czerwony
  },
  wstrzymuje: {
    label: "Wstrzymuje się",
    color: "hsl(47, 96%, 53%)", // Żółty
  },
  inne: {
    label: "Inne",
    color: "hsl(210, 40%, 60%)", // Niebieski
  },
} satisfies ChartConfig

export default function VoteResultsPage() {
  const params = useParams()
  const voteId = params.id as string
  
  const [voteData, setVoteData] = useState<VoteData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chartData, setChartData] = useState<ChartDataItem[]>([])

  // Ładowanie danych ankiety
  useEffect(() => {
    const fetchVoteData = async () => {
      try {
        setIsLoading(true)
        
        const response = await databases.getDocument(
          'votes',
          'votes', 
          voteId
        )

        const data: VoteData = {
          title: response.title,
          description: response.description,
          category: response.category,
          options: JSON.parse(response.options),
          deadline: response.deadline,
          totalVotes: response.totalVotes || 0,
          results: JSON.parse(response.results),
          isAnonymous: response.isAnonymous || false,
          voters: JSON.parse(response.voters || '[]')
        }

        setVoteData(data)
        
        // Przygotowanie danych do wykresu
        const chartItems: ChartDataItem[] = data.options.map((option) => {
          const votes = data.results[option.value.toString()] || 0
          const percentage = data.totalVotes > 0 ? (votes / data.totalVotes) * 100 : 0
          
          // Mapowanie kolorów na podstawie wartości opcji
          let colorKey = "inne"
          if (option.value === 1) colorKey = "za"
          else if (option.value === -1) colorKey = "przeciw"
          else if (option.value === 0) colorKey = "wstrzymuje"
          
          return {
            option: option.label,
            votes,
            percentage: Math.round(percentage * 10) / 10,
            fill: chartConfig[colorKey as keyof typeof chartConfig]?.color || chartConfig.inne.color,
            label: option.label,
            value: option.value
          }
        })

        // Sortowanie według liczby głosów (malejąco)
        chartItems.sort((a, b) => b.votes - a.votes)
        setChartData(chartItems)
        
      } catch (error) {
        console.error("Błąd podczas ładowania wyników:", error)
        setError("Nie udało się załadować wyników ankiety.")
      } finally {
        setIsLoading(false)
      }
    }

    if (voteId) {
      fetchVoteData()
    }
  }, [voteId])

  // Obliczanie statystyk
  const getWinningOption = () => {
    if (chartData.length === 0) return null
    return chartData[0]
  }

  const getTrendIcon = (votes: number) => {
    const winning = getWinningOption()
    if (!winning) return <Minus className="h-4 w-4" />
    
    if (votes === winning.votes) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (votes === 0) return <Minus className="h-4 w-4 text-gray-400" />
    return <TrendingDown className="h-4 w-4 text-red-600" />
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-6 h-6 animate-pulse" />
          <span>Ładowanie wyników...</span>
        </div>
      </div>
    )
  }

  if (error || !voteData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Błąd</CardTitle>
            <CardDescription>{error || "Nie znaleziono wyników ankiety"}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">ID ankiety: {voteId}</p>
          </CardContent>
          <CardFooter>
            <Link href="/vote/new">
              <Button variant="outline">Utwórz nową ankietę</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const isExpired = new Date(voteData.deadline) < new Date()
  const winningOption = getWinningOption()

  // Styling dla głosowania niejawnego
  const anonymousStyles = voteData.isAnonymous ? {
    containerClass: "bg-gradient-to-br from-purple-50 to-blue-50 min-h-screen",
    cardClass: "bg-white/90 backdrop-blur-sm border-purple-200/50 shadow-xl"
  } : {
    containerClass: "min-h-screen bg-gray-50/50",
    cardClass: ""
  }

  return (
    <div className={`p-6 ${anonymousStyles.containerClass}`}>
      {voteData.isAnonymous && (
        <div className="max-w-4xl mx-auto mb-4 text-center">
          <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-300">
            <EyeOff className="w-4 h-4 mr-2" />
            Głosowanie niejawne - wyniki
          </Badge>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Nagłówek */}
        <Card className={anonymousStyles.cardClass}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className={`text-2xl ${voteData.isAnonymous ? 'text-purple-900' : ''}`}>
                  {voteData.title}
                </CardTitle>
                <CardDescription className={`text-base ${voteData.isAnonymous ? 'text-purple-700' : ''}`}>
                  {voteData.description}
                </CardDescription>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{voteData.category}</Badge>
                    {voteData.isAnonymous && (
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                        <EyeOff className="w-3 h-3 mr-1" />
                        Niejawne
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(voteData.deadline).toLocaleDateString('pl-PL')}
                    {isExpired && <span className="text-red-500 ml-1">(zakończone)</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {voteData.totalVotes} głosów
                  </div>
                </div>
              </div>
              <Link href={`/vote/${voteId}`}>
                <Button variant="outline">Powrót do ankiety</Button>
              </Link>
            </div>
          </CardHeader>
        </Card>

        {/* Wykres */}
        <Card className={anonymousStyles.cardClass}>
          <CardHeader>
            <CardTitle className={voteData.isAnonymous ? 'text-purple-900' : ''}>
              Wyniki głosowania
            </CardTitle>
            <CardDescription className={voteData.isAnonymous ? 'text-purple-700' : ''}>
              Rozkład głosów w ankiecie - łącznie {voteData.totalVotes} głosów
            </CardDescription>
          </CardHeader>
          <CardContent>
            {voteData.totalVotes > 0 ? (
              <ChartContainer config={chartConfig}>
                <BarChart
                  accessibilityLayer
                  data={chartData}
                  layout="vertical"
                  margin={{ left: 80, right: 20, top: 20, bottom: 20 }}
                >
                  <YAxis
                    dataKey="option"
                    type="category"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    width={70}
                  />
                  <XAxis 
                    dataKey="votes" 
                    type="number" 
                    hide 
                  />
                  <ChartTooltip
                    cursor={false}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as ChartDataItem
                        return (
                          <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
                            <p className="font-medium">{data.label}</p>
                            <p className="text-sm text-muted-foreground">
                              {data.votes} głosów ({data.percentage}%)
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar 
                    dataKey="votes" 
                    layout="vertical" 
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Brak głosów do wyświetlenia</p>
                </div>
              </div>
            )}
          </CardContent>
          {voteData.totalVotes > 0 && winningOption && (
            <CardFooter className="flex-col items-start gap-2 text-sm">
              <div className={`flex gap-2 leading-none font-medium items-center ${voteData.isAnonymous ? 'text-purple-800' : ''}`}>
                {getTrendIcon(winningOption.votes)}
                Prowadzi opcja "{winningOption.label}" z {winningOption.percentage}% głosów
              </div>
              <div className={`leading-none ${voteData.isAnonymous ? 'text-purple-600' : 'text-muted-foreground'}`}>
                Aktualne wyniki na podstawie {voteData.totalVotes} oddanych głosów
              </div>
            </CardFooter>
          )}
        </Card>

        {/* Szczegółowe statystyki */}
        <Card className={anonymousStyles.cardClass}>
          <CardHeader>
            <CardTitle className={voteData.isAnonymous ? 'text-purple-900' : ''}>
              Szczegółowe statystyki
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chartData.map((item, index) => (
                <div key={item.option}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.fill }}
                      />
                      <span className={`font-medium ${voteData.isAnonymous ? 'text-purple-800' : ''}`}>
                        {item.label}
                      </span>
                      <Badge variant={index === 0 ? "default" : "secondary"}>
                        {index === 0 ? "Prowadzi" : `${index + 1}. miejsce`}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className={`font-mono font-bold ${voteData.isAnonymous ? 'text-purple-900' : ''}`}>
                        {item.votes}
                      </div>
                      <div className={`text-sm ${voteData.isAnonymous ? 'text-purple-600' : 'text-muted-foreground'}`}>
                        {item.percentage}%
                      </div>
                    </div>
                  </div>
                  {index < chartData.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lista głosujących */}
        <Card className={anonymousStyles.cardClass}>
          <CardHeader>
            <CardTitle className={voteData.isAnonymous ? 'text-purple-900' : ''}>
              {voteData.isAnonymous ? 'Uczestnicy głosowania' : 'Lista głosujących'}
            </CardTitle>
            <CardDescription className={voteData.isAnonymous ? 'text-purple-700' : ''}>
              {voteData.isAnonymous 
                ? 'Lista osób które wzięły udział w głosowaniu (bez szczegółów głosu)'
                : 'Osoby które oddały głos w tej ankiecie'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {voteData.voters.length > 0 ? (
              <div className="space-y-2">
                <div className={`text-sm font-medium mb-3 ${voteData.isAnonymous ? 'text-purple-800' : 'text-muted-foreground'}`}>
                  Łącznie głosowało: {voteData.voters.length} {voteData.voters.length === 1 ? 'osoba' : 'osób'}
                </div>
                <div className="grid gap-2 max-h-64 overflow-y-auto">
                  {voteData.voters.map((voter, index) => (
                    <div 
                      key={index}
                      className={`flex items-center justify-between p-2 rounded border ${
                        voteData.isAnonymous 
                          ? 'bg-purple-50/50 border-purple-200/50' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          voteData.isAnonymous ? 'bg-purple-400' : 'bg-blue-400'
                        }`} />
                        <span className={`text-sm ${
                          voteData.isAnonymous ? 'text-purple-800' : 'text-gray-700'
                        }`}>
                          {voter}
                        </span>
                      </div>
                      <Badge variant="outline" className={
                        voteData.isAnonymous 
                          ? 'border-purple-300 text-purple-700' 
                          : ''
                      }>
                        #{index + 1}
                      </Badge>
                    </div>
                  ))}
                </div>
                {voteData.isAnonymous && (
                  <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-start gap-2">
                      <EyeOff className="w-4 h-4 text-purple-600 mt-0.5" />
                      <div className="text-sm text-purple-800">
                        <div className="font-medium">Głosowanie niejawne</div>
                        <div className="text-purple-600 mt-1">
                          Szczegóły głosów są ukryte. Widoczna jest tylko lista uczestników.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className={`w-12 h-12 mx-auto mb-3 ${
                  voteData.isAnonymous ? 'text-purple-300' : 'text-gray-300'
                }`} />
                <p className={`text-sm ${
                  voteData.isAnonymous ? 'text-purple-600' : 'text-muted-foreground'
                }`}>
                  Jeszcze nikt nie zagłosował w tej ankiecie
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Akcje */}
        <Card className={anonymousStyles.cardClass}>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href={`/vote/${voteId}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  Powrót do głosowania
                </Button>
              </Link>
              <Link href="/vote/new" className="flex-1">
                <Button className="w-full">
                  Utwórz nową ankietę
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
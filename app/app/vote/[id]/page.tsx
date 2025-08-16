"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Client, Databases } from "appwrite"
import { useParams } from "next/navigation"
import { Loader2, EyeOff, Users, ShieldCheck } from "lucide-react"

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

export default function VotePage() {
  const params = useParams()
  const voteId = params.id as string
  
  const [voteData, setVoteData] = useState<VoteData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isVoting, setIsVoting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [userIdentifier, setUserIdentifier] = useState("")
  const [showIdentifierDialog, setShowIdentifierDialog] = useState(false)
  const [pendingVote, setPendingVote] = useState<number | null>(null)

  // Symulacja sprawdzenia czy użytkownik jest zalogowany
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState<string>("")

  useEffect(() => {
    // Sprawdź czy użytkownik jest zalogowany (symulacja)
    const storedUser = localStorage.getItem('currentUser')
    if (storedUser) {
      setIsLoggedIn(true)
      setCurrentUser(storedUser)
    }
  }, [])

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
        
        // Sprawdź czy użytkownik już głosował
        const identifier = isLoggedIn ? currentUser : localStorage.getItem(`vote_${voteId}_identifier`)
        if (identifier && data.voters.includes(identifier)) {
          setHasVoted(true)
        }
        
      } catch (error) {
        console.error("Błąd podczas ładowania ankiety:", error)
        setError("Nie udało się załadować ankiety. Sprawdź czy ID jest prawidłowe.")
      } finally {
        setIsLoading(false)
      }
    }

    if (voteId) {
      fetchVoteData()
    }
  }, [voteId, isLoggedIn, currentUser])

  // Funkcja głosowania
  const handleVote = async (optionValue: number) => {
    if (!voteData || hasVoted) return

    // Jeśli nie zalogowany, wymagaj identyfikatora
    if (!isLoggedIn) {
      const storedIdentifier = localStorage.getItem(`vote_${voteId}_identifier`)
      if (!storedIdentifier) {
        setPendingVote(optionValue)
        setShowIdentifierDialog(true)
        return
      }
    }

    await submitVote(optionValue)
  }

  const submitVote = async (optionValue: number) => {
    if (!voteData) return
    
    setIsVoting(true)
    
    try {
      const identifier = isLoggedIn ? currentUser : userIdentifier || localStorage.getItem(`vote_${voteId}_identifier`)
      
      if (!identifier) {
        alert("Błąd: Brak identyfikatora użytkownika")
        return
      }

      // Aktualizacja wyników
      const updatedResults = { ...voteData.results }
      updatedResults[optionValue.toString()] = (updatedResults[optionValue.toString()] || 0) + 1
      
      const updatedTotalVotes = voteData.totalVotes + 1
      const updatedVoters = [...voteData.voters, identifier]

      // Zapisanie w bazie danych
      await databases.updateDocument(
        'votes',
        'votes',
        voteId,
        {
          results: JSON.stringify(updatedResults),
          totalVotes: updatedTotalVotes,
          voters: JSON.stringify(updatedVoters)
        }
      )

      // Aktualizacja lokalnego stanu
      setVoteData({
        ...voteData,
        results: updatedResults,
        totalVotes: updatedTotalVotes,
        voters: updatedVoters
      })

      setHasVoted(true)
      
      // Zapisz identyfikator lokalnie jeśli nie zalogowany
      if (!isLoggedIn && userIdentifier) {
        localStorage.setItem(`vote_${voteId}_identifier`, userIdentifier)
      }
      
      alert("Dziękujemy za oddanie głosu!")
      
    } catch (error) {
      console.error("Błąd podczas głosowania:", error)
      alert("Wystąpił błąd podczas głosowania. Spróbuj ponownie.")
    } finally {
      setIsVoting(false)
      setShowIdentifierDialog(false)
      setPendingVote(null)
    }
  }

  const confirmIdentifierAndVote = async () => {
    if (!userIdentifier.trim()) {
      alert("Proszę wprowadzić identyfikator")
      return
    }

    if (pendingVote !== null) {
      await submitVote(pendingVote)
    }
  }

  // Login/logout dla demonstracji
  const handleLogin = () => {
    const username = prompt("Wprowadź nazwę użytkownika:")
    if (username) {
      localStorage.setItem('currentUser', username)
      setCurrentUser(username)
      setIsLoggedIn(true)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    setCurrentUser("")
    setIsLoggedIn(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Ładowanie ankiety...</span>
        </div>
      </div>
    )
  }

  if (error || !voteData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Błąd</CardTitle>
            <CardDescription>
              {error || "Nie znaleziono ankiety"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              ID ankiety: {voteId}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isExpired = new Date(voteData.deadline) < new Date()

  // Styling dla głosowania niejawnego
  const anonymousStyles = voteData.isAnonymous ? {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    containerClass: "bg-gradient-to-br from-purple-50 to-blue-50 min-h-screen",
    cardClass: "bg-white/90 backdrop-blur-sm border-purple-200/50 shadow-xl"
  } : {
    background: "",
    containerClass: "min-h-screen",
    cardClass: ""
  }

  return (
    <div className={`flex items-center justify-center p-4 ${anonymousStyles.containerClass}`}>
      {voteData.isAnonymous && (
        <div className="absolute top-4 left-4 right-4 text-center">
          <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-300">
            <EyeOff className="w-4 h-4 mr-2" />
            Głosowanie niejawne
          </Badge>
        </div>
      )}
      
      {/* Panel logowania (demonstracja) */}
      <div className="absolute top-4 right-4">
        {isLoggedIn ? (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <ShieldCheck className="w-4 h-4 mr-1" />
              {currentUser}
            </Badge>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Wyloguj
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="sm" onClick={handleLogin}>
            Zaloguj się
          </Button>
        )}
      </div>

      <Card className={`w-full max-w-sm ${anonymousStyles.cardClass}`}>
        <CardHeader>
          <CardTitle className={voteData.isAnonymous ? "text-purple-900" : ""}>
            {voteData.title}
          </CardTitle>
          <CardDescription className={voteData.isAnonymous ? "text-purple-700" : ""}>
            {voteData.description}
          </CardDescription>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{voteData.category}</Badge>
            {voteData.isAnonymous && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                <EyeOff className="w-3 h-3 mr-1" />
                Niejawne
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="flex flex-col gap-2">
          {voteData.options.map((option) => (
            <AlertDialog key={option.value}>
              <AlertDialogTrigger asChild>
                <Button 
                  variant={option.variant as any} 
                  className={`w-full ${voteData.isAnonymous ? 'hover:bg-purple-50 transition-colors' : ''}`}
                  disabled={hasVoted || isExpired || isVoting}
                >
                  {option.label} ({option.value > 0 ? '+' : ''}{option.value})
                  {hasVoted && ` - ${voteData.results[option.value.toString()] || 0} głosów`}
                </Button>
              </AlertDialogTrigger>
              
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Potwierdzenie głosu</AlertDialogTitle>
                  <AlertDialogDescription>
                    {option.description} - głos: {option.value > 0 ? '+' : ''}{option.value}
                    <br />
                    <br />
                    {isExpired ? (
                      <span className="text-red-500">Ta ankieta została zakończona.</span>
                    ) : hasVoted ? (
                      <span className="text-yellow-500">Już zagłosowałeś w tej ankiecie.</span>
                    ) : (
                      <>
                        Tej akcji nie można cofnąć.
                        {voteData.isAnonymous && (
                          <div className="mt-2 p-2 bg-purple-50 rounded text-purple-800 text-sm">
                            <EyeOff className="w-4 h-4 inline mr-1" />
                            To jest głosowanie niejawne - nikt nie zobaczy jak głosowałeś.
                          </div>
                        )}
                      </>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                
                <AlertDialogFooter>
                  <AlertDialogCancel>Anuluj</AlertDialogCancel>
                  {!hasVoted && !isExpired && (
                    <AlertDialogAction
                      onClick={() => handleVote(option.value)}
                      disabled={isVoting}
                    >
                      {isVoting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Zapisywanie...
                        </>
                      ) : (
                        `Potwierdź głos: ${option.label}`
                      )}
                    </AlertDialogAction>
                  )}
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ))}
        </CardContent>
        
        <CardFooter>
          <div className="w-full text-sm text-muted-foreground">
            <p>Całkowita liczba głosów: {voteData.totalVotes}</p>
            <p className="mt-1">
              Za: {voteData.results["1"] || 0} | 
              Przeciw: {voteData.results["-1"] || 0} | 
              Wstrzymało się: {voteData.results["0"] || 0}
            </p>
            <p className="mt-1 text-xs">
              Termin: {new Date(voteData.deadline).toLocaleDateString('pl-PL')}
              {isExpired && <span className="text-red-500 ml-1">(zakończone)</span>}
            </p>
            {!voteData.isAnonymous && (
              <p className="mt-1 text-xs flex items-center gap-1">
                <Users className="w-3 h-3" />
                Zagłosowało: {voteData.voters.length} osób
              </p>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Dialog identyfikatora */}
      <Dialog open={showIdentifierDialog} onOpenChange={setShowIdentifierDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Identyfikacja głosującego</DialogTitle>
            <DialogDescription>
              Aby zagłosować, musisz podać swój identyfikator. Może to być Twoje imię, 
              nick lub dowolny ciąg znaków który Cię identyfikuje.
              {voteData.isAnonymous && (
                <div className="mt-2 p-2 bg-purple-50 rounded text-purple-800 text-sm">
                  <EyeOff className="w-4 h-4 inline mr-1" />
                  Identyfikator służy tylko do sprawdzenia czy już głosowałeś.
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="identifier">Twój identyfikator</Label>
              <Input
                id="identifier"
                placeholder="np. Jan Kowalski, jkowalski, użytkownik123"
                value={userIdentifier}
                onChange={(e) => setUserIdentifier(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowIdentifierDialog(false)}>
              Anuluj
            </Button>
            <Button onClick={confirmIdentifierAndVote} disabled={!userIdentifier.trim()}>
              Zagłosuj
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
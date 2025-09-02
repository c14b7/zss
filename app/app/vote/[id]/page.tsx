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
import { Client, Databases, ID } from "appwrite"
import { useParams } from "next/navigation"
import { Loader2, EyeOff, Users, ShieldCheck, LogOut, UserPlus } from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { LoginDialog } from "@/components/auth/LoginDialog"
import { toast } from "sonner"
import Link from "next/link"

interface VoteOption {
  value: number
  label: string
  description: string
  variant: "default" | "destructive" | "outline"
}

interface VoteRecord {
  userId: string
  userName: string
  vote: number
  timestamp: string
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
  voteRecords: VoteRecord[]
}

// Konfiguracja Appwrite
const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('687abe96000d2d31f914')

const databases = new Databases(client)

export default function VotePage() {
  const params = useParams()
  const voteId = params.id as string
  const { user, logout } = useAuth()
  
  const [voteData, setVoteData] = useState<VoteData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isVoting, setIsVoting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [userIdentifier, setUserIdentifier] = useState("")
  const [showIdentifierDialog, setShowIdentifierDialog] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [pendingVote, setPendingVote] = useState<number | null>(null)

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
          voters: JSON.parse(response.voters || '[]'),
          voteRecords: JSON.parse(response.voteRecords || '[]')
        }

        setVoteData(data)
        
        // Sprawdź czy użytkownik już głosował
        if (user && data.voters.includes(user.$id)) {
          setHasVoted(true)
        } else if (!user) {
          const identifier = localStorage.getItem(`vote_${voteId}_identifier`)
          if (identifier && data.voters.includes(identifier)) {
            setHasVoted(true)
            setUserIdentifier(identifier)
          }
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
  }, [voteId, user])

  // Funkcja głosowania
  const handleVote = async (optionValue: number) => {
    if (!voteData || hasVoted) return

    // Jeśli nie zalogowany i nie ma identyfikatora, poproś o identyfikator
    if (!user) {
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
      const identifier = user ? user.$id : userIdentifier || localStorage.getItem(`vote_${voteId}_identifier`)
      const userName = user ? user.name : userIdentifier || localStorage.getItem(`vote_${voteId}_identifier`) || 'Anonim'
      
      if (!identifier) {
        toast.error("Błąd: Brak identyfikatora użytkownika")
        setIsVoting(false)
        return
      }

      // Sprawdź czy już głosował
      if (voteData.voters.includes(identifier)) {
        toast.error("Już zagłosowałeś w tej ankiecie!")
        setHasVoted(true)
        setIsVoting(false)
        return
      }

      // Aktualizacja wyników
      const updatedResults = { ...voteData.results }
      updatedResults[optionValue.toString()] = (updatedResults[optionValue.toString()] || 0) + 1
      
      const updatedTotalVotes = voteData.totalVotes + 1
      const updatedVoters = [...voteData.voters, identifier]

      // Dodaj rekord głosu (tylko jeśli nie jest anonimowe)
      const updatedVoteRecords = [...voteData.voteRecords]
      if (!voteData.isAnonymous) {
        updatedVoteRecords.push({
          userId: identifier,
          userName: userName,
          vote: optionValue,
          timestamp: new Date().toISOString()
        })
      }

      // Zapisanie w bazie danych
      await databases.updateDocument(
        'votes',
        'votes',
        voteId,
        {
          results: JSON.stringify(updatedResults),
          totalVotes: updatedTotalVotes,
          voters: JSON.stringify(updatedVoters),
          voteRecords: JSON.stringify(updatedVoteRecords)
        }
      )

      // Aktualizacja lokalnego stanu
      setVoteData({
        ...voteData,
        results: updatedResults,
        totalVotes: updatedTotalVotes,
        voters: updatedVoters,
        voteRecords: updatedVoteRecords
      })

      setHasVoted(true)
      
      // Zapisz identyfikator lokalnie jeśli nie zalogowany
      if (!user) {
        localStorage.setItem(`vote_${voteId}_identifier`, identifier)
      }
      
      toast.success("Dziękujemy za oddanie głosu!")
      
    } catch (error) {
      console.error("Błąd podczas głosowania:", error)
      toast.error("Wystąpił błąd podczas głosowania. Spróbuj ponownie.")
    } finally {
      setIsVoting(false)
      setShowIdentifierDialog(false)
      setPendingVote(null)
    }
  }

  const confirmIdentifierAndVote = async () => {
    if (!userIdentifier.trim()) {
      toast.error("Proszę wprowadzić identyfikator")
      return
    }

    if (pendingVote !== null) {
      // Zapisz identyfikator lokalnie przed głosowaniem
      localStorage.setItem(`vote_${voteId}_identifier`, userIdentifier)
      await submitVote(pendingVote)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast.success("Wylogowano pomyślnie")
    } catch (error) {
      toast.error("Błąd podczas wylogowywania")
    }
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

  // Styling dla głosowania niejawnego
  const anonymousStyles = voteData.isAnonymous ? {
    containerClass: "bg-gradient-to-br from-purple-50 to-blue-50 min-h-screen",
    cardClass: "bg-white/90 backdrop-blur-sm border-purple-200/50 shadow-xl"
  } : {
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
      
      {/* Panel logowania */}
      <div className="absolute top-4 right-4">
        {user ? (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <ShieldCheck className="w-4 h-4 mr-1" />
              {user.name}
            </Badge>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => setShowLoginDialog(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
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
            <div className="mt-2">
              <Link href={`/vote/results/${voteId}`}>
                <Button variant="outline" size="sm" className="w-full">
                  Zobacz szczegółowe wyniki
                </Button>
              </Link>
            </div>
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && userIdentifier.trim()) {
                    confirmIdentifierAndVote()
                  }
                }}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowIdentifierDialog(false)}>
              Anuluj
            </Button>
            <Button onClick={confirmIdentifierAndVote} disabled={!userIdentifier.trim() || isVoting}>
              {isVoting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Głosuję...
                </>
              ) : (
                'Zagłosuj'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Login Dialog */}
      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </div>
  )
}
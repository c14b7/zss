"use client"

import { useState, useEffect } from "react"
import { 
  Edit, 
  Trash2, 
  Copy, 
  BarChart3, 
  Share2, 
  Calendar,
  Users,
  Plus,
  Search,
  Filter,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Clock,
  EyeOff
} from "lucide-react"
import { Client, Databases, Query } from "appwrite"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import Link from "next/link"

interface VoteOption {
  value: number
  label: string
  description: string
  variant: "default" | "destructive" | "outline"
}

interface VoteItem {
  $id: string
  title: string
  description: string
  category: string
  options: VoteOption[]
  deadline: string
  totalVotes: number
  results: Record<string, number>
  isAnonymous: boolean
  voters: string[]
  $createdAt: string
  $updatedAt: string
}

// Konfiguracja Appwrite
const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('687abe96000d2d31f914')

const databases = new Databases(client)

export default function ManageVotesPage() {
  const [votes, setVotes] = useState<VoteItem[]>([])
  const [filteredVotes, setFilteredVotes] = useState<VoteItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [voteToDelete, setVoteToDelete] = useState<string | null>(null)

  // Ładowanie wszystkich głosowań
  useEffect(() => {
    const fetchVotes = async () => {
      try {
        setIsLoading(true)
        
        const response = await databases.listDocuments(
          'votes',
          'votes',
          [
            Query.orderDesc('$createdAt'),
            Query.limit(100)
          ]
        )

        const votesData: VoteItem[] = response.documents.map(doc => ({
          $id: doc.$id,
          title: doc.title,
          description: doc.description,
          category: doc.category,
          options: JSON.parse(doc.options),
          deadline: doc.deadline,
          totalVotes: doc.totalVotes || 0,
          results: JSON.parse(doc.results),
          isAnonymous: doc.isAnonymous || false,
          voters: JSON.parse(doc.voters || '[]'),
          $createdAt: doc.$createdAt,
          $updatedAt: doc.$updatedAt
        }))

        setVotes(votesData)
        setFilteredVotes(votesData)
        
      } catch (error) {
        console.error("Błąd podczas ładowania głosowań:", error)
        toast.error("Nie udało się załadować listy głosowań.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchVotes()
  }, [])

  // Filtrowanie głosowań
  useEffect(() => {
    let filtered = votes

    // Filtrowanie według wyszukiwania
    if (searchTerm) {
      filtered = filtered.filter(vote => 
        vote.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vote.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vote.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrowanie według statusu
    if (filterStatus !== "all") {
      const now = new Date()
      filtered = filtered.filter(vote => {
        const deadline = new Date(vote.deadline)
        switch (filterStatus) {
          case "active":
            return deadline >= now
          case "expired":
            return deadline < now
          case "no-votes":
            return vote.totalVotes === 0
          case "has-votes":
            return vote.totalVotes > 0
          case "anonymous":
            return vote.isAnonymous
          case "public":
            return !vote.isAnonymous
          default:
            return true
        }
      })
    }

    setFilteredVotes(filtered)
  }, [votes, searchTerm, filterStatus])

  // Kopiowanie linku
  const copyLink = async (voteId: string, type: 'vote' | 'results') => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const url = `${baseUrl}/vote${type === 'results' ? '/results' : ''}/${voteId}`
    
    try {
      await navigator.clipboard.writeText(url)
      toast.success(`Link ${type === 'results' ? 'do wyników' : 'do głosowania'} został skopiowany do schowka!`)
    } catch (error) {
      toast.error("Nie udało się skopiować linku.")
    }
  }

  // Udostępnianie
  const shareVote = async (voteId: string, title: string, type: 'vote' | 'results') => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const url = `${baseUrl}/vote${type === 'results' ? '/results' : ''}/${voteId}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${type === 'results' ? 'Wyniki: ' : ''}${title}`,
          text: `${type === 'results' ? 'Zobacz wyniki głosowania' : 'Zagłosuj w ankiecie'}: ${title}`,
          url: url
        })
      } catch (error) {
        copyLink(voteId, type)
      }
    } else {
      copyLink(voteId, type)
    }
  }

  // Usuwanie głosowania
  const deleteVote = async (voteId: string) => {
    try {
      await databases.deleteDocument('votes', 'votes', voteId)
      
      setVotes(votes.filter(vote => vote.$id !== voteId))
      
      toast.success("Głosowanie zostało pomyślnie usunięte.")
      
      setDeleteDialogOpen(false)
      setVoteToDelete(null)
    } catch (error) {
      console.error("Błąd podczas usuwania:", error)
      toast.error("Nie udało się usunąć głosowania.")
    }
  }

  // Sprawdzanie statusu głosowania
  const getVoteStatus = (vote: VoteItem) => {
    const now = new Date()
    const deadline = new Date(vote.deadline)
    
    if (deadline < now) {
      return { status: 'expired', label: 'Zakończone', color: 'destructive' as const }
    } else if (vote.totalVotes === 0) {
      return { status: 'no-votes', label: 'Brak głosów', color: 'secondary' as const }
    } else {
      return { status: 'active', label: 'Aktywne', color: 'default' as const }
    }
  }

  // Ikona statusu
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'expired':
        return <AlertCircle className="w-4 h-4" />
      case 'no-votes':
        return <Clock className="w-4 h-4" />
      case 'active':
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-6 h-6 animate-pulse" />
          <span>Ładowanie głosowań...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Nagłówek */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="min-w-0 flex-1">
                <CardTitle className="text-2xl break-words">Zarządzanie głosowaniami</CardTitle>
                <CardDescription className="break-words">
                  Wszystkie utworzone ankiety i ich statystyki
                </CardDescription>
              </div>
              <div className="flex-shrink-0">
                <Link href="/vote/new">
                  <Button className="w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    Nowe głosowanie
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Filtry i wyszukiwarka */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Szukaj głosowań..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Wszystkie</SelectItem>
                    <SelectItem value="active">Aktywne</SelectItem>
                    <SelectItem value="expired">Zakończone</SelectItem>
                    <SelectItem value="has-votes">Z głosami</SelectItem>
                    <SelectItem value="no-votes">Bez głosów</SelectItem>
                    <SelectItem value="anonymous">Niejawne</SelectItem>
                    <SelectItem value="public">Jawne</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista głosowań */}
        {filteredVotes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BarChart3 className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {votes.length === 0 ? "Brak głosowań" : "Nie znaleziono głosowań"}
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {votes.length === 0 
                  ? "Utwórz swoją pierwszą ankietę, aby rozpocząć zbieranie głosów."
                  : "Spróbuj zmienić kryteria wyszukiwania lub filtry."}
              </p>
              {votes.length === 0 && (
                <Link href="/vote/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Utwórz pierwszą ankietę
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">{filteredVotes.map((vote) => {
              const voteStatus = getVoteStatus(vote)
              
              return (
                <Card 
                  key={vote.$id} 
                  className={`hover:shadow-lg transition-shadow ${
                    vote.isAnonymous ? 'bg-gradient-to-br from-purple-50/50 to-blue-50/50 border-purple-200/50' : ''
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1 min-w-0">
                        <CardTitle className={`text-lg break-words ${
                          vote.isAnonymous ? 'text-purple-900' : ''
                        }`}>
                          {vote.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={voteStatus.color}>
                            {getStatusIcon(voteStatus.status)}
                            <span className="ml-1">{voteStatus.label}</span>
                          </Badge>
                          <Badge variant="outline">{vote.category}</Badge>
                          {vote.isAnonymous && (
                            <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-300">
                              <EyeOff className="w-3 h-3 mr-1" />
                              Niejawne
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <Link href={`/vote/${vote.$id}`}>
                            <DropdownMenuItem>
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Otwórz ankietę
                            </DropdownMenuItem>
                          </Link>
                          <Link href={`/vote/results/${vote.$id}`}>
                            <DropdownMenuItem>
                              <BarChart3 className="w-4 h-4 mr-2" />
                              Zobacz wyniki
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => copyLink(vote.$id, 'vote')}>
                            <Copy className="w-4 h-4 mr-2" />
                            Kopiuj link ankiety
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => copyLink(vote.$id, 'results')}>
                            <Copy className="w-4 h-4 mr-2" />
                            Kopiuj link wyników
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => shareVote(vote.$id, vote.title, 'vote')}>
                            <Share2 className="w-4 h-4 mr-2" />
                            Udostępnij ankietę
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => shareVote(vote.$id, vote.title, 'results')}>
                            <Share2 className="w-4 h-4 mr-2" />
                            Udostępnij wyniki
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => {
                              setVoteToDelete(vote.$id)
                              setDeleteDialogOpen(true)
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Usuń
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <p className={`text-sm mb-3 line-clamp-3 break-words ${
                      vote.isAnonymous ? 'text-purple-700' : 'text-muted-foreground'
                    }`}>
                      {vote.description}
                    </p>
                    
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span className={vote.isAnonymous ? 'text-purple-600' : ''}>
                            {vote.totalVotes} głosów
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span className={vote.isAnonymous ? 'text-purple-600' : ''}>
                            {new Date(vote.deadline).toLocaleDateString('pl-PL')}
                          </span>
                        </div>
                      </div>
                      <div className={`text-xs ${vote.isAnonymous ? 'text-purple-600' : ''}`}>
                        Utworzone: {new Date(vote.$createdAt).toLocaleDateString('pl-PL')}
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-0">
                    <div className="flex gap-2 w-full">
                      <Link href={`/vote/${vote.$id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          Ankieta
                        </Button>
                      </Link>
                      <Link href={`/vote/results/${vote.$id}`} className="flex-1">
                        <Button size="sm" className="w-full">
                          Wyniki
                        </Button>
                      </Link>
                    </div>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}

        {/* Dialog usuwania */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Czy na pewno chcesz usunąć to głosowanie?</AlertDialogTitle>
              <AlertDialogDescription>
                Ta akcja nie może być cofnięta. Głosowanie zostanie permanentnie usunięte wraz ze wszystkimi głosami.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setVoteToDelete(null)}>
                Anuluj
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => voteToDelete && deleteVote(voteToDelete)}
                className="bg-red-600 hover:bg-red-700"
              >
                Usuń głosowanie
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
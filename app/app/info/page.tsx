"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Client, Databases, Query } from "appwrite"
import { 
  Megaphone, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Eye,
  Clock,
  Pin,
  AlertCircle,
  CheckCircle,
  Info,
  Globe,
  Users,
  Building
} from "lucide-react"
import { toast } from "sonner"

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("687abe96000d2d31f914")

const databases = new Databases(client)

interface Announcement {
  $id: string
  title: string
  content: string
  excerpt: string
  author: string
  authorName: string
  status: 'current' | 'archived' | 'draft' | 'scheduled'
  category: 'general' | 'urgent' | 'meeting' | 'system' | 'hr' | 'finance'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  viewCount: number
  expirationDate?: string
  publishDate: string
  tags: string[]
  $createdAt: string
  $updatedAt: string
}

export default function AnnouncementsPage() {
  console.log("🏗️ Inicjalizacja komponentu AnnouncementsPage")
  
  const router = useRouter()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("current")

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [announcements, searchQuery, filterCategory, filterStatus])

  const fetchAnnouncements = async () => {
    console.log("🔍 Pobieranie ogłoszeń...")
    setIsLoading(true)

    try {
      // Konfiguracja Appwrite
      const client = new Client()
        .setEndpoint('https://cloud.appwrite.io/v1')
        .setProject('676b2af40008104b1e7f'); // ID projektu

      const databases = new Databases(client);

      // Pobierz ogłoszenia z bazy danych
      const response = await databases.listDocuments(
        'votes', // Database ID
        'announcements', // Collection ID  
        [
          // Sortuj: aktualne pierwsze, potem według priorytetu i daty
          // Query.orderDesc('status'),
          // Query.orderDesc('priority'),  
          // Query.orderDesc('publishDate')
        ]
      );

      console.log("📋 Pobrane ogłoszenia:", response);
      setAnnouncements(response.documents as Announcement[]);
    } catch (error) {
      console.error("❌ Błąd przy pobieraniu ogłoszeń:", error);
      
      // Fallback - mock data jeśli Appwrite nie działa
      const mockAnnouncements: Announcement[] = [
        {
          $id: "0",
          title: "🚨 PILNE: Ewakuacja budynku - ćwiczenia BHP",
          content: "Dziś o godzinie 14:00 odbędą się obowiązkowe ćwiczenia ewakuacyjne. Wszyscy pracownicy muszą opuścić budynek i zgromadzić się na parkingu. Ćwiczenia potrwają około 30 minut.",
          excerpt: "Obowiązkowe ćwiczenia ewakuacyjne dziś o 14:00 - zgromadzenie na parkingu.",
          author: "bhp@example.com",
          authorName: "Koordynator BHP",
          status: "current",
          category: "urgent",
          priority: "urgent",
          viewCount: 567,
          publishDate: new Date().toISOString(),
          expirationDate: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // Wygasa za 6h
          tags: ["pilne", "ewakuacja", "BHP", "ćwiczenia"],
          $createdAt: new Date().toISOString(),
          $updatedAt: new Date().toISOString(),
        },
        {
          $id: "1",
          title: "Ważne: Zmiana godzin pracy biura",
          content: "Od przyszłego tygodnia biuro będzie czynne w godzinach 8:00-16:00. Prosimy o dostosowanie się do nowych godzin.",
          excerpt: "Od przyszłego tygodnia biuro będzie czynne w godzinach 8:00-16:00.",
          author: "admin@example.com",
          authorName: "Administrator",
          status: "current",
          category: "urgent",
          priority: "high",
          viewCount: 156,
          publishDate: new Date().toISOString(),
          expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          tags: ["biuro", "godziny", "ważne"],
          $createdAt: new Date().toISOString(),
          $updatedAt: new Date().toISOString(),
        },
        {
          $id: "2",
          title: "Spotkanie zespołu - Planowanie Q3",
          content: "Zapraszamy na spotkanie zespołu w celu omówienia planów na trzeci kwartał. Spotkanie odbędzie się w sali konferencyjnej A o godzinie 10:00.",
          excerpt: "Spotkanie zespołu w sali konferencyjnej A o 10:00 - planowanie Q3.",
          author: "manager@example.com",
          authorName: "Jan Kowalski",
          status: "current",
          category: "meeting",
          priority: "normal",
          viewCount: 89,
          publishDate: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          tags: ["spotkanie", "planowanie", "Q3"],
          $createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          $updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        },
        {
          $id: "3",
          title: "Nowa platforma e-learning dostępna",
          content: "Mamy przyjemność poinformować, że nowa platforma e-learning jest już dostępna dla wszystkich pracowników. Logowanie przez system firmowy.",
          excerpt: "Nowa platforma e-learning dostępna dla wszystkich pracowników.",
          author: "hr@example.com", 
          authorName: "Anna Nowak",
          status: "current",
          category: "hr",
          priority: "normal",
          viewCount: 234,
          publishDate: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          tags: ["e-learning", "szkolenia", "rozwój"],
          $createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          $updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        },
        {
          $id: "4",
          title: "Konserwacja systemu IT - weekend",
          content: "W weekend 23-24 września będzie przeprowadzona konserwacja systemu IT. Mogą występować przerwy w dostępie do aplikacji.",
          excerpt: "Konserwacja systemu IT w weekend - możliwe przerwy w dostępie.",
          author: "it@example.com",
          authorName: "Piotr Wiśniewski",
          status: "archived",
          category: "system",
          priority: "high",
          viewCount: 178,
          publishDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
          expirationDate: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          tags: ["IT", "konserwacja", "system"],
          $createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
          $updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        },
        {
          $id: "5",
          title: "Nowe zasady pracy zdalnej",
          content: "Wprowadzamy nowe zasady pracy zdalnej obowiązujące od października. Szczegóły w załączonym dokumencie.",
          excerpt: "Nowe zasady pracy zdalnej od października - sprawdź szczegóły.",
          author: "hr@example.com",
          authorName: "Anna Nowak", 
          status: "current",
          category: "hr",
          priority: "normal",
          viewCount: 312,
          publishDate: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
          tags: ["praca zdalna", "zasady", "październik"],
          $createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
          $updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        }
      ]

      setAnnouncements(mockAnnouncements)
      console.log("✅ Pobrano mock dane:", mockAnnouncements.length, "ogłoszeń")
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = announcements

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(announcement =>
        announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        announcement.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        announcement.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        announcement.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Filter by category
    if (filterCategory !== "all") {
      filtered = filtered.filter(announcement => announcement.category === filterCategory)
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(announcement => announcement.status === filterStatus)
    }

    // Sort: current first, then by date
    filtered.sort((a, b) => {
      // Current announcements first
      if (a.status === 'current' && b.status !== 'current') return -1
      if (b.status === 'current' && a.status !== 'current') return 1
      
      // Then by priority within current
      if (a.status === 'current' && b.status === 'current') {
        const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 }
        const aPriority = priorityOrder[a.priority] || 0
        const bPriority = priorityOrder[b.priority] || 0
        if (aPriority !== bPriority) return bPriority - aPriority
      }
      
      // Finally by date (newest first)
      return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    })

    setFilteredAnnouncements(filtered)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      return "Dzisiaj"
    } else if (diffDays === 2) {
      return "Wczoraj"
    } else if (diffDays <= 7) {
      return `${diffDays - 1} dni temu`
    } else {
      return date.toLocaleDateString('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'urgent': return <AlertCircle className="h-4 w-4" />
      case 'meeting': return <Users className="h-4 w-4" />
      case 'system': return <Building className="h-4 w-4" />
      case 'hr': return <User className="h-4 w-4" />
      case 'finance': return <Building className="h-4 w-4" />
      default: return <Info className="h-4 w-4" />
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'urgent': return 'Pilne'
      case 'meeting': return 'Spotkania'
      case 'system': return 'System'
      case 'hr': return 'HR'
      case 'finance': return 'Finanse'
      default: return 'Ogólne'
    }
  }

  const getPriorityColor = (priority: string, status: string) => {
    const baseColors = {
      urgent: status === 'current' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-red-300',
      high: status === 'current' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-orange-300',
      normal: status === 'current' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-blue-300',
      low: status === 'current' ? 'border-gray-500 bg-gray-50 dark:bg-gray-900/20' : 'border-gray-300'
    }
    return baseColors[priority as keyof typeof baseColors] || baseColors.normal
  }

  const currentCount = announcements.filter(a => a.status === 'current').length
  const totalViews = announcements.reduce((sum, a) => sum + a.viewCount, 0)

  if (isLoading) {
    return (
      <div className="py-6 px-2">
        <div className="w-full max-w-6xl mx-auto px-2">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 bg-slate-200 dark:bg-slate-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-6 px-2">
      <div className="w-full max-w-6xl mx-auto px-2">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-3">
            <Megaphone className="h-8 w-8" />
            Tablica ogłoszeń
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Najważniejsze informacje i komunikaty dla zespołu
          </p>
          
          {/* Quick Stats */}
          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <Pin className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {currentCount} aktualnych ogłoszeń
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-green-600" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {totalViews.toLocaleString()} wyświetleń
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Szukaj ogłoszeń..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Category Filter */}
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Kategoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie kategorie</SelectItem>
                  <SelectItem value="general">Ogólne</SelectItem>
                  <SelectItem value="urgent">Pilne</SelectItem>
                  <SelectItem value="meeting">Spotkania</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="finance">Finanse</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie</SelectItem>
                  <SelectItem value="current">Aktualne</SelectItem>
                  <SelectItem value="archived">Archiwalne</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Announcements Grid */}
        {filteredAnnouncements.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Megaphone className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                Brak ogłoszeń
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Nie znaleziono ogłoszeń spełniających kryteria wyszukiwania.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Pilne ogłoszenia - cała szerokość */}
            {filteredAnnouncements
              .filter(announcement => announcement.tags?.includes('pilne') || announcement.priority === 'urgent')
              .map((announcement) => (
                <Card 
                  key={announcement.$id} 
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 border-red-200 dark:border-red-800 shadow-lg bg-red-50 dark:bg-red-950/50`}
                  onClick={() => router.push(`/info/${announcement.$id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                        <Badge variant="destructive" className="text-xs font-semibold">
                          PILNE
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {announcement.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <Eye className="h-3 w-3" />
                        {announcement.viewCount}
                      </div>
                    </div>
                    <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 leading-tight">
                      {announcement.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                      {announcement.excerpt}
                    </p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {announcement.authorName}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(announcement.publishDate).toLocaleDateString('pl-PL')}
                        </div>
                      </div>
                      {announcement.tags && announcement.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Tag className="h-3 w-3 text-slate-400" />
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            +{announcement.tags.length}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            
            {/* Pozostałe ogłoszenia - siatka */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAnnouncements
                .filter(announcement => !announcement.tags?.includes('pilne') && announcement.priority !== 'urgent')
                .map((announcement) => (
                  <Card 
                    key={announcement.$id} 
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      announcement.status === 'current' 
                        ? `border-2 ${getPriorityColor(announcement.priority, announcement.status)} shadow-md` 
                        : 'border hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                    onClick={() => router.push(`/info/${announcement.$id}`)}
                  >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(announcement.category)}
                      <Badge 
                        variant={announcement.status === 'current' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {getCategoryLabel(announcement.category)}
                      </Badge>
                    </div>
                    {announcement.status === 'current' && (
                      <Pin className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    )}
                  </div>
                  
                  <CardTitle className={`text-lg leading-tight ${
                    announcement.status === 'current' 
                      ? 'text-slate-900 dark:text-slate-100' 
                      : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    {announcement.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-4">
                    {announcement.excerpt}
                  </p>
                  
                  {/* Tags */}
                  {announcement.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {announcement.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {announcement.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{announcement.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <Separator className="mb-3" />
                  
                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-xs">
                          {announcement.authorName.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{announcement.authorName}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{announcement.viewCount}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(announcement.publishDate)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Expiration warning for current announcements */}
                  {announcement.status === 'current' && announcement.expirationDate && (
                    <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                      <div className="flex items-center gap-2 text-xs text-yellow-700 dark:text-yellow-300">
                        <AlertCircle className="h-3 w-3" />
                        <span>Ważne do: {formatDate(announcement.expirationDate)}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

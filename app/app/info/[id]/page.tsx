"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Client, Databases } from "appwrite"
import { 
  ArrowLeft,
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
  Building,
  Download,
  Share2,
  Bookmark,
  Tag,
  ExternalLink
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
  attachments?: Array<{
    name: string
    url: string
    size: number
    type: string
  }>
  $createdAt: string
  $updatedAt: string
}

export default function AnnouncementDetailPage() {
  const router = useRouter()
  const params = useParams()
  const announcementId = params.id as string
  
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isBookmarked, setIsBookmarked] = useState(false)

  useEffect(() => {
    if (announcementId) {
      fetchAnnouncement(announcementId)
      incrementViewCount(announcementId)
    }
  }, [announcementId])

  const fetchAnnouncement = async (id: string) => {
    console.log("🔍 Pobieranie ogłoszenia:", id)
    setIsLoading(true)

    try {
      // Mock data - w prawdziwej aplikacji pobieranie z Appwrite
      const mockAnnouncements = {
        "1": {
          $id: "1",
          title: "Ważne: Zmiana godzin pracy biura",
          content: `# Zmiana godzin pracy biura

Szanowni Państwo,

Od przyszłego tygodnia (26 sierpnia 2025) wprowadzamy nowe godziny pracy biura głównego:

## Nowe godziny:
- **Poniedziałek - Piątek:** 8:00 - 16:00
- **Sobota:** 9:00 - 12:00 (tylko dla pilnych spraw)
- **Niedziela:** Nieczynne

## Powody zmiany:
1. Optymalizacja kosztów operacyjnych
2. Dostosowanie do godzin pracy większości klientów
3. Poprawa work-life balance dla pracowników

## Co to oznacza dla Państwa:
- Wszystkie spotkania należy umówić w nowych godzinach
- Recepcja będzie czynna od 8:00 do 16:00
- System telefoniczny będzie przekierowywać połączenia po godzinach na infolinię

## Kontakt w nagłych przypadkach:
W przypadku pilnych spraw poza godzinami pracy, prosimy o kontakt z dyżurnym pod numerem: **+48 123 456 789**

Dziękujemy za zrozumienie i przepraszamy za wszelkie niedogodności.

---
*Zarząd Firmy*`,
          excerpt: "Od przyszłego tygodnia biuro będzie czynne w godzinach 8:00-16:00.",
          author: "admin@example.com",
          authorName: "Administrator",
          status: "current" as const,
          category: "urgent" as const,
          priority: "high" as const,
          viewCount: 156,
          publishDate: new Date().toISOString(),
          expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          tags: ["biuro", "godziny", "ważne"],
          attachments: [
            {
              name: "Nowy_regulamin_pracy.pdf",
              url: "/docs/regulamin.pdf",
              size: 245760,
              type: "application/pdf"
            }
          ],
          $createdAt: new Date().toISOString(),
          $updatedAt: new Date().toISOString(),
        },
        "2": {
          $id: "2",
          title: "Spotkanie zespołu - Planowanie Q3",
          content: `# Spotkanie zespołu - Planowanie Q3

Zapraszamy wszystkich członków zespołu na ważne spotkanie dotyczące planowania działań na trzeci kwartał 2025 roku.

## Szczegóły spotkania:
- **Data:** Czwartek, 25 sierpnia 2025
- **Godzina:** 10:00 - 12:00
- **Miejsce:** Sala konferencyjna A (2 piętro)
- **Moderator:** Jan Kowalski

## Agenda:
1. **Podsumowanie Q2** (30 min)
   - Osiągnięte cele
   - Wyzwania i problemy
   - Kluczowe metryki

2. **Planowanie Q3** (60 min)  
   - Nowe cele i priorytety
   - Podział zadań między zespoły
   - Timeline projektów

3. **Q&A** (30 min)
   - Pytania i odpowiedzi
   - Feedback od zespołu

## Przygotowanie:
Każdy zespół powinien przygotować:
- Krótkie podsumowanie swoich osiągnięć z Q2
- Propozycje celów na Q3
- Lista potrzebnych zasobów

## Materiały:
Wszystkie materiały będą dostępne w systemie przed spotkaniem.

Do zobaczenia!`,
          excerpt: "Spotkanie zespołu w sali konferencyjnej A o 10:00 - planowanie Q3.",
          author: "manager@example.com",
          authorName: "Jan Kowalski",
          status: "current" as const,
          category: "meeting" as const,
          priority: "normal" as const,
          viewCount: 89,
          publishDate: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          tags: ["spotkanie", "planowanie", "Q3"],
          $createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          $updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        }
      }

      const mockAnnouncement = mockAnnouncements[id as keyof typeof mockAnnouncements]
      
      if (mockAnnouncement) {
        setAnnouncement(mockAnnouncement)
      } else {
        toast.error("Nie znaleziono ogłoszenia")
        router.push("/info")
      }
    } catch (error: any) {
      console.error("❌ Błąd podczas pobierania ogłoszenia:", error)
      toast.error("Nie udało się załadować ogłoszenia")
      router.push("/info")
    } finally {
      setIsLoading(false)
    }
  }

  const incrementViewCount = async (id: string) => {
    try {
      // W prawdziwej aplikacji - aktualizacja licznika w Appwrite
      console.log("👁️ Zwiększanie licznika wyświetleń dla:", id)
    } catch (error) {
      console.error("❌ Błąd podczas aktualizacji licznika:", error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pl-PL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'urgent': return <AlertCircle className="h-5 w-5" />
      case 'meeting': return <Users className="h-5 w-5" />
      case 'system': return <Building className="h-5 w-5" />
      case 'hr': return <User className="h-5 w-5" />
      case 'finance': return <Building className="h-5 w-5" />
      default: return <Info className="h-5 w-5" />
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100 dark:bg-red-900/30'
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30'
      case 'normal': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30'
      case 'low': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30'
      default: return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30'
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: announcement?.title,
        text: announcement?.excerpt,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success("Link skopiowany do schowka")
    }
  }

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked)
    toast.success(isBookmarked ? "Usunięto z zakładek" : "Dodano do zakładek")
  }

  if (isLoading) {
    return (
      <div className="py-6 px-2">
        <div className="w-full max-w-4xl mx-auto px-2">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
            <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!announcement) {
    return (
      <div className="py-6 px-2">
        <div className="w-full max-w-4xl mx-auto px-2 text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Ogłoszenie nie znalezione
          </h1>
          <Button onClick={() => router.push("/info")}>
            Powrót do listy ogłoszeń
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="py-6 px-2">
      <div className="w-full max-w-4xl mx-auto px-2">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push("/info")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Powrót
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Udostępnij
            </Button>
            <Button 
              variant={isBookmarked ? "default" : "outline"} 
              size="sm" 
              onClick={toggleBookmark}
            >
              <Bookmark className="h-4 w-4 mr-2" />
              {isBookmarked ? "Zapisane" : "Zapisz"}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Card className={`${announcement.status === 'current' 
          ? `border-2 ${announcement.priority === 'urgent' 
              ? 'border-red-500 bg-red-50 dark:bg-red-900/10' 
              : announcement.priority === 'high' 
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10'
                : 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
            } shadow-lg` 
          : 'border'
        }`}>
          <CardHeader>
            {/* Status & Category */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Badge 
                  variant={announcement.status === 'current' ? 'default' : 'secondary'}
                  className="flex items-center gap-1"
                >
                  {getCategoryIcon(announcement.category)}
                  {getCategoryLabel(announcement.category)}
                </Badge>
                
                <Badge 
                  variant="outline" 
                  className={getPriorityColor(announcement.priority)}
                >
                  {announcement.priority === 'urgent' ? 'Pilne' :
                   announcement.priority === 'high' ? 'Wysokie' :
                   announcement.priority === 'normal' ? 'Normalne' : 'Niskie'}
                </Badge>

                {announcement.status === 'current' && (
                  <div className="flex items-center gap-1 text-blue-600">
                    <Pin className="h-4 w-4" />
                    <span className="text-sm font-medium">Aktualne</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-slate-500">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{announcement.viewCount} wyświetleń</span>
                </div>
              </div>
            </div>

            {/* Title */}
            <CardTitle className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
              {announcement.title}
            </CardTitle>

            {/* Author & Date */}
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {announcement.authorName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    {announcement.authorName}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {announcement.author}
                  </div>
                </div>
              </div>

              <div className="text-right text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span>Opublikowano</span>
                </div>
                <div>{formatDate(announcement.publishDate)}</div>
              </div>
            </div>

            {/* Expiration Warning */}
            {announcement.status === 'current' && announcement.expirationDate && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Ogłoszenie ważne do: {formatDate(announcement.expirationDate)}
                  </span>
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent>
            <Separator className="mb-6" />

            {/* Content */}
            <div className="prose prose-slate dark:prose-invert max-w-none mb-8">
              <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed">
                {announcement.content.split('\n').map((paragraph, index) => {
                  // Simple markdown parsing for headers
                  if (paragraph.startsWith('# ')) {
                    return (
                      <h1 key={index} className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4 mt-6">
                        {paragraph.replace('# ', '')}
                      </h1>
                    )
                  } else if (paragraph.startsWith('## ')) {
                    return (
                      <h2 key={index} className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3 mt-5">
                        {paragraph.replace('## ', '')}
                      </h2>
                    )
                  } else if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                    return (
                      <p key={index} className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                        {paragraph.replace(/\*\*/g, '')}
                      </p>
                    )
                  } else if (paragraph.startsWith('---')) {
                    return <hr key={index} className="my-6 border-slate-200 dark:border-slate-700" />
                  } else if (paragraph.trim() === '') {
                    return <br key={index} />
                  } else {
                    return (
                      <p key={index} className="mb-3 leading-relaxed">
                        {paragraph}
                      </p>
                    )
                  }
                })}
              </div>
            </div>

            {/* Tags */}
            {announcement.tags.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Tagi</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {announcement.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Attachments */}
            {announcement.attachments && announcement.attachments.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Download className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Załączniki</span>
                </div>
                <div className="space-y-2">
                  {announcement.attachments.map((attachment, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded">
                          <Download className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-slate-100">
                            {attachment.name}
                          </div>
                          <div className="text-sm text-slate-500">
                            {formatFileSize(attachment.size)} • {attachment.type}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Pobierz
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator className="mb-6" />

            {/* Footer Actions */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Ostatnia aktualizacja: {formatDate(announcement.$updatedAt)}
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Udostępnij
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                  <Download className="h-4 w-4 mr-2" />
                  Drukuj
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

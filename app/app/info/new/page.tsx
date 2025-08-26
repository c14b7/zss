"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Client, Databases } from "appwrite"
import { 
  ArrowLeft,
  Save,
  Eye,
  Send,
  Calendar,
  Tag,
  Upload,
  X,
  Plus,
  AlertCircle,
  Info,
  Users,
  Building,
  User,
  Clock
} from "lucide-react"
import { toast } from "sonner"

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("687abe96000d2d31f914")

const databases = new Databases(client)

interface AnnouncementForm {
  title: string
  content: string
  excerpt: string
  category: 'general' | 'urgent' | 'meeting' | 'system' | 'hr' | 'finance'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'draft' | 'current' | 'scheduled'
  tags: string[]
  hasExpiration: boolean
  expirationDate: string
  publishDate: string
}

export default function NewAnnouncementPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isPreview, setIsPreview] = useState(false)
  const [newTag, setNewTag] = useState("")
  
  const [formData, setFormData] = useState<AnnouncementForm>({
    title: "",
    content: "",
    excerpt: "",
    category: "general",
    priority: "normal", 
    status: "current",
    tags: [],
    hasExpiration: false,
    expirationDate: "",
    publishDate: new Date().toISOString().slice(0, 16)
  })

  const updateField = (field: keyof AnnouncementForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      updateField('tags', [...formData.tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    updateField('tags', formData.tags.filter(tag => tag !== tagToRemove))
  }

  const generateExcerpt = () => {
    if (formData.content) {
      const plainText = formData.content.replace(/[#*`]/g, '').trim()
      const excerpt = plainText.length > 150 
        ? plainText.substring(0, 147) + '...'
        : plainText
      updateField('excerpt', excerpt)
      toast.success("Wygenerowano automatyczny opis")
    }
  }

  const saveDraft = async () => {
    if (!formData.title.trim()) {
      toast.error("Wprowadź tytuł ogłoszenia")
      return
    }

    setIsLoading(true)
    try {
      const announcementData = {
        ...formData,
        status: 'draft',
        author: 'current-user@example.com', // W prawdziwej aplikacji z kontekstu użytkownika
        authorName: 'Bieżący użytkownik',
        viewCount: 0,
        expirationDate: formData.hasExpiration ? formData.expirationDate : undefined
      }

      console.log("💾 Zapisywanie szkicu:", announcementData)
      
      // W prawdziwej aplikacji - zapis do Appwrite
      // await databases.createDocument("votes", "announcements", "unique()", announcementData)
      
      toast.success("Szkic został zapisany")
      router.push("/info")
    } catch (error: any) {
      console.error("❌ Błąd podczas zapisywania szkicu:", error)
      toast.error("Nie udało się zapisać szkicu")
    } finally {
      setIsLoading(false)
    }
  }

  const publishAnnouncement = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Wypełnij tytuł i treść ogłoszenia")
      return
    }

    setIsLoading(true)
    try {
      const announcementData = {
        ...formData,
        author: 'current-user@example.com',
        authorName: 'Bieżący użytkownik',
        viewCount: 0,
        expirationDate: formData.hasExpiration ? formData.expirationDate : undefined,
        excerpt: formData.excerpt || formData.content.substring(0, 150) + '...'
      }

      console.log("🚀 Publikowanie ogłoszenia:", announcementData)
      
      // W prawdziwej aplikacji - zapis do Appwrite
      // await databases.createDocument("votes", "announcements", "unique()", announcementData)
      
      toast.success("Ogłoszenie zostało opublikowane!")
      router.push("/info")
    } catch (error: any) {
      console.error("❌ Błąd podczas publikowania:", error)
      toast.error("Nie udało się opublikować ogłoszenia")
    } finally {
      setIsLoading(false)
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

  if (isPreview) {
    return (
      <div className="py-6 px-2">
        <div className="w-full max-w-4xl mx-auto px-2">
          {/* Preview Header */}
          <div className="mb-6 flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={() => setIsPreview(false)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Wróć do edycji
            </Button>
            
            <Badge variant="secondary" className="px-3 py-1">
              Podgląd
            </Badge>
          </div>

          {/* Preview Content */}
          <Card className={`${formData.status === 'current' 
            ? `border-2 ${formData.priority === 'urgent' 
                ? 'border-red-500 bg-red-50 dark:bg-red-900/10' 
                : formData.priority === 'high' 
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10'
                  : 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
              } shadow-lg` 
            : 'border'
          }`}>
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Badge className="flex items-center gap-1">
                    {getCategoryIcon(formData.category)}
                    {getCategoryLabel(formData.category)}
                  </Badge>
                  
                  <Badge variant="outline">
                    {formData.priority === 'urgent' ? 'Pilne' :
                     formData.priority === 'high' ? 'Wysokie' :
                     formData.priority === 'normal' ? 'Normalne' : 'Niskie'}
                  </Badge>
                </div>
              </div>

              <CardTitle className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
                {formData.title || "Tytuł ogłoszenia"}
              </CardTitle>

              <div className="pt-4 text-sm text-slate-500">
                <div>Autor: Bieżący użytkownik</div>
                <div>Data publikacji: {formatDate(formData.publishDate)}</div>
                {formData.hasExpiration && formData.expirationDate && (
                  <div>Wygasa: {formatDate(formData.expirationDate)}</div>
                )}
              </div>
            </CardHeader>

            <CardContent>
              <Separator className="mb-6" />
              
              <div className="prose prose-slate dark:prose-invert max-w-none mb-6">
                <div className="whitespace-pre-wrap leading-relaxed">
                  {formData.content || "Treść ogłoszenia..."}
                </div>
              </div>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="py-6 px-2">
      <div className="w-full max-w-4xl mx-auto px-2">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push("/info")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Anuluj
            </Button>
            
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Nowe ogłoszenie
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Utwórz nowe ogłoszenie dla zespołu
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsPreview(true)}>
              <Eye className="mr-2 h-4 w-4" />
              Podgląd
            </Button>
            <Button variant="outline" onClick={saveDraft} disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              Zapisz szkic
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <Card>
              <CardHeader>
                <CardTitle>Podstawowe informacje</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Tytuł ogłoszenia</Label>
                  <Input
                    id="title"
                    placeholder="Wprowadź tytuł ogłoszenia"
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Krótki opis (opcjonalnie)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="excerpt"
                      placeholder="Krótki opis wyświetlany na liście"
                      value={formData.excerpt}
                      onChange={(e) => updateField('excerpt', e.target.value)}
                    />
                    <Button type="button" variant="outline" onClick={generateExcerpt}>
                      Auto
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500">
                    Zostanie wygenerowany automatycznie z treści, jeśli pozostawisz puste
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Content */}
            <Card>
              <CardHeader>
                <CardTitle>Treść ogłoszenia</CardTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Możesz używać prostego formatowania markdown (# dla nagłówków, ** dla pogrubienia)
                </p>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Wprowadź treść ogłoszenia..."
                  value={formData.content}
                  onChange={(e) => updateField('content', e.target.value)}
                  rows={15}
                  required
                  className="resize-none"
                />
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tagi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Dodaj tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="flex items-center gap-1">
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            {/* Publication Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Ustawienia publikacji</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => updateField('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Szkic</SelectItem>
                      <SelectItem value="current">Opublikuj teraz</SelectItem>
                      <SelectItem value="scheduled">Zaplanuj publikację</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Data publikacji</Label>
                  <Input
                    type="datetime-local"
                    value={formData.publishDate}
                    onChange={(e) => updateField('publishDate', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Category & Priority */}
            <Card>
              <CardHeader>
                <CardTitle>Kategoria i priorytet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Kategoria</Label>
                  <Select value={formData.category} onValueChange={(value: any) => updateField('category', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">Ogólne</SelectItem>
                      <SelectItem value="urgent">Pilne</SelectItem>
                      <SelectItem value="meeting">Spotkania</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="hr">HR</SelectItem>
                      <SelectItem value="finance">Finanse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Priorytet</Label>
                  <Select value={formData.priority} onValueChange={(value: any) => updateField('priority', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Niski</SelectItem>
                      <SelectItem value="normal">Normalny</SelectItem>
                      <SelectItem value="high">Wysoki</SelectItem>
                      <SelectItem value="urgent">Pilny</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Expiration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Data wygaśnięcia
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.hasExpiration}
                    onCheckedChange={(checked) => updateField('hasExpiration', checked)}
                  />
                  <Label>Ustaw datę wygaśnięcia</Label>
                </div>

                {formData.hasExpiration && (
                  <div className="space-y-2">
                    <Label>Data wygaśnięcia</Label>
                    <Input
                      type="datetime-local"
                      value={formData.expirationDate}
                      onChange={(e) => updateField('expirationDate', e.target.value)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <Button
                  onClick={publishAnnouncement}
                  disabled={isLoading || !formData.title.trim() || !formData.content.trim()}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      {formData.status === 'scheduled' ? 'Planowanie...' : 'Publikowanie...'}
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      {formData.status === 'scheduled' ? 'Zaplanuj publikację' : 'Opublikuj ogłoszenie'}
                    </>
                  )}
                </Button>

                <Button variant="outline" onClick={saveDraft} disabled={isLoading} className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Zapisz jako szkic
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { SerializedEditorState } from "lexical"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  Megaphone
} from "lucide-react"
import { Editor } from "@/components/blocks/editor-00/editor"
import { AnnouncementService, type Announcement } from "@/lib/appwrite"

const initialEditorValue = {
  root: {
    children: [
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: "Wprowadź treść ogłoszenia...",
            type: "text",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "paragraph",
        version: 1,
      },
    ],
    direction: "ltr",
    format: "",
    indent: 0,
    type: "root",
    version: 1,
  },
} as unknown as SerializedEditorState

export default function InboxPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [editorState, setEditorState] = useState<SerializedEditorState>(initialEditorValue)
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    status: "draft" as "draft" | "published" | "archived",
    publishedBy: "Administrator",
    publishDate: new Date().toISOString().split('T')[0],
    expiryDate: "",
    category: "Ogólne"
  })

  useEffect(() => {
    loadAnnouncements()
  }, [])

  const loadAnnouncements = async () => {
    try {
      setLoading(true)
      const data = await AnnouncementService.getAll()
      setAnnouncements(data)
    } catch (error) {
      console.error('Error loading announcements:', error)
      toast.error('Błąd podczas ładowania ogłoszeń')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAnnouncement = async () => {
    try {
      // Konwertuj stan editora na tekst (można rozszerzyć o lepszą konwersję HTML)
      const content = JSON.stringify(editorState)
      
      const newAnnouncement = {
        ...formData,
        content,
        publishDate: formData.publishDate || new Date().toISOString().split('T')[0]
      }

      const result = await AnnouncementService.create(newAnnouncement)
      if (result) {
        toast.success('Ogłoszenie zostało utworzone')
        setIsCreateDialogOpen(false)
        resetForm()
        loadAnnouncements()
      } else {
        toast.error('Błąd podczas tworzenia ogłoszenia')
      }
    } catch (error) {
      console.error('Error creating announcement:', error)
      toast.error('Błąd podczas tworzenia ogłoszenia')
    }
  }

  const handleEditAnnouncement = async () => {
    if (!editingAnnouncement) return

    try {
      const content = JSON.stringify(editorState)
      
      const updatedAnnouncement = {
        ...formData,
        content
      }

      const result = await AnnouncementService.update(editingAnnouncement.$id, updatedAnnouncement)
      if (result) {
        toast.success('Ogłoszenie zostało zaktualizowane')
        setIsEditDialogOpen(false)
        setEditingAnnouncement(null)
        resetForm()
        loadAnnouncements()
      } else {
        toast.error('Błąd podczas aktualizacji ogłoszenia')
      }
    } catch (error) {
      console.error('Error updating announcement:', error)
      toast.error('Błąd podczas aktualizacji ogłoszenia')
    }
  }

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć to ogłoszenie?')) return

    try {
      const result = await AnnouncementService.delete(id)
      if (result) {
        toast.success('Ogłoszenie zostało usunięte')
        loadAnnouncements()
      } else {
        toast.error('Błąd podczas usuwania ogłoszenia')
      }
    } catch (error) {
      console.error('Error deleting announcement:', error)
      toast.error('Błąd podczas usuwania ogłoszenia')
    }
  }

  const openEditDialog = (announcement: Announcement) => {
    setEditingAnnouncement(announcement)
    setFormData({
      title: announcement.title,
      priority: announcement.priority,
      status: announcement.status,
      publishedBy: announcement.publishedBy,
      publishDate: announcement.publishDate,
      expiryDate: announcement.expiryDate || "",
      category: announcement.category
    })
    
    // Spróbuj załadować stan editora z content
    try {
      const editorContent = JSON.parse(announcement.content)
      setEditorState(editorContent)
    } catch {
      // Jeśli nie można sparsować, użyj domyślnego
      setEditorState({
        root: {
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: "normal",
                  style: "",
                  text: announcement.content || "",
                  type: "text",
                  version: 1,
                },
              ],
              direction: "ltr",
              format: "",
              indent: 0,
              type: "paragraph",
              version: 1,
            },
          ],
          direction: "ltr",
          format: "",
          indent: 0,
          type: "root",
          version: 1,
        },
      } as unknown as SerializedEditorState)
    }
    
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      title: "",
      priority: "medium",
      status: "draft",
      publishedBy: "Administrator",
      publishDate: new Date().toISOString().split('T')[0],
      expiryDate: "",
      category: "Ogólne"
    })
    setEditorState(initialEditorValue)
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case 'medium': return <Info className="h-4 w-4 text-blue-500" />
      case 'low': return <CheckCircle className="h-4 w-4 text-green-500" />
      default: return <Info className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-green-600 bg-green-50 border-green-200'
      case 'draft': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'archived': return 'text-gray-600 bg-gray-50 border-gray-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const publishedAnnouncements = announcements.filter(a => a.status === 'published')
  const draftAnnouncements = announcements.filter(a => a.status === 'draft')
  const archivedAnnouncements = announcements.filter(a => a.status === 'archived')

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        {/* Header */}
        <div className="px-4 lg:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Megaphone className="h-8 w-8 text-blue-500" />
                System Ogłoszeń
              </h1>
              <p className="text-muted-foreground">
                Zarządzaj ogłoszeniami dla mieszkańców gminy
              </p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nowe ogłoszenie
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Nowe ogłoszenie</DialogTitle>
                  <DialogDescription>
                    Utwórz nowe ogłoszenie dla mieszkańców gminy
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Tytuł ogłoszenia</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="Wprowadź tytuł ogłoszenia"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Kategoria</Label>
                      <Input
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        placeholder="np. Transport, Kultura, Ogólne"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priorytet</Label>
                      <Select value={formData.priority} onValueChange={(value: any) => setFormData({...formData, priority: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Niski</SelectItem>
                          <SelectItem value="medium">Średni</SelectItem>
                          <SelectItem value="high">Wysoki</SelectItem>
                          <SelectItem value="urgent">Pilny</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status} onValueChange={(value: any) => setFormData({...formData, status: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Szkic</SelectItem>
                          <SelectItem value="published">Opublikowane</SelectItem>
                          <SelectItem value="archived">Zarchiwizowane</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="publishDate">Data publikacji</Label>
                      <Input
                        id="publishDate"
                        type="date"
                        value={formData.publishDate}
                        onChange={(e) => setFormData({...formData, publishDate: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Treść ogłoszenia</Label>
                    <div className="border rounded-md p-4 min-h-[300px]">
                      <Editor
                        editorSerializedState={editorState}
                        onSerializedChange={(value) => setEditorState(value)}
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => {setIsCreateDialogOpen(false); resetForm();}}>
                    Anuluj
                  </Button>
                  <Button onClick={handleCreateAnnouncement}>
                    Utwórz ogłoszenie
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 lg:px-6">
          <Tabs defaultValue="published" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="published">
                Opublikowane ({publishedAnnouncements.length})
              </TabsTrigger>
              <TabsTrigger value="drafts">
                Szkice ({draftAnnouncements.length})
              </TabsTrigger>
              <TabsTrigger value="archived">
                Archiwum ({archivedAnnouncements.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="published" className="space-y-4">
              <div className="grid gap-4">
                {publishedAnnouncements.length > 0 ? (
                  publishedAnnouncements.map((announcement) => (
                    <Card key={announcement.$id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="flex items-center gap-2">
                              {getPriorityIcon(announcement.priority)}
                              {announcement.title}
                            </CardTitle>
                            <CardDescription>
                              {announcement.category} • Opublikowane {announcement.publishDate} • {announcement.publishedBy}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getPriorityColor(announcement.priority)}>
                              {announcement.priority === 'urgent' ? 'Pilne' :
                               announcement.priority === 'high' ? 'Wysokie' :
                               announcement.priority === 'medium' ? 'Średnie' : 'Niskie'}
                            </Badge>
                            <Badge variant="outline" className={getStatusColor(announcement.status)}>
                              {announcement.status === 'published' ? 'Opublikowane' :
                               announcement.status === 'draft' ? 'Szkic' : 'Archiwum'}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">
                            {announcement.expiryDate && `Wygasa: ${announcement.expiryDate}`}
                          </p>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEditDialog(announcement)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteAnnouncement(announcement.$id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Megaphone className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>Brak opublikowanych ogłoszeń</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="drafts" className="space-y-4">
              <div className="grid gap-4">
                {draftAnnouncements.length > 0 ? (
                  draftAnnouncements.map((announcement) => (
                    <Card key={announcement.$id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-yellow-500" />
                              {announcement.title}
                            </CardTitle>
                            <CardDescription>
                              {announcement.category} • Utworzony {announcement.publishDate} • {announcement.publishedBy}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getPriorityColor(announcement.priority)}>
                              {announcement.priority === 'urgent' ? 'Pilne' :
                               announcement.priority === 'high' ? 'Wysokie' :
                               announcement.priority === 'medium' ? 'Średnie' : 'Niskie'}
                            </Badge>
                            <Badge variant="outline" className={getStatusColor(announcement.status)}>
                              Szkic
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">
                            Wymaga publikacji
                          </p>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEditDialog(announcement)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteAnnouncement(announcement.$id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>Brak szkiców ogłoszeń</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="archived" className="space-y-4">
              <div className="grid gap-4">
                {archivedAnnouncements.length > 0 ? (
                  archivedAnnouncements.map((announcement) => (
                    <Card key={announcement.$id} className="opacity-75">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="flex items-center gap-2">
                              {getPriorityIcon(announcement.priority)}
                              {announcement.title}
                            </CardTitle>
                            <CardDescription>
                              {announcement.category} • Zarchiwizowane • {announcement.publishedBy}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getStatusColor(announcement.status)}>
                              Archiwum
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">
                            Zarchiwizowane ogłoszenie
                          </p>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleDeleteAnnouncement(announcement.$id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>Brak zarchiwizowanych ogłoszeń</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edytuj ogłoszenie</DialogTitle>
            <DialogDescription>
              Modyfikuj istniejące ogłoszenie
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Tytuł ogłoszenia</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Wprowadź tytuł ogłoszenia"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Kategoria</Label>
                <Input
                  id="edit-category"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  placeholder="np. Transport, Kultura, Ogólne"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-priority">Priorytet</Label>
                <Select value={formData.priority} onValueChange={(value: any) => setFormData({...formData, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Niski</SelectItem>
                    <SelectItem value="medium">Średni</SelectItem>
                    <SelectItem value="high">Wysoki</SelectItem>
                    <SelectItem value="urgent">Pilny</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Szkic</SelectItem>
                    <SelectItem value="published">Opublikowane</SelectItem>
                    <SelectItem value="archived">Zarchiwizowane</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-publishDate">Data publikacji</Label>
                <Input
                  id="edit-publishDate"
                  type="date"
                  value={formData.publishDate}
                  onChange={(e) => setFormData({...formData, publishDate: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Treść ogłoszenia</Label>
              <div className="border rounded-md p-4 min-h-[300px]">
                <Editor
                  editorSerializedState={editorState}
                  onSerializedChange={(value) => setEditorState(value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {setIsEditDialogOpen(false); setEditingAnnouncement(null); resetForm();}}>
              Anuluj
            </Button>
            <Button onClick={handleEditAnnouncement}>
              Zapisz zmiany
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

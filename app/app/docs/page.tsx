"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { Client, Databases, Storage, ID } from "appwrite"
import { 
  Plus, 
  FileText, 
  File, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  Share, 
  Upload, 
  Search,
  Filter,
  MoreHorizontal,
  FolderOpen,
  Users,
  Lock,
  Globe,
  Calendar,
  FileImage,
  FileVideo,
  FileArchive,
  FileCode
} from "lucide-react"

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("687abe96000d2d31f914")

const databases = new Databases(client)
const storage = new Storage(client)

interface Document {
  $id: string
  title: string
  type: 'text' | 'file'
  content?: string // For text documents
  fileId?: string // For uploaded files
  fileName?: string
  fileSize?: number
  mimeType?: string
  visibility: 'public' | 'private' | 'shared'
  sharedWith?: string[] // Array of user IDs/emails
  tags: string[]
  createdBy: string
  $createdAt: string
  $updatedAt: string
}

export default function DocumentsPage() {
  console.log("🏗️ Inicjalizacja komponentu DocumentsPage")
  
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("date")
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])

  // Mock current user - replace with actual auth
  const currentUser = "user@example.com"

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    console.log("🔍 Pobieranie dokumentów...")
    setIsLoading(true)

    try {
      const result = await databases.listDocuments(
        "votes", // databaseId
        "documents" // collectionId
      )

      console.log("✅ Pobrano dokumenty z bazy danych:", result)
      setDocuments(result.documents as unknown as Document[])

    } catch (error: any) {
      console.error("❌ Błąd podczas pobierania dokumentów:", error)
      toast.error("Nie udało się załadować dokumentów", { 
        description: error.message 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTextDocument = () => {
    console.log("📝 Tworzenie nowego dokumentu tekstowego")
    router.push("/docs/new")
  }

  const handleUploadFile = () => {
    console.log("📁 Upload pliku")
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files) {
        await uploadFiles(Array.from(files))
      }
    }
    input.click()
  }

  const uploadFiles = async (files: File[]) => {
    for (const file of files) {
      try {
        console.log("📤 Uploading file:", file.name)
        
        // Upload to Appwrite Storage
        const uploadedFile = await storage.createFile(
          "documents", // bucketId
          ID.unique(),
          file
        )

        // Create document record in database
        await databases.createDocument(
          "votes", // databaseId
          "documents", // collectionId
          ID.unique(),
          {
            title: file.name,
            type: 'file',
            fileId: uploadedFile.$id,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
            visibility: 'private',
            tags: [],
            createdBy: currentUser
          }
        )

        toast.success(`Plik ${file.name} został przesłany`)
      } catch (error: any) {
        console.error("❌ Błąd uploadu:", error)
        toast.error(`Nie udało się przesłać pliku ${file.name}`, { 
          description: error.message 
        })
      }
    }
    
    fetchDocuments() // Refresh list
  }

  const handleViewDocument = (doc: Document) => {
    if (doc.type === 'text') {
      router.push(`/docs/${doc.$id}`)
    } else {
      // For files, open in new tab or download
      if (doc.fileId) {
        const fileUrl = storage.getFileView("documents", doc.fileId)
        window.open(fileUrl, '_blank')
      }
    }
  }

  const handleEditDocument = (doc: Document) => {
    if (doc.type === 'text') {
      router.push(`/docs/${doc.$id}/edit`)
    } else {
      toast.info("Pliki można tylko przeglądać lub pobierać")
    }
  }

  const handleDownloadDocument = async (doc: Document) => {
    if (doc.type === 'file' && doc.fileId) {
      try {
        const fileUrl = storage.getFileDownload("documents", doc.fileId)
        const link = document.createElement('a')
        link.href = fileUrl
        link.download = doc.fileName || doc.title
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        toast.success(`Pobieranie ${doc.title}`)
      } catch (error: any) {
        toast.error("Nie udało się pobrać pliku", { description: error.message })
      }
    } else if (doc.type === 'text') {
      // Export text document
      router.push(`/docs/${doc.$id}/export`)
    }
  }

  const handleDeleteDocument = async (doc: Document) => {
    try {
      // Delete from storage if it's a file
      if (doc.type === 'file' && doc.fileId) {
        await storage.deleteFile("documents", doc.fileId)
      }
      
      // Delete from database
      await databases.deleteDocument(
        "votes", // databaseId
        "documents", // collectionId
        doc.$id
      )

      toast.success(`Dokument ${doc.title} został usunięty`)
      fetchDocuments()
    } catch (error: any) {
      console.error("❌ Błąd usuwania:", error)
      toast.error("Nie udało się usunąć dokumentu", { description: error.message })
    }
  }

  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return <File className="h-4 w-4" />
    
    if (mimeType.startsWith('image/')) return <FileImage className="h-4 w-4" />
    if (mimeType.startsWith('video/')) return <FileVideo className="h-4 w-4" />
    if (mimeType.includes('zip') || mimeType.includes('rar')) return <FileArchive className="h-4 w-4" />
    if (mimeType.includes('code') || mimeType.includes('javascript') || mimeType.includes('json')) return <FileCode className="h-4 w-4" />
    
    return <File className="h-4 w-4" />
  }

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Globe className="h-4 w-4 text-green-500" />
      case 'shared': return <Users className="h-4 w-4 text-blue-500" />
      case 'private': return <Lock className="h-4 w-4 text-red-500" />
      default: return <Lock className="h-4 w-4" />
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  // Filter documents based on search and filters
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesType = filterType === 'all' || 
                       (filterType === 'text' && doc.type === 'text') ||
                       (filterType === 'file' && doc.type === 'file') ||
                       (filterType === 'public' && doc.visibility === 'public') ||
                       (filterType === 'private' && doc.visibility === 'private') ||
                       (filterType === 'shared' && doc.visibility === 'shared')
    
    return matchesSearch && matchesType
  })

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
            <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Dokumenty
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Zarządzaj dokumentami organizacji ({filteredDocuments.length} dokumentów)
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={handleUploadFile}
            >
              <Upload className="mr-2 h-4 w-4" />
              Prześlij plik
            </Button>
            <Button 
              onClick={() => router.push("/docs/import")}
              variant="outline"
              className="border-purple-500 text-purple-600 hover:bg-purple-50 dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-950"
            >
              <Download className="mr-2 h-4 w-4" />
              Importuj
            </Button>
            <Button 
              onClick={handleCreateTextDocument}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nowy dokument
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Szukaj dokumentów..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie</SelectItem>
                  <SelectItem value="text">Dokumenty tekstowe</SelectItem>
                  <SelectItem value="file">Pliki</SelectItem>
                  <SelectItem value="public">Publiczne</SelectItem>
                  <SelectItem value="private">Prywatne</SelectItem>
                  <SelectItem value="shared">Udostępnione</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Data utworzenia</SelectItem>
                  <SelectItem value="name">Nazwa</SelectItem>
                  <SelectItem value="size">Rozmiar</SelectItem>
                  <SelectItem value="type">Typ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        {filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FolderOpen className="mx-auto h-16 w-16 text-slate-400 mb-4" />
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Brak dokumentów
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Nie ma jeszcze żadnych dokumentów. Utwórz pierwszy dokument lub prześlij plik.
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={handleCreateTextDocument}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nowy dokument
                </Button>
                <Button variant="outline" onClick={handleUploadFile}>
                  <Upload className="mr-2 h-4 w-4" />
                  Prześlij plik
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Nazwa</TableHead>
                  <TableHead className="w-[10%]">Typ</TableHead>
                  <TableHead className="w-[10%]">Widoczność</TableHead>
                  <TableHead className="w-[10%]">Rozmiar</TableHead>
                  <TableHead className="w-[15%]">Utworzono</TableHead>
                  <TableHead className="w-[15%] text-right">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((doc) => (
                  <TableRow key={doc.$id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {doc.type === 'text' ? (
                          <FileText className="h-4 w-4 text-blue-500" />
                        ) : (
                          getFileIcon(doc.mimeType)
                        )}
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">
                            {doc.title}
                          </p>
                          {doc.tags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {doc.tags.slice(0, 3).map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {doc.type === 'text' ? 'Tekstowy' : 'Plik'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getVisibilityIcon(doc.visibility)}
                        <span className="text-sm capitalize">{doc.visibility}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {doc.fileSize ? formatFileSize(doc.fileSize) : '-'}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                      {formatDate(doc.$createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDocument(doc)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Wyświetl
                          </DropdownMenuItem>
                          {doc.type === 'text' && (
                            <DropdownMenuItem onClick={() => handleEditDocument(doc)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edytuj
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleDownloadDocument(doc)}>
                            <Download className="mr-2 h-4 w-4" />
                            Pobierz
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/docs/${doc.$id}/share`)}>
                            <Share className="mr-2 h-4 w-4" />
                            Udostępnij
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem 
                                className="text-red-600 dark:text-red-400"
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Usuń
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Usuń dokument</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Czy na pewno chcesz usunąć dokument "{doc.title}"? 
                                  Tej operacji nie można cofnąć.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Anuluj</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteDocument(doc)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Usuń
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </div>
  )
}

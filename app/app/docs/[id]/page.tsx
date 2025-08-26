"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { SerializedEditorState } from "lexical"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Client, Databases, Storage } from "appwrite"
import { Editor } from "@/components/blocks/editor-x/editor"
import { documentExporter } from "@/lib/document-exporter"
import { ArrowLeft, Globe, Users, Lock, Share2, Download, Edit, FileText, Calendar, User, Tag, Trash2, FileDown } from "lucide-react"

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("687abe96000d2d31f914")

const databases = new Databases(client)

interface Document {
  $id: string
  title: string
  type: 'text' | 'file'
  content?: string
  visibility: 'public' | 'private' | 'shared'
  sharedWith?: string[]
  tags: string[]
  createdBy: string
  $createdAt: string
  $updatedAt: string
}

export default function DocumentDetailPage() {
  console.log("🏗️ Inicjalizacja komponentu DocumentDetailPage")
  
  const params = useParams()
  const router = useRouter()
  const [document, setDocument] = useState<Document | null>(null)
  const [editorContent, setEditorContent] = useState<SerializedEditorState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  const documentId = params.id as string
  const currentUser = "user@example.com" // Mock user

  useEffect(() => {
    const fetchDocument = async () => {
      if (!documentId) {
        console.error("❌ Brak ID dokumentu w parametrach")
        setError("Nieprawidłowy identyfikator dokumentu")
        setIsLoading(false)
        return
      }

      console.log("🔍 Pobieranie dokumentu o ID:", documentId)
      setIsLoading(true)
      setError(null)

      try {
        const result = await databases.getDocument(
          "votes", // databaseId
          "documents", // collectionId
          documentId
        )

        console.log("✅ Pobrano dokument z bazy danych:", result)

        const documentData = result as unknown as Document

        // Check permissions
        if (documentData.visibility === 'private' && documentData.createdBy !== currentUser) {
          setError("Nie masz uprawnień do przeglądania tego dokumentu")
          setIsLoading(false)
          return
        }

        if (documentData.visibility === 'shared' && 
            documentData.createdBy !== currentUser && 
            !documentData.sharedWith?.includes(currentUser)) {
          setError("Nie masz uprawnień do przeglądania tego dokumentu")
          setIsLoading(false)
          return
        }

        setDocument(documentData)

        // Parse editor content if it's a text document
        if (documentData.type === 'text' && documentData.content) {
          try {
            const parsedContent = JSON.parse(documentData.content) as SerializedEditorState
            console.log("📝 Sparsowana zawartość edytora:", parsedContent)
            setEditorContent(parsedContent)
          } catch (parseError) {
            console.error("❌ Błąd parsowania zawartości edytora:", parseError)
            // If parsing fails, create default structure with text
            setEditorContent({
              root: {
                children: [
                  {
                    children: [
                      {
                        detail: 0,
                        format: 0,
                        mode: "normal",
                        style: "",
                        text: documentData.content,
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
        }

      } catch (error: any) {
        console.error("❌ Błąd podczas pobierania dokumentu:", {
          error: error,
          message: error.message,
          code: error.code,
          type: error.type
        })
        
        if (error.code === 404) {
          setError("Dokument nie został znaleziony")
        } else {
          setError("Błąd podczas ładowania dokumentu")
        }
        toast.error("Nie udało się załadować dokumentu", { 
          description: error.message 
        })
      } finally {
        setIsLoading(false)
        console.log("🏁 Zakończono pobieranie dokumentu")
      }
    }

    fetchDocument()
  }, [documentId])

  const handleExport = async (format: 'txt' | 'html' | 'md' | 'json') => {
    if (!document || !editorContent) {
      toast.error("Brak danych do eksportu")
      return
    }

    if (document.type !== 'text') {
      toast.error("Można eksportować tylko dokumenty tekstowe")
      return
    }

    setIsExporting(true)

    try {
      console.log("📤 Eksport dokumentu w formacie:", format)
      
      await documentExporter.downloadDocument(editorContent, {
        format,
        title: document.title,
        filename: document.title.replace(/[^a-zA-Z0-9-_]/g, '_').toLowerCase()
      })

      toast.success(`Dokument został wyeksportowany jako ${format.toUpperCase()}`)
    } catch (error: any) {
      console.error("❌ Błąd eksportu:", error)
      toast.error("Błąd podczas eksportu dokumentu", { 
        description: error.message 
      })
    } finally {
      setIsExporting(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("pl-PL", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    } catch {
      return dateString
    }
  }

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Globe className="h-4 w-4 text-green-500" />
      case 'shared': return <Users className="h-4 w-4 text-blue-500" />
      case 'private': return <Lock className="h-4 w-4 text-red-500" />
      default: return <Lock className="h-4 w-4" />
    }
  }

  const getVisibilityText = (visibility: string) => {
    switch (visibility) {
      case 'public': return 'Publiczny'
      case 'shared': return 'Udostępniony'
      case 'private': return 'Prywatny'
      default: return visibility
    }
  }

  const canEdit = () => {
    return document?.createdBy === currentUser
  }

  const handleEdit = () => {
    if (canEdit()) {
      router.push(`/docs/${documentId}/edit`)
    }
  }

  const handleShare = () => {
    router.push(`/docs/${documentId}/share`)
  }



  if (isLoading) {
    return (
      <div className="py-6 px-2">
        <div className="w-full max-w-none mx-auto px-2">
          <Card className="w-full shadow-xl">
            <CardContent className="p-8">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4/6"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !document) {
    return (
      <div className="py-6 px-2">
        <div className="w-full max-w-none mx-auto px-2">
          <Card className="w-full shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="space-y-4">
                <FileText className="mx-auto h-16 w-16 text-slate-400" />
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  {error || "Dokument nie został znaleziony"}
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Sprawdź czy link jest poprawny lub czy masz uprawnienia do przeglądania tego dokumentu.
                </p>
                <Button 
                  onClick={() => router.push("/docs")}
                  className="mt-4"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Powrót do dokumentów
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="py-6 px-2">
      <div className="w-full max-w-none mx-auto px-2">
        {/* Header with back button */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Powrót
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Dokument
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                ID: {document.$id}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            {/* Export Button - tylko dla dokumentów tekstowych */}
            {document.type === 'text' && (
              <div className="relative group">
                <Button
                  variant="outline"
                  disabled={isExporting}
                  className="relative"
                >
                  {isExporting ? (
                    <>
                      <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-slate-400 border-t-transparent"></div>
                      Eksportowanie...
                    </>
                  ) : (
                    <>
                      <FileDown className="mr-2 h-4 w-4" />
                      Eksportuj
                    </>
                  )}
                </Button>
                
                {!isExporting && (
                  <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 min-w-[150px]">
                    <div className="p-2 space-y-1">
                      <button
                        onClick={() => handleExport('txt')}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 rounded flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        Tekst (.txt)
                      </button>
                      <button
                        onClick={() => handleExport('html')}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 rounded flex items-center gap-2"
                      >
                        <Globe className="h-4 w-4" />
                        HTML (.html)
                      </button>
                      <button
                        onClick={() => handleExport('md')}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 rounded flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        Markdown (.md)
                      </button>
                      <button
                        onClick={() => handleExport('json')}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 rounded flex items-center gap-2"
                      >
                        <FileDown className="h-4 w-4" />
                        JSON (.json)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Edit Button - tylko dla właściciela */}
            {document.createdBy === currentUser && (
              <Button 
                onClick={() => router.push(`/docs/${document.$id}/edit`)}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edytuj
              </Button>
            )}
          </div>
        </div>

        <Card className="w-full shadow-xl">
          <CardHeader className="pb-6">
            <div className="space-y-4">
              <CardTitle className="text-3xl font-bold text-slate-800 dark:text-slate-200">
                {document.title}
              </CardTitle>
              
              <div className="flex flex-wrap gap-4 items-center text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Utworzono: {formatDate(document.$createdAt)}</span>
                </div>
                {document.$updatedAt !== document.$createdAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Zaktualizowano: {formatDate(document.$updatedAt)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  {getVisibilityIcon(document.visibility)}
                  <span>{getVisibilityText(document.visibility)}</span>
                </div>
              </div>

              {/* Tags */}
              {document.tags.length > 0 && (
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <div className="flex flex-wrap gap-2">
                    {document.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Shared with */}
              {document.visibility === 'shared' && document.sharedWith && document.sharedWith.length > 0 && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Udostępniono: {document.sharedWith.join(', ')}
                  </span>
                </div>
              )}

              <div className="text-xs text-slate-500 dark:text-slate-400">
                <div>Autor: {document.createdBy}</div>
              </div>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="pt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                Treść dokumentu
              </h3>
              
              {editorContent ? (
                <div className="w-full prose prose-slate dark:prose-invert max-w-none prose-lg editor-content-readonly">
                  <Editor
                    editorSerializedState={editorContent}
                    onSerializedChange={() => {}} // Read-only - nie reagujemy na zmiany
                    readOnly={true}
                  />
                </div>
              ) : (
                <div className="w-full p-6">
                  <p className="text-slate-600 dark:text-slate-400">
                    Ładowanie zawartości...
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

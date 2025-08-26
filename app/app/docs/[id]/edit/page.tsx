"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { SerializedEditorState } from "lexical"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Client, Databases } from "appwrite"
import { Editor } from "@/components/blocks/editor-x/editor"
import { ArrowLeft, Globe, Users, Lock, Plus, X, Save } from "lucide-react"

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

export default function EditDocumentPage() {
  console.log("🏗️ Inicjalizacja komponentu EditDocumentPage")
  
  const params = useParams()
  const router = useRouter()
  const [document, setDocument] = useState<Document | null>(null)
  const [title, setTitle] = useState("")
  const [visibility, setVisibility] = useState<'public' | 'private' | 'shared'>('private')
  const [sharedWith, setSharedWith] = useState<string[]>([])
  const [newSharedUser, setNewSharedUser] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [content, setContent] = useState<SerializedEditorState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

      console.log("🔍 Pobieranie dokumentu do edycji o ID:", documentId)
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

        // Check permissions - only creator can edit
        if (documentData.createdBy !== currentUser) {
          setError("Nie masz uprawnień do edycji tego dokumentu")
          setIsLoading(false)
          return
        }

        if (documentData.type !== 'text') {
          setError("Można edytować tylko dokumenty tekstowe")
          setIsLoading(false)
          return
        }

        setDocument(documentData)
        setTitle(documentData.title)
        setVisibility(documentData.visibility)
        setSharedWith(documentData.sharedWith || [])
        setTags(documentData.tags || [])

        // Parse editor content
        if (documentData.content) {
          try {
            const parsedContent = JSON.parse(documentData.content) as SerializedEditorState
            console.log("📝 Sparsowana zawartość edytora:", parsedContent)
            setContent(parsedContent)
          } catch (parseError) {
            console.error("❌ Błąd parsowania zawartości edytora:", parseError)
            // Create default structure with text
            setContent({
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
        console.error("❌ Błąd podczas pobierania dokumentu:", error)
        
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
      }
    }

    fetchDocument()
  }, [documentId])

  const handleEditorChange = (value: SerializedEditorState) => {
    console.log("📝 Edytor - zmiana zawartości:", {
      timestamp: new Date().toISOString(),
      childrenCount: value.root.children.length,
    })
    setContent(value)
  }

  const addSharedUser = () => {
    if (newSharedUser.trim() && !sharedWith.includes(newSharedUser.trim())) {
      setSharedWith([...sharedWith, newSharedUser.trim()])
      setNewSharedUser("")
    }
  }

  const removeSharedUser = (userToRemove: string) => {
    setSharedWith(sharedWith.filter(user => user !== userToRemove))
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log("🚀 Rozpoczynam aktualizację dokumentu...")

    // Sprawdź czy edytor zawiera jakąś treść
    const hasContent = content && content.root.children.some((child: any) => 
      child.children && child.children.length > 0 && 
      child.children.some((grandChild: any) => grandChild.text && grandChild.text.trim())
    )

    if (!title.trim() || !hasContent) {
      toast.error("Wypełnij tytuł i treść dokumentu")
      return
    }

    if (visibility === 'shared' && sharedWith.length === 0) {
      toast.error("Określ z kim chcesz udostępnić dokument")
      return
    }

    setIsSaving(true)

    try {
      const documentData = {
        title,
        content: JSON.stringify(content),
        visibility,
        ...(visibility === 'shared' ? { sharedWith } : { sharedWith: [] }),
        tags,
      }

      console.log("📤 Aktualizacja dokumentu w Appwrite:", documentData)

      const result = await databases.updateDocument(
        "votes", // databaseId
        "documents", // collectionId
        documentId,
        documentData
      )

      console.log("✅ Dokument został zaktualizowany pomyślnie:", result)
      toast.success("Dokument został zaktualizowany!")

      setTimeout(() => {
        router.push(`/docs/${documentId}`)
      }, 1200)
    } catch (error: any) {
      console.error("❌ Błąd podczas aktualizacji dokumentu:", error)
      toast.error("Błąd aktualizacji dokumentu", { description: error.message })
    } finally {
      setIsSaving(false)
    }
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
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  {error || "Nie można edytować dokumentu"}
                </h2>
                <Button onClick={() => router.push("/docs")}>
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
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
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
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Edytuj dokument
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Edytuj dokument "{document.title}" (ID: {document.$id})
            </p>
          </div>
        </div>

        <Card className="w-full shadow-xl">
          <form onSubmit={handleSave}>
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl font-semibold text-slate-800 dark:text-slate-200">
                Edycja dokumentu
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-8">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="title" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Tytuł dokumentu
                  </Label>
                  <Input
                    id="title"
                    placeholder="Wpisz tytuł dokumentu"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    disabled={isSaving}
                    required
                    className="h-11 text-base border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Widoczność dokumentu
                  </Label>
                  <RadioGroup 
                    value={visibility} 
                    onValueChange={(value) => setVisibility(value as any)}
                    disabled={isSaving}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="private" id="private" />
                      <label htmlFor="private" className="flex items-center gap-2 cursor-pointer">
                        <Lock className="h-4 w-4 text-red-500" />
                        <span>Prywatny</span>
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="shared" id="shared" />
                      <label htmlFor="shared" className="flex items-center gap-2 cursor-pointer">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span>Udostępniony</span>
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="public" id="public" />
                      <label htmlFor="public" className="flex items-center gap-2 cursor-pointer">
                        <Globe className="h-4 w-4 text-green-500" />
                        <span>Publiczny</span>
                      </label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* Shared Users */}
              {visibility === 'shared' && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Udostępnij użytkownikom
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Wpisz email użytkownika"
                      value={newSharedUser}
                      onChange={e => setNewSharedUser(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addSharedUser())}
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" onClick={addSharedUser}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {sharedWith.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {sharedWith.map((user, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {user}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => removeSharedUser(user)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tags */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Tagi (opcjonalne)
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Dodaj tag"
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        {tag}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Content Editor */}
              <div className="space-y-4">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Treść dokumentu
                </Label>
                {content && (
                  <div className={`w-full min-h-[400px] rounded-lg border border-slate-300 dark:border-slate-600 overflow-hidden transition-all duration-200 ${
                    isSaving ? 'opacity-50 pointer-events-none' : 'hover:border-slate-400 dark:hover:border-slate-500'
                  }`}>
                    <Editor
                      editorSerializedState={content}
                      onSerializedChange={handleEditorChange}
                    />
                  </div>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex justify-between px-8 py-6">
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <span>Ostatnia aktualizacja: {new Date(document.$updatedAt).toLocaleString("pl-PL")}</span>
              </div>
              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push(`/docs/${documentId}`)}
                  disabled={isSaving}
                  className="px-6"
                >
                  Anuluj
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="px-8 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Zapisywanie...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Zapisz zmiany
                    </>
                  )}
                </Button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}

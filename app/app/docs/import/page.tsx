"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SerializedEditorState } from "lexical"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { Client, Databases } from "appwrite"
import { documentImporter } from "@/lib/document-importer"
import { Editor } from "@/components/blocks/editor-x/editor"
import { ArrowLeft, Globe, Users, Lock, Plus, X, Upload, FileText, AlertCircle } from "lucide-react"

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("687abe96000d2d31f914")

const databases = new Databases(client)

export default function ImportDocumentPage() {
  console.log("🏗️ Inicjalizacja komponentu ImportDocumentPage")
  
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [visibility, setVisibility] = useState<'public' | 'private' | 'shared'>('private')
  const [sharedWith, setSharedWith] = useState<string[]>([])
  const [newSharedUser, setNewSharedUser] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [content, setContent] = useState<SerializedEditorState | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importResult, setImportResult] = useState<any>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)

  const currentUser = "user@example.com" // Mock user

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    console.log("📁 Wybrano plik do importu:", file.name, file.type, file.size)

    // Validate file
    const validation = documentImporter.validateFile(file)
    if (!validation.valid) {
      setImportError(validation.error || "Nieprawidłowy plik")
      setSelectedFile(null)
      setImportResult(null)
      setContent(null)
      return
    }

    setSelectedFile(file)
    setImportError(null)
    setImportResult(null)
    setContent(null)
  }

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error("Wybierz plik do importu")
      return
    }

    setIsImporting(true)
    setImportError(null)

    try {
      console.log("📥 Rozpoczynam import pliku:", selectedFile.name)
      
      const importResult = await documentImporter.importFromFile(selectedFile)
      
      console.log("✅ Import zakończony pomyślnie:", importResult)
      
      setImportResult(importResult)
      setTitle(importResult.title || "")
      setContent(importResult.content)
      
      toast.success("Plik został pomyślnie zaimportowany!", {
        description: `Format: ${importResult.originalFormat}`
      })
    } catch (error: any) {
      console.error("❌ Błąd podczas importu:", error)
      setImportError(error.message)
      toast.error("Błąd podczas importu pliku", { 
        description: error.message 
      })
    } finally {
      setIsImporting(false)
    }
  }

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log("🚀 Rozpoczynam tworzenie dokumentu z importu...")

    // Sprawdź czy edytor zawiera jakąś treść
    if (!content) {
      toast.error("Najpierw zaimportuj plik")
      return
    }

    const hasContent = content.root.children.some((child: any) => 
      child.children && child.children.length > 0 && 
      child.children.some((grandChild: any) => grandChild.text && grandChild.text.trim())
    )

    if (!title.trim() || !hasContent) {
      toast.error("Wypełnij tytuł i upewnij się, że treść została zaimportowana")
      return
    }

    if (visibility === 'shared' && sharedWith.length === 0) {
      toast.error("Określ z kim chcesz udostępnić dokument")
      return
    }

    setIsCreating(true)

    try {
      const documentData = {
        title,
        type: 'text' as const,
        content: JSON.stringify(content),
        visibility,
        ...(visibility === 'shared' ? { sharedWith } : { sharedWith: [] }),
        tags,
        createdBy: currentUser,
      }

      console.log("📤 Tworzenie dokumentu w Appwrite:", documentData)

      const result = await databases.createDocument(
        "votes", // databaseId
        "documents", // collectionId
        "unique()", // documentId
        documentData
      )

      console.log("✅ Dokument został utworzony pomyślnie:", result)
      toast.success("Dokument został utworzony z importu!")

      setTimeout(() => {
        router.push(`/docs/${result.$id}`)
      }, 1200)
    } catch (error: any) {
      console.error("❌ Błąd podczas tworzenia dokumentu:", error)
      toast.error("Błąd tworzenia dokumentu", { description: error.message })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="py-6 px-2">
      <div className="w-full max-w-none mx-auto px-2">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push("/docs")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Powrót
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Importuj dokument
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Importuj dokument z pliku TXT, HTML, Markdown lub JSON
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Import Section */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Import pliku
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* File Selection */}
              <div className="space-y-3">
                <Label htmlFor="file" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Wybierz plik do importu
                </Label>
                <Input
                  id="file"
                  type="file"
                  accept=".txt,.html,.htm,.md,.markdown,.json"
                  onChange={handleFileSelect}
                  disabled={isImporting || isCreating}
                  className="h-11 text-base border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400"
                />
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Obsługiwane formaty: TXT, HTML, Markdown, JSON (maks. 10MB)
                </div>
              </div>

              {/* Error Display */}
              {importError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{importError}</AlertDescription>
                </Alert>
              )}

              {/* File Info */}
              {selectedFile && !importError && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-blue-500" />
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {selectedFile.name}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || 'Nieznany typ'}
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleImport}
                    disabled={isImporting || isCreating}
                    className="w-full mt-4"
                  >
                    {isImporting ? (
                      <>
                        <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Importowanie...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Importuj plik
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Import Result */}
              {importResult && (
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <div><strong>Import zakończony pomyślnie!</strong></div>
                      <div>Format źródłowy: <Badge variant="outline">{importResult.originalFormat}</Badge></div>
                      <div>Tytuł: <strong>{importResult.title || 'Bez tytułu'}</strong></div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Document Details Section */}
          <Card className="shadow-xl">
            <form onSubmit={handleCreate}>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                  Szczegóły dokumentu
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label htmlFor="title" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Tytuł dokumentu
                    </Label>
                    <Input
                      id="title"
                      placeholder="Wpisz tytuł dokumentu"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      disabled={isImporting || isCreating}
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
                      disabled={isImporting || isCreating}
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
              </CardContent>

              <CardFooter className="flex justify-between px-6 py-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push("/docs")}
                  disabled={isImporting || isCreating}
                  className="px-6"
                >
                  Anuluj
                </Button>
                <Button 
                  type="submit" 
                  disabled={!content || isImporting || isCreating}
                  className="px-8 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  {isCreating ? (
                    <>
                      <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Tworzenie...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Utwórz dokument
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* Preview Section */}
        {content && (
          <Card className="mt-8 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                Podgląd zaimportowanej treści
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className={`w-full min-h-[300px] rounded-lg border border-slate-300 dark:border-slate-600 overflow-hidden ${
                isImporting || isCreating ? 'opacity-50 pointer-events-none' : ''
              }`}>
                <Editor
                  editorSerializedState={content}
                  onSerializedChange={handleEditorChange}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

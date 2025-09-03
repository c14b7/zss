"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SerializedEditorState } from "lexical"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Client, Databases, ID } from "appwrite"
import { Editor } from "@/components/blocks/editor-x/editor"
import { ArrowLeft, Plus, X } from "lucide-react"

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("687abe96000d2d31f914")

const databases = new Databases(client)

export default function NewDocumentPage() {
  console.log("🏗️ Inicjalizacja komponentu NewDocumentPage")
  
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [visibility] = useState<'public'>('public')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [content, setContent] = useState<SerializedEditorState>({
    root: {
      children: [
        {
          children: [],
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
  const [isLoading, setIsLoading] = useState(false)

  // Mock current user - replace with actual auth
  const currentUser = "user@example.com"

  const handleEditorChange = (value: SerializedEditorState) => {
    console.log("📝 Edytor - zmiana zawartości:", {
      timestamp: new Date().toISOString(),
      childrenCount: value.root.children.length,
    })
    setContent(value)
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
    
    console.log("🚀 Rozpoczynam zapisywanie dokumentu...")
    console.log("📝 Dane dokumentu:", {
      title: title.trim(),
      visibility,
      tags,
      contentStructure: content
    })

    // Sprawdź czy edytor zawiera jakąś treść
    const hasContent = content.root.children.some((child: any) => 
      child.children && child.children.length > 0 && 
      child.children.some((grandChild: any) => grandChild.text && grandChild.text.trim())
    )

    if (!title.trim() || !hasContent) {
      console.warn("⚠️ Walidacja nie powiodła się:", {
        titleValid: !!title.trim(),
        contentValid: hasContent
      })
      toast.error("Wypełnij tytuł i treść dokumentu")
      return
    }

    setIsLoading(true)
    console.log("💾 Rozpoczynam zapis do bazy danych...")

    try {
      const documentData = {
        title,
        type: 'text',
        content: JSON.stringify(content),
        visibility,
        tags,
        createdBy: currentUser,
      }

      console.log("📤 Wysyłam dane do Appwrite:", documentData)

      const result = await databases.createDocument(
        "votes", // databaseId
        "documents", // collectionId
        ID.unique(),
        documentData
      )

      console.log("✅ Dokument został zapisany pomyślnie:", result)
      toast.success("Dokument został utworzony!")

      setTimeout(() => {
        console.log("🔄 Przekierowanie do /docs")
        router.push("/docs")
      }, 1200)
    } catch (error: any) {
      console.error("❌ Błąd podczas zapisu dokumentu:", {
        error: error,
        message: error.message,
        code: error.code,
        type: error.type,
        stack: error.stack
      })
      toast.error("Błąd zapisu dokumentu", { description: error.message })
    } finally {
      setIsLoading(false)
      console.log("🏁 Zakończono proces zapisywania")
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
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Powrót
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Nowy dokument
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Utwórz nowy dokument tekstowy używając zaawansowanego edytora
            </p>
          </div>
        </div>

        <Card className="w-full shadow-xl">
          <form onSubmit={handleSave}>
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl font-semibold text-slate-800 dark:text-slate-200">
                Szczegóły dokumentu
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
                    disabled={isLoading}
                    required
                    className="h-11 text-base border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400"
                  />
                </div>
              </div>

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
                <div className={`w-full min-h-[400px] rounded-lg border border-slate-300 dark:border-slate-600 overflow-hidden transition-all duration-200 ${
                  isLoading ? 'opacity-50 pointer-events-none' : 'hover:border-slate-400 dark:hover:border-slate-500'
                }`}>
                  <Editor
                    editorSerializedState={content}
                    onSerializedChange={handleEditorChange}
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Użyj zaawansowanego edytora do formatowania treści dokumentu. 
                  Możesz dodawać nagłówki, listy, linki, obrazy i inne elementy.
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between px-8 py-6">
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Wszystkie wymagane pola muszą być wypełnione
              </div>
              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.back()}
                  disabled={isLoading}
                  className="px-6"
                >
                  Anuluj
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="px-8 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Zapisywanie...
                    </>
                  ) : (
                    "Utwórz dokument"
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

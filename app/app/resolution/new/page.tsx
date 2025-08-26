"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SerializedEditorState } from "lexical"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Client, Databases, ID } from "appwrite"
import { Editor } from "@/components/blocks/editor-x/editor"

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("687abe96000d2d31f914")

const databases = new Databases(client)

export default function NewResolutionPage() {
  console.log("🏗️ Inicjalizacja komponentu NewResolutionPage")
  
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [publishDate, setPublishDate] = useState("")
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

  // Debugowanie zmian w edytorze
  const handleEditorChange = (value: SerializedEditorState) => {
    console.log("📝 Edytor - zmiana zawartości:", {
      timestamp: new Date().toISOString(),
      childrenCount: value.root.children.length,
      structure: value.root.children.map((child: any) => ({
        type: child.type,
        hasChildren: !!child.children && child.children.length > 0,
        textPreview: child.children?.map((gc: any) => gc.text).join(" ").substring(0, 50) || ""
      }))
    })
    setContent(value)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log("🚀 Rozpoczynam zapisywanie uchwały...")
    console.log("📝 Dane formularza:", {
      title: title.trim(),
      category: category.trim(),
      publishDate: publishDate.trim(),
      contentStructure: content
    })
    
    // Sprawdź czy edytor zawiera jakąś treść
    const hasContent = content.root.children.some((child: any) => 
      child.children && child.children.length > 0 && 
      child.children.some((grandChild: any) => grandChild.text && grandChild.text.trim())
    )
    
    console.log("🔍 Walidacja zawartości edytora:", {
      hasContent,
      childrenCount: content.root.children.length,
      contentPreview: content.root.children.map((child: any) => ({
        type: child.type,
        childrenCount: child.children?.length || 0,
        textContent: child.children?.map((gc: any) => gc.text).join(" ") || ""
      }))
    })
    
    if (!title.trim() || !category.trim() || !publishDate.trim() || !hasContent) {
      console.warn("⚠️ Walidacja nie powiodła się:", {
        titleValid: !!title.trim(),
        categoryValid: !!category.trim(),
        publishDateValid: !!publishDate.trim(),
        contentValid: hasContent
      })
      toast.error("Wypełnij wszystkie pola")
      return
    }
    
    setIsLoading(true)
    console.log("💾 Rozpoczynam zapis do bazy danych...")
    
    try {
      const documentData = {
        title,
        category,
        publishDate,
        content: JSON.stringify(content),
      }
      
      console.log("📤 Wysyłam dane do Appwrite:", documentData)
      
      const result = await databases.createDocument(
        "votes", // databaseId
        "resolution", // collectionId
        ID.unique(),
        documentData
      )
      
      console.log("✅ Uchwała została zapisana pomyślnie:", result)
      toast.success("Uchwała została zapisana!")
      
      setTimeout(() => {
        console.log("🔄 Przekierowanie do /resolution")
        router.push("/resolution")
      }, 1200)
    } catch (error: any) {
      console.error("❌ Błąd podczas zapisu uchwały:", {
        error: error,
        message: error.message,
        code: error.code,
        type: error.type,
        stack: error.stack
      })
      toast.error("Błąd zapisu uchwały", { description: error.message })
    } finally {
      setIsLoading(false)
      console.log("🏁 Zakończono proces zapisywania")
    }
  }

  return (
    <div className="py-6 px-2 min-h-screen bg-white dark:bg-slate-900">
      <div className="w-full max-w-none mx-auto px-2">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Nowa uchwała
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Utwórz nową uchwałę używając zaawansowanego edytora tekstu
          </p>
        </div>
        
        <Card className="w-full shadow-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <form onSubmit={handleSave}>
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl font-semibold text-slate-800 dark:text-slate-200">
                Szczegóły uchwały
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="title" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Tytuł uchwały
                  </Label>
                  <Input
                    id="title"
                    placeholder="Wpisz tytuł uchwały"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    disabled={isLoading}
                    required
                    className="h-11 text-base border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="publishDate" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Data publikacji
                  </Label>
                  <Input
                    id="publishDate"
                    type="date"
                    value={publishDate}
                    onChange={e => setPublishDate(e.target.value)}
                    disabled={isLoading}
                    required
                    className="h-11 text-base border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="category" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Kategoria
                </Label>
                <Input
                  id="category"
                  placeholder="np. Finanse, Organizacja, Zarządzanie"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  disabled={isLoading}
                  required
                  className="h-11 text-base border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400"
                />
              </div>
              <div className="space-y-4">
                <Label htmlFor="content" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Treść uchwały
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
                  Użyj zaawansowanego edytora do formatowania treści uchwały. Możesz dodawać nagłówki, listy, linki i inne elementy.
                </p>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between px-8 py-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Wszystkie pola są wymagane
              </div>
              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.back()}
                  disabled={isLoading}
                  className="px-6 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Anuluj
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="px-8 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Zapisywanie...
                    </>
                  ) : (
                    "Zapisz uchwałę"
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
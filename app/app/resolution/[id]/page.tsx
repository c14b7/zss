"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { SerializedEditorState } from "lexical"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Client, Databases } from "appwrite"
import { Editor } from "@/components/blocks/editor-x/editor"
import { ArrowLeft, Calendar, Tag, FileText } from "lucide-react"

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("687abe96000d2d31f914")

const databases = new Databases(client)

interface Resolution {
  $id: string
  title: string
  category: string
  publishDate: string
  content: string
  $createdAt: string
  $updatedAt: string
}

export default function ResolutionDetailPage() {
  console.log("🏗️ Inicjalizacja komponentu ResolutionDetailPage")
  
  const params = useParams()
  const router = useRouter()
  const [resolution, setResolution] = useState<Resolution | null>(null)
  const [editorContent, setEditorContent] = useState<SerializedEditorState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const resolutionId = params.id as string

  useEffect(() => {
    const fetchResolution = async () => {
      if (!resolutionId) {
        console.error("❌ Brak ID uchwały w parametrach")
        setError("Nieprawidłowy identyfikator uchwały")
        setIsLoading(false)
        return
      }

      console.log("🔍 Pobieranie uchwały o ID:", resolutionId)
      setIsLoading(true)
      setError(null)

      try {
        const result = await databases.getDocument(
          "votes", // databaseId
          "resolution", // collectionId
          resolutionId
        )

        console.log("✅ Pobrano uchwałę z bazy danych:", result)

        const resolutionData = result as unknown as Resolution
        setResolution(resolutionData)

        // Parsuj zawartość edytora z JSON
        try {
          const parsedContent = JSON.parse(resolutionData.content) as SerializedEditorState
          console.log("📝 Sparsowana zawartość edytora:", parsedContent)
          setEditorContent(parsedContent)
        } catch (parseError) {
          console.error("❌ Błąd parsowania zawartości edytora:", parseError)
          // Jeśli parsowanie się nie powiedzie, utwórz domyślną strukturę z tekstem
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
                      text: resolutionData.content,
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

      } catch (error: any) {
        console.error("❌ Błąd podczas pobierania uchwały:", {
          error: error,
          message: error.message,
          code: error.code,
          type: error.type
        })
        
        if (error.code === 404) {
          setError("Uchwała nie została znaleziona")
        } else {
          setError("Błąd podczas ładowania uchwały")
        }
        toast.error("Nie udało się załadować uchwały", { 
          description: error.message 
        })
      } finally {
        setIsLoading(false)
        console.log("🏁 Zakończono pobieranie uchwały")
      }
    }

    fetchResolution()
  }, [resolutionId])

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("pl-PL", {
        year: "numeric",
        month: "long",
        day: "numeric"
      })
    } catch {
      return dateString
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
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4/6"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !resolution) {
    return (
      <div className="py-6 px-2">
        <div className="w-full max-w-none mx-auto px-2">
          <Card className="w-full shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="space-y-4">
                <FileText className="mx-auto h-16 w-16 text-slate-400" />
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  {error || "Uchwała nie została znaleziona"}
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Sprawdź czy link jest poprawny lub spróbuj ponownie później.
                </p>
                <Button 
                  onClick={() => router.push("/resolution")}
                  className="mt-4"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Powrót do listy uchwał
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="py-6 px-2 min-h-screen bg-white dark:bg-slate-900">
      <div className="w-full max-w-none mx-auto px-2">
        {/* Nagłówek z przyciskiem powrotu */}
        <div className="mb-6 flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Powrót
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Szczegóły uchwały
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              ID: {resolution.$id}
            </p>
          </div>
        </div>

        <Card className="w-full shadow-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <CardHeader className="pb-6">
            <div className="space-y-4">
              <CardTitle className="text-3xl font-bold text-slate-800 dark:text-slate-200">
                {resolution.title}
              </CardTitle>
              
              <div className="flex flex-wrap gap-4 items-center text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Data publikacji: {formatDate(resolution.publishDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <Badge variant="secondary" className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {resolution.category}
                  </Badge>
                </div>
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <div>Utworzono: {formatDate(resolution.$createdAt)}</div>
                {resolution.$updatedAt !== resolution.$createdAt && (
                  <div>Zaktualizowano: {formatDate(resolution.$updatedAt)}</div>
                )}
              </div>
            </div>
          </CardHeader>

          <Separator className="bg-slate-200 dark:bg-slate-700" />

          <CardContent className="pt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                Treść uchwały
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

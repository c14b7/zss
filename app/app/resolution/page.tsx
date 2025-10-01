"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { Client, Databases } from "appwrite"
import { Plus, Calendar, Tag, FileText, Eye, Grid3X3, List, LayoutGrid } from "lucide-react"

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

export default function ResolutionListPage() {
  console.log("🏗️ Inicjalizacja komponentu ResolutionListPage")
  
  const router = useRouter()
  const [resolutions, setResolutions] = useState<Resolution[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')

  useEffect(() => {
    const fetchResolutions = async () => {
      console.log("🔍 Pobieranie listy uchwał...")
      setIsLoading(true)

      try {
        const result = await databases.listDocuments(
          "votes", // databaseId
          "resolution" // collectionId
        )

        console.log("✅ Pobrano listę uchwał z bazy danych:", result)
        setResolutions(result.documents as unknown as Resolution[])

      } catch (error: any) {
        console.error("❌ Błąd podczas pobierania uchwał:", {
          error: error,
          message: error.message,
          code: error.code,
          type: error.type
        })
        
        toast.error("Nie udało się załadować uchwał", { 
          description: error.message 
        })
      } finally {
        setIsLoading(false)
        console.log("🏁 Zakończono pobieranie uchwał")
      }
    }

    fetchResolutions()
  }, [])

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

  const handleViewResolution = (id: string) => {
    console.log("👁️ Przechodzenie do szczegółów uchwały:", id)
    router.push(`/resolution/${id}`)
  }

  const handleNewResolution = () => {
    console.log("➕ Przechodzenie do tworzenia nowej uchwały")
    router.push("/resolution/new")
  }

  if (isLoading) {
    return (
      <div className="py-6 px-2">
        <div className="w-full max-w-7xl mx-auto px-2 sm:px-4">
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Uchwały
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                Ładowanie uchwał...
              </p>
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-4 sm:py-6 px-2 min-h-screen bg-white dark:bg-slate-900">
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Uchwały
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Zarządzaj uchwałami organizacji ({resolutions.length} uchwał)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 px-3 text-slate-700 dark:text-slate-300"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8 px-3 text-slate-700 dark:text-slate-300"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              onClick={handleNewResolution}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nowa uchwała
            </Button>
          </div>
        </div>

        {resolutions.length === 0 ? (
          <Card className="w-full shadow-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <CardContent className="p-12 text-center">
              <FileText className="mx-auto h-16 w-16 text-slate-400 dark:text-slate-500 mb-4" />
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Brak uchwał
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Nie ma jeszcze żadnych uchwał. Utwórz pierwszą uchwałę.
              </p>
              <Button 
                onClick={handleNewResolution}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                <Plus className="mr-2 h-4 w-4" />
                Utwórz pierwszą uchwałę
              </Button>
            </CardContent>
          </Card>
        ) : viewMode === 'list' ? (
          <Card className="w-full shadow-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200 dark:border-slate-700">
                  <TableHead className="w-[40%] text-slate-700 dark:text-slate-300">Tytuł</TableHead>
                  <TableHead className="w-[15%] text-slate-700 dark:text-slate-300">Kategoria</TableHead>
                  <TableHead className="w-[15%] text-slate-700 dark:text-slate-300">Data publikacji</TableHead>
                  <TableHead className="w-[15%] text-slate-700 dark:text-slate-300">Utworzono</TableHead>
                  <TableHead className="w-[15%] text-right text-slate-700 dark:text-slate-300">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resolutions.map((resolution) => (
                  <TableRow key={resolution.$id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                    <TableCell className="font-medium">
                      <div className="max-w-md">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">
                          {resolution.title}
                        </h3>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {resolution.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                      {formatDate(resolution.publishDate)}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                      {formatDate(resolution.$createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewResolution(resolution.$id)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Zobacz
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {resolutions.map((resolution) => (
              <Card key={resolution.$id} className="hover:shadow-lg transition-shadow duration-200 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">
                    {resolution.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(resolution.publishDate)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    <Badge variant="secondary" className="text-xs">
                      {resolution.category}
                    </Badge>
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Utworzono: {formatDate(resolution.$createdAt)}
                  </div>

                  <div className="pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleViewResolution(resolution.$id)}
                      className="w-full"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Zobacz szczegóły
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

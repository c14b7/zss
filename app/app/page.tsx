"use client";

import { useEffect, useState } from "react"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { BudgetOverviewChart } from "@/components/charts/budget-overview-chart"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { CalendarDays, TriangleAlert, CheckCircle, Clock, Plus } from "lucide-react"
import { ProjectService, UrgentIssueService, DashboardService, BudgetTransactionService, AnnouncementService, type Project, type UrgentIssue, type DashboardStats, type BudgetTransaction, type Announcement } from "@/lib/appwrite"
import Link from "next/link"

export default function Page() {
  const [projects, setProjects] = useState<Project[]>([])
  const [urgentIssues, setUrgentIssues] = useState<UrgentIssue[]>([])
  const [budgetTransactions, setBudgetTransactions] = useState<BudgetTransaction[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false)
  
  // Form state for new project
  const [projectForm, setProjectForm] = useState({
    header: "",
    type: "",
    status: "Planowane",
    target: "",
    limit: "",
    reviewer: ""
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [projectsData, urgentIssuesData, budgetTransactionsData, announcementsData, statsData] = await Promise.all([
          ProjectService.getAll(),
          UrgentIssueService.getByPriority('critical'),
          BudgetTransactionService.getAll(),
          AnnouncementService.getPublished(),
          DashboardService.getDashboardStats()
        ])
        
        setProjects(projectsData)
        setUrgentIssues(urgentIssuesData.slice(0, 2)) // Pokaż tylko 2 najważniejsze
        setBudgetTransactions(budgetTransactionsData)
        setAnnouncements(announcementsData.slice(0, 2)) // Pokaż tylko 2 najnowsze
        setStats(statsData)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await ProjectService.create(projectForm as any)
      toast.success('Projekt został utworzony pomyślnie')
      setIsCreateProjectOpen(false)
      setProjectForm({
        header: "",
        type: "",
        status: "Planowane",
        target: "",
        limit: "",
        reviewer: ""
      })
      // Odśwież dane
      const projectsData = await ProjectService.getAll()
      setProjects(projectsData)
    } catch (error) {
      console.error('Error creating project:', error)
      toast.error('Błąd podczas tworzenia projektu')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Ładowanie danych...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Header */}
          <div className="px-4 lg:px-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                  
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="px-3 py-1">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {new Date().toLocaleDateString('pl-PL')}
                </Badge>
              </div>
            </div>
          </div>

          {/* Karty główne */}
          <SectionCards stats={stats} />
          
          {/* Wykres */}
          <div className="px-4 lg:px-6">
            <BudgetOverviewChart transactions={budgetTransactions} />
          </div>

          {/* Sekcja pilnych spraw */}
          <div className="px-4 lg:px-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <TriangleAlert className="h-5 w-5 text-red-500" />
                      Pilne sprawy
                    </CardTitle>
                    <CardDescription>
                      Sprawy wymagające natychmiastowej uwagi
                    </CardDescription>
                  </div>
                  <Link href="/urgent">
                    <Button variant="outline" size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Zobacz wszystkie
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent className="space-y-3">
                  {urgentIssues.length > 0 ? (
                    urgentIssues.map((issue) => (
                      <div key={issue.$id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{issue.title}</p>
                          <p className="text-sm text-muted-foreground">Zgłoszenie #{issue.reportNumber}</p>
                        </div>
                        <Badge variant={issue.priority === 'critical' ? 'destructive' : 'default'}>
                          {issue.priority === 'critical' ? 'Krytyczne' : 
                           issue.priority === 'high' ? 'Wysokie' :
                           issue.priority === 'medium' ? 'Średnie' : 'Niskie'}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <TriangleAlert className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p>Brak pilnych spraw</p>
                      <Link href="/urgent">
                        <Button variant="outline" className="mt-2">
                          <Plus className="mr-2 h-4 w-4" />
                          Dodaj sprawę
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-500" />
                    Ogłoszenia
                  </CardTitle>
                  <CardDescription>
                    Najnowsze ogłoszenia
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {announcements.length > 0 ? (
                    announcements.map((announcement) => (
                      <div key={announcement.$id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{announcement.title}</p>
                          <p className="text-sm text-muted-foreground">Opublikowane {announcement.publishDate}</p>
                        </div>
                        <Badge variant="outline" className={
                          announcement.priority === 'urgent' ? 'text-red-600' :
                          announcement.priority === 'high' ? 'text-orange-600' :
                          announcement.priority === 'medium' ? 'text-blue-600' : 'text-green-600'
                        }>
                          {announcement.priority === 'urgent' ? 'Pilne' :
                           announcement.priority === 'high' ? 'Wysokie' :
                           announcement.priority === 'medium' ? 'Średnie' : 'Niskie'}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Brak nowych ogłoszeń</p>
                        <p className="text-sm text-muted-foreground">Wszystkie ogłoszenia są aktualne</p>
                      </div>
                      <Badge variant="outline" className="text-gray-600">Brak</Badge>
                    </div>
                  )}
                  <div className="text-center py-4">
                    <Link href="/inbox">
                      <Button variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Zobacz wszystkie ogłoszenia
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Tabela projektów */}
          <div className="px-4 lg:px-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Bieżące projekty
                  </CardTitle>
                  <CardDescription>
                    Przegląd wszystkich aktywnych projektów i inicjatyw ({projects.length} projektów)
                  </CardDescription>
                </div>
                <Dialog open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Nowy projekt
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <form onSubmit={handleCreateProject}>
                      <DialogHeader>
                        <DialogTitle>Nowy projekt</DialogTitle>
                        <DialogDescription>
                          Dodaj nowy projekt do systemu zarządzania
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="header">Nazwa projektu</Label>
                          <Input
                            id="header"
                            value={projectForm.header}
                            onChange={(e) => setProjectForm({...projectForm, header: e.target.value})}
                            placeholder="np. Modernizacja parku miejskiego"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="type">Typ projektu</Label>
                            <Select value={projectForm.type} onValueChange={(value) => setProjectForm({...projectForm, type: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Wybierz typ" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Finansowy">Finansowy</SelectItem>
                                <SelectItem value="Infrastruktura">Infrastruktura</SelectItem>
                                <SelectItem value="Społeczny">Społeczny</SelectItem>
                                <SelectItem value="Rekreacja">Rekreacja</SelectItem>
                                <SelectItem value="Technologia">Technologia</SelectItem>
                                <SelectItem value="Klasowe">Klasowe</SelectItem>
                                <SelectItem value="Nauczycielskie">Nauczycielskie</SelectItem>
                                <SelectItem value="Inne">Inne</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={projectForm.status} onValueChange={(value) => setProjectForm({...projectForm, status: value})}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Planowane">Planowane</SelectItem>
                                <SelectItem value="W trakcie">W trakcie</SelectItem>
                                <SelectItem value="Realizowane">Realizowane</SelectItem>
                                <SelectItem value="Przyjęty">Przyjęty</SelectItem>
                                <SelectItem value="Zakończony">Zakończony</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="target">Data docelowa</Label>
                            <Input
                              id="target"
                              type="date"
                              value={projectForm.target}
                              onChange={(e) => setProjectForm({...projectForm, target: e.target.value})}
                              required
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="limit">Budżet/Limit</Label>
                            <Input
                              id="limit"
                              value={projectForm.limit}
                              onChange={(e) => setProjectForm({...projectForm, limit: e.target.value})}
                              placeholder="np. 1,5 mln zł"
                              required
                            />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="reviewer">Osoba odpowiedzialna</Label>
                          <Input
                            id="reviewer"
                            value={projectForm.reviewer}
                            onChange={(e) => setProjectForm({...projectForm, reviewer: e.target.value})}
                            placeholder="np. Wydział Infrastruktury"
                            required
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsCreateProjectOpen(false)}>
                          Anuluj
                        </Button>
                        <Button type="submit">
                          Utwórz projekt
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {projects.length > 0 ? (
                  <DataTable data={projects} />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>Brak aktywnych projektów</p>
                    <p className="text-sm">Dodaj pierwszy projekt aby rozpocząć</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

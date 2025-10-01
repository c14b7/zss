"use client";

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { 
  TriangleAlert, 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2,
  Edit,
  Eye
} from "lucide-react"
import { UrgentIssueService, type UrgentIssue } from "@/lib/appwrite"

const priorityConfig = {
  low: { label: 'Niskie', variant: 'secondary' as const, icon: AlertCircle },
  medium: { label: 'Średnie', variant: 'outline' as const, icon: AlertCircle },
  high: { label: 'Wysokie', variant: 'default' as const, icon: TriangleAlert },
  critical: { label: 'Krytyczne', variant: 'destructive' as const, icon: TriangleAlert }
}

const statusConfig = {
  open: { label: 'Otwarte', variant: 'destructive' as const, icon: XCircle },
  in_progress: { label: 'W trakcie', variant: 'default' as const, icon: Clock },
  resolved: { label: 'Rozwiązane', variant: 'outline' as const, icon: CheckCircle2 },
  closed: { label: 'Zamknięte', variant: 'secondary' as const, icon: CheckCircle2 }
}

export default function UrgentIssuesPage() {
  const [issues, setIssues] = useState<UrgentIssue[]>([])
  const [filteredIssues, setFilteredIssues] = useState<UrgentIssue[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingIssue, setEditingIssue] = useState<UrgentIssue | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as UrgentIssue['priority'],
    status: "open" as UrgentIssue['status'],
    reportedBy: "",
    assignedTo: "",
    deadline: ""
  })

  useEffect(() => {
    loadIssues()
  }, [])

  useEffect(() => {
    filterIssues()
  }, [issues, searchTerm, statusFilter, priorityFilter])

  const loadIssues = async () => {
    try {
      setLoading(true)
      const data = await UrgentIssueService.getAll()
      setIssues(data)
    } catch (error) {
      console.error('Error loading issues:', error)
      toast.error('Błąd podczas ładowania spraw')
    } finally {
      setLoading(false)
    }
  }

  const filterIssues = () => {
    let filtered = issues

    if (searchTerm) {
      filtered = filtered.filter(issue => 
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.reportNumber.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(issue => issue.status === statusFilter)
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter(issue => issue.priority === priorityFilter)
    }

    setFilteredIssues(filtered)
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      priority: "medium",
      status: "open",
      reportedBy: "",
      assignedTo: "",
      deadline: ""
    })
    setEditingIssue(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const issueData = {
        ...formData,
        reportNumber: editingIssue?.reportNumber || UrgentIssueService.generateReportNumber()
      }

      if (editingIssue) {
        await UrgentIssueService.update(editingIssue.$id!, issueData)
        toast.success('Sprawa zaktualizowana pomyślnie')
      } else {
        await UrgentIssueService.create(issueData)
        toast.success('Nowa sprawa została utworzona')
      }

      setIsCreateDialogOpen(false)
      resetForm()
      loadIssues()
    } catch (error) {
      console.error('Error saving issue:', error)
      toast.error('Błąd podczas zapisywania sprawy')
    }
  }

  const handleEdit = (issue: UrgentIssue) => {
    setFormData({
      title: issue.title,
      description: issue.description,
      priority: issue.priority,
      status: issue.status,
      reportedBy: issue.reportedBy,
      assignedTo: issue.assignedTo || "",
      deadline: issue.deadline || ""
    })
    setEditingIssue(issue)
    setIsCreateDialogOpen(true)
  }

  const handleDelete = async (issue: UrgentIssue) => {
    if (!confirm('Czy na pewno chcesz usunąć tę sprawę?')) return

    try {
      await UrgentIssueService.delete(issue.$id!)
      toast.success('Sprawa została usunięta')
      loadIssues()
    } catch (error) {
      console.error('Error deleting issue:', error)
      toast.error('Błąd podczas usuwania sprawy')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL')
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Ładowanie pilnych spraw...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Pilne sprawy</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Zarządzaj pilnymi sprawami wymagającymi natychmiastowej uwagi
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Nowa sprawa
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingIssue ? 'Edytuj sprawę' : 'Nowa pilna sprawa'}
                </DialogTitle>
                <DialogDescription>
                  {editingIssue ? 'Zaktualizuj informacje o sprawie' : 'Dodaj nową pilną sprawę do systemu'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Tytuł sprawy</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Krótki opis problemu"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Opis</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Szczegółowy opis sprawy"
                    rows={3}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="priority">Priorytet</Label>
                    <Select value={formData.priority} onValueChange={(value: UrgentIssue['priority']) => setFormData({...formData, priority: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Niskie</SelectItem>
                        <SelectItem value="medium">Średnie</SelectItem>
                        <SelectItem value="high">Wysokie</SelectItem>
                        <SelectItem value="critical">Krytyczne</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value: UrgentIssue['status']) => setFormData({...formData, status: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Otwarte</SelectItem>
                        <SelectItem value="in_progress">W trakcie</SelectItem>
                        <SelectItem value="resolved">Rozwiązane</SelectItem>
                        <SelectItem value="closed">Zamknięte</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="reportedBy">Zgłaszający</Label>
                    <Input
                      id="reportedBy"
                      value={formData.reportedBy}
                      onChange={(e) => setFormData({...formData, reportedBy: e.target.value})}
                      placeholder="Imię i nazwisko"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="assignedTo">Przypisane do</Label>
                    <Input
                      id="assignedTo"
                      value={formData.assignedTo}
                      onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
                      placeholder="Osoba odpowiedzialna"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="deadline">Termin</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Anuluj
                </Button>
                <Button type="submit">
                  {editingIssue ? 'Zaktualizuj' : 'Utwórz'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtry i wyszukiwanie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Szukaj po tytule, opisie lub numerze zgłoszenia..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie</SelectItem>
                <SelectItem value="open">Otwarte</SelectItem>
                <SelectItem value="in_progress">W trakcie</SelectItem>
                <SelectItem value="resolved">Rozwiązane</SelectItem>
                <SelectItem value="closed">Zamknięte</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Priorytet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie</SelectItem>
                <SelectItem value="critical">Krytyczne</SelectItem>
                <SelectItem value="high">Wysokie</SelectItem>
                <SelectItem value="medium">Średnie</SelectItem>
                <SelectItem value="low">Niskie</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Issues List */}
      <div className="grid gap-4">
        {filteredIssues.length > 0 ? (
          filteredIssues.map((issue) => {
            const PriorityIcon = priorityConfig[issue.priority].icon
            const StatusIcon = statusConfig[issue.status].icon
            
            return (
              <Card key={issue.$id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <CardTitle className="text-lg break-words">{issue.title}</CardTitle>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant={priorityConfig[issue.priority].variant}>
                            <PriorityIcon className="mr-1 h-3 w-3" />
                            {priorityConfig[issue.priority].label}
                          </Badge>
                          <Badge variant={statusConfig[issue.status].variant}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {statusConfig[issue.status].label}
                          </Badge>
                        </div>
                      </div>
                      <CardDescription className="text-sm text-muted-foreground">
                        Zgłoszenie #{issue.reportNumber}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(issue)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(issue)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-4 break-words">{issue.description}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="break-words">Zgłosił: {issue.reportedBy}</span>
                    </div>
                    {issue.assignedTo && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="break-words">Przypisane: {issue.assignedTo}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="break-words">Utworzono: {issue.$createdAt ? formatDate(issue.$createdAt) : 'Nieznana data'}</span>
                    </div>
                    {issue.deadline && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="break-words">Termin: {formatDate(issue.deadline)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <TriangleAlert className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {issues.length === 0 ? 'Brak pilnych spraw' : 'Brak wyników'}
              </h3>
              <p className="text-muted-foreground text-center max-w-md">
                {issues.length === 0 
                  ? 'Nie ma aktualnie żadnych pilnych spraw. To świetna wiadomość!'
                  : 'Nie znaleziono spraw spełniających wybrane kryteria. Spróbuj zmienić filtry.'
                }
              </p>
              {issues.length === 0 && (
                <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Dodaj pierwszą sprawę
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

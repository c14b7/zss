"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { 
  Zap,
  Mail,
  Archive,
  Trash2,
  Star,
  Tag,
  Users,
  Send,
  Clock,
  CheckSquare,
  MessageSquare,
  AlertCircle,
  Forward,
  Reply,
  MoreHorizontal,
  Filter,
  X,
  Plus
} from "lucide-react"

interface QuickAction {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  type: 'bulk' | 'single' | 'template'
  action: string
  shortcut?: string
  enabled: boolean
}

interface NotificationTemplate {
  id: string
  name: string
  subject: string
  content: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  category: string
}

interface BulkOperationProps {
  selectedNotifications: string[]
  onComplete: () => void
}

export default function QuickActionsPanel({ selectedNotifications, onComplete }: BulkOperationProps) {
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false)
  const [selectedAction, setSelectedAction] = useState("")
  const [bulkActionData, setBulkActionData] = useState({
    action: "",
    targetUser: "",
    tag: "",
    priority: "",
    note: ""
  })

  const quickActions: QuickAction[] = [
    {
      id: "mark-read",
      name: "Oznacz jako przeczytane",
      icon: <CheckSquare className="h-4 w-4" />,
      description: "Oznacz wybrane powiadomienia jako przeczytane",
      type: "bulk",
      action: "mark_read",
      shortcut: "R",
      enabled: true
    },
    {
      id: "star-all",
      name: "Oznacz gwiazdką",
      icon: <Star className="h-4 w-4" />,
      description: "Dodaj gwiazdkę do wybranych powiadomień",
      type: "bulk",
      action: "star",
      shortcut: "S",
      enabled: true
    },
    {
      id: "archive-all",
      name: "Archiwizuj",
      icon: <Archive className="h-4 w-4" />,
      description: "Przenieś wybrane powiadomienia do archiwum",
      type: "bulk",
      action: "archive",
      shortcut: "A",
      enabled: true
    },
    {
      id: "delete-all",
      name: "Usuń",
      icon: <Trash2 className="h-4 w-4" />,
      description: "Usuń wybrane powiadomienia na zawsze",
      type: "bulk",
      action: "delete",
      shortcut: "Del",
      enabled: true
    },
    {
      id: "forward-all",
      name: "Przekaż",
      icon: <Forward className="h-4 w-4" />,
      description: "Przekaż wybrane powiadomienia do innego użytkownika",
      type: "bulk",
      action: "forward",
      enabled: true
    },
    {
      id: "add-tag",
      name: "Dodaj tag",
      icon: <Tag className="h-4 w-4" />,
      description: "Dodaj tag do wybranych powiadomień",
      type: "bulk",
      action: "add_tag",
      enabled: true
    }
  ]

  const notificationTemplates: NotificationTemplate[] = [
    {
      id: "meeting-reminder",
      name: "Przypomnienie o spotkaniu",
      subject: "Przypomnienie: Spotkanie {date} o {time}",
      content: "Przypominam o spotkaniu zaplanowanym na {date} o godzinie {time}.\n\nTemat: {topic}\nMiejsce: {location}\n\nDo zobaczenia!",
      priority: "normal",
      category: "meeting"
    },
    {
      id: "document-review",
      name: "Prośba o przegląd dokumentu",
      subject: "Prośba o przegląd: {document_name}",
      content: "Proszę o przegląd dokumentu: {document_name}\n\nTermin przeglądu: {deadline}\nUwagi dodatkowe: {notes}\n\nDziękuję za współpracę!",
      priority: "high",
      category: "document"
    },
    {
      id: "system-maintenance",
      name: "Informacja o konserwacji systemu",
      subject: "Planowana konserwacja systemu - {date}",
      content: "Informujemy o planowanej konserwacji systemu:\n\nData: {date}\nGodzina: {start_time} - {end_time}\nWpływ: {impact}\n\nPrzepraszamy za utrudnienia.",
      priority: "high",
      category: "system"
    },
    {
      id: "deadline-reminder",
      name: "Przypomnienie o terminie",
      subject: "Przypomnienie: Termin {task} - {deadline}",
      content: "Przypominam o zbliżającym się terminie:\n\nZadanie: {task}\nTermin: {deadline}\nStatus: {status}\n\nProszę o realizację w wyznaczonym czasie.",
      priority: "urgent",
      category: "deadline"
    }
  ]

  const executeBulkAction = async (action: string, data?: any) => {
    if (selectedNotifications.length === 0) {
      toast.error("Nie wybrano żadnych powiadomień")
      return
    }

    try {
      console.log(`🚀 Wykonywanie akcji bulk: ${action} dla ${selectedNotifications.length} powiadomień`)
      
      switch (action) {
        case 'mark_read':
          // Mark as read
          toast.success(`Oznaczono ${selectedNotifications.length} powiadomień jako przeczytane`)
          break
          
        case 'star':
          // Add star
          toast.success(`Dodano gwiazdkę do ${selectedNotifications.length} powiadomień`)
          break
          
        case 'archive':
          // Archive
          toast.success(`Zarchiwizowano ${selectedNotifications.length} powiadomień`)
          break
          
        case 'delete':
          // Delete
          toast.success(`Usunięto ${selectedNotifications.length} powiadomień`)
          break
          
        case 'forward':
          // Forward
          if (!data.targetUser) {
            toast.error("Wybierz użytkownika, do którego chcesz przekazać powiadomienia")
            return
          }
          toast.success(`Przekazano ${selectedNotifications.length} powiadomień do ${data.targetUser}`)
          break
          
        case 'add_tag':
          // Add tag
          if (!data.tag) {
            toast.error("Wprowadź nazwę tagu")
            return
          }
          toast.success(`Dodano tag "${data.tag}" do ${selectedNotifications.length} powiadomień`)
          break
          
        default:
          toast.error("Nieznana akcja")
          return
      }

      onComplete()
      setIsBulkDialogOpen(false)
      setBulkActionData({ action: "", targetUser: "", tag: "", priority: "", note: "" })
      
    } catch (error) {
      console.error("❌ Błąd podczas wykonywania akcji bulk:", error)
      toast.error("Nie udało się wykonać akcji")
    }
  }

  const sendFromTemplate = async (template: NotificationTemplate, variables: Record<string, string>, recipients: string[]) => {
    try {
      console.log("📧 Wysyłanie powiadomienia z szablonu:", template.name)
      
      let subject = template.subject
      let content = template.content
      
      // Replace variables in template
      Object.entries(variables).forEach(([key, value]) => {
        const placeholder = `{${key}}`
        subject = subject.replace(new RegExp(placeholder, 'g'), value)
        content = content.replace(new RegExp(placeholder, 'g'), value)
      })
      
      // In real app, send to each recipient
      toast.success(`Wysłano powiadomienie "${subject}" do ${recipients.length} odbiorców`)
      setIsTemplateDialogOpen(false)
      
    } catch (error) {
      console.error("❌ Błąd podczas wysyłania z szablonu:", error)
      toast.error("Nie udało się wysłać powiadomienia")
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-400'
      case 'normal': return 'bg-blue-400'
      case 'high': return 'bg-orange-400'
      case 'urgent': return 'bg-red-400'
      default: return 'bg-gray-400'
    }
  }

  if (selectedNotifications.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-slate-400 dark:text-slate-500">
            <Zap className="h-12 w-12 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Szybkie akcje</p>
            <p className="text-sm">Wybierz powiadomienia, aby zobaczyć dostępne akcje</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Szybkie akcje
          <Badge variant="secondary" className="ml-auto">
            {selectedNotifications.length} wybranych
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {quickActions.filter(action => action.enabled).map((action) => (
            <Button
              key={action.id}
              variant="outline"
              size="sm"
              onClick={() => {
                if (['forward', 'add_tag'].includes(action.action)) {
                  setBulkActionData(prev => ({ ...prev, action: action.action }))
                  setIsBulkDialogOpen(true)
                } else {
                  executeBulkAction(action.action)
                }
              }}
              className="justify-start"
            >
              {action.icon}
              <span className="ml-2 text-xs">{action.name}</span>
              {action.shortcut && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  {action.shortcut}
                </Badge>
              )}
            </Button>
          ))}
        </div>

        {/* Template Actions */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Szablony powiadomień
          </h4>
          
          <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Użyj szablonu
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Wyślij powiadomienie z szablonu</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                  {notificationTemplates.map((template) => (
                    <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">{template.name}</h4>
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(template.priority)}`}></div>
                        </div>
                        <p className="text-sm text-slate-500 mb-3">{template.subject}</p>
                        <div className="text-xs text-slate-400 line-clamp-3">
                          {template.content.substring(0, 100)}...
                        </div>
                        <Badge variant="outline" className="mt-2 text-xs">
                          {template.category}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Bulk Action Dialog */}
        <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {bulkActionData.action === 'forward' ? 'Przekaż powiadomienia' : 'Dodaj tag'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {bulkActionData.action === 'forward' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="targetUser">Przekaż do użytkownika</Label>
                    <Select value={bulkActionData.targetUser} onValueChange={(value) => setBulkActionData(prev => ({ ...prev, targetUser: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz użytkownika" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="jan.kowalski@example.com">Jan Kowalski</SelectItem>
                        <SelectItem value="anna.nowak@example.com">Anna Nowak</SelectItem>
                        <SelectItem value="piotr.wisniewski@example.com">Piotr Wiśniewski</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="note">Notatka (opcjonalna)</Label>
                    <Textarea
                      placeholder="Dodaj notatkę do przekazywanej wiadomości..."
                      value={bulkActionData.note}
                      onChange={(e) => setBulkActionData(prev => ({ ...prev, note: e.target.value }))}
                      rows={3}
                    />
                  </div>
                </>
              )}
              
              {bulkActionData.action === 'add_tag' && (
                <div className="space-y-2">
                  <Label htmlFor="tag">Nazwa tagu</Label>
                  <Input
                    placeholder="np. Ważne, Do przeglądu, Pilne"
                    value={bulkActionData.tag}
                    onChange={(e) => setBulkActionData(prev => ({ ...prev, tag: e.target.value }))}
                  />
                </div>
              )}
              
              <div className="text-sm text-slate-500">
                Akcja zostanie wykonana dla {selectedNotifications.length} wybranych powiadomień.
              </div>
              
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsBulkDialogOpen(false)}>
                  Anuluj
                </Button>
                <Button onClick={() => executeBulkAction(bulkActionData.action, bulkActionData)}>
                  {bulkActionData.action === 'forward' ? 'Przekaż' : 'Dodaj tag'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

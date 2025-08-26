"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Client, Databases } from "appwrite"
import { 
  ArrowLeft, 
  Send, 
  Search, 
  X, 
  User, 
  Users, 
  Mail, 
  MessageSquare, 
  AlertCircle, 
  Clock, 
  Star,
  Check,
  ChevronsUpDown,
  UserPlus
} from "lucide-react"

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("687abe96000d2d31f914")

const databases = new Databases(client)

interface User {
  $id: string
  name: string
  email: string
  avatar?: string
  department?: string
  role?: string
  isOnline?: boolean
  lastSeen?: string
}

export default function ComposePage() {
  console.log("🏗️ Inicjalizacja komponentu ComposePage")
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal')
  const [recipients, setRecipients] = useState<User[]>([])
  const [userSearch, setUserSearch] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [recentUsers, setRecentUsers] = useState<User[]>([])
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([])
  
  const searchInputRef = useRef<HTMLInputElement>(null)
  const currentUser = "user@example.com" // Mock user

  // Check for reply/forward parameters
  const replyId = searchParams.get('reply')
  const forwardId = searchParams.get('forward')

  useEffect(() => {
    loadInitialData()
    
    if (replyId || forwardId) {
      loadOriginalMessage()
    }
  }, [replyId, forwardId])

  useEffect(() => {
    if (userSearch.trim().length >= 2) {
      searchUsers(userSearch)
    } else {
      setSearchResults([])
    }
  }, [userSearch])

  const loadInitialData = async () => {
    // Load recent users and suggestions
    try {
      // Mock data for development
      const mockRecentUsers: User[] = [
        {
          $id: "1",
          name: "Jan Kowalski",
          email: "jan.kowalski@example.com",
          department: "IT",
          role: "Developer",
          isOnline: true
        },
        {
          $id: "2", 
          name: "Anna Nowak",
          email: "anna.nowak@example.com",
          department: "Marketing",
          role: "Manager",
          isOnline: false,
          lastSeen: new Date(Date.now() - 1000 * 60 * 30).toISOString()
        },
        {
          $id: "3",
          name: "Piotr Wiśniewski", 
          email: "piotr.wisniewski@example.com",
          department: "HR",
          role: "Specialist",
          isOnline: true
        }
      ]

      const mockSuggestedUsers: User[] = [
        {
          $id: "4",
          name: "Maria Dąbrowska",
          email: "maria.dabrowska@example.com", 
          department: "Finance",
          role: "Accountant",
          isOnline: false
        },
        {
          $id: "5",
          name: "Tomasz Lewandowski",
          email: "tomasz.lewandowski@example.com",
          department: "Sales",
          role: "Representative", 
          isOnline: true
        }
      ]

      setRecentUsers(mockRecentUsers)
      setSuggestedUsers(mockSuggestedUsers)
    } catch (error) {
      console.error("❌ Błąd podczas ładowania danych:", error)
    }
  }

  const loadOriginalMessage = async () => {
    try {
      const messageId = replyId || forwardId
      if (!messageId) return

      // Load original message
      const originalMessage = await databases.getDocument(
        "votes",
        "notifications", 
        messageId
      )

      if (replyId) {
        // Setup reply
        setTitle(`Re: ${originalMessage.title}`)
        setContent(`\n\n--- Oryginalna wiadomość ---\nOd: ${originalMessage.fromUserName}\nData: ${new Date(originalMessage.$createdAt).toLocaleString('pl-PL')}\n\n${originalMessage.content}`)
        
        // Add original sender to recipients
        const originalSender: User = {
          $id: originalMessage.fromUser,
          name: originalMessage.fromUserName || originalMessage.fromUser,
          email: originalMessage.fromUser
        }
        setRecipients([originalSender])
      } else if (forwardId) {
        // Setup forward
        setTitle(`Fwd: ${originalMessage.title}`)
        setContent(`\n\n--- Przekazana wiadomość ---\nOd: ${originalMessage.fromUserName}\nDo: ${originalMessage.toUser}\nData: ${new Date(originalMessage.$createdAt).toLocaleString('pl-PL')}\nTemat: ${originalMessage.title}\n\n${originalMessage.content}`)
      }
    } catch (error) {
      console.error("❌ Błąd podczas ładowania oryginalnej wiadomości:", error)
      toast.error("Nie udało się załadować oryginalnej wiadomości")
    }
  }

  const searchUsers = async (query: string) => {
    setIsSearching(true)
    
    try {
      // Mock search - in real app this would be API call
      const allUsers: User[] = [
        ...recentUsers,
        ...suggestedUsers,
        {
          $id: "6",
          name: "Katarzyna Zielińska",
          email: "katarzyna.zielinska@example.com",
          department: "Legal",
          role: "Lawyer",
          isOnline: false
        },
        {
          $id: "7", 
          name: "Michał Szymański",
          email: "michal.szymanski@example.com",
          department: "Operations",
          role: "Manager",
          isOnline: true
        },
        {
          $id: "8",
          name: "Aleksandra Woźniak",
          email: "aleksandra.wozniak@example.com", 
          department: "Design",
          role: "UX Designer",
          isOnline: true
        }
      ]

      const filtered = allUsers.filter(user => 
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase()) ||
        user.department?.toLowerCase().includes(query.toLowerCase()) ||
        user.role?.toLowerCase().includes(query.toLowerCase())
      )

      setSearchResults(filtered)
    } catch (error) {
      console.error("❌ Błąd podczas wyszukiwania użytkowników:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const addRecipient = (user: User) => {
    if (!recipients.find(r => r.$id === user.$id)) {
      setRecipients([...recipients, user])
    }
    setUserSearch("")
    setIsSearchOpen(false)
  }

  const removeRecipient = (userId: string) => {
    setRecipients(recipients.filter(r => r.$id !== userId))
  }

  const handleSend = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Wypełnij tytuł i treść wiadomości")
      return
    }

    if (recipients.length === 0) {
      toast.error("Wybierz co najmniej jednego odbiorcy")
      return
    }

    setIsSending(true)

    try {
      // Send message to each recipient
      for (const recipient of recipients) {
        const notificationData = {
          type: 'message',
          title: title,
          content: content,
          fromUser: currentUser,
          fromUserName: "Ty", // In real app get from user profile
          toUser: recipient.email,
          isRead: false,
          isStarred: false,
          isArchived: false,
          priority: priority
        }

        await databases.createDocument(
          "votes",
          "notifications",
          "unique()",
          notificationData
        )
      }

      console.log("✅ Wiadomość została wysłana do", recipients.length, "odbiorców")
      toast.success("Wiadomość została wysłana!", {
        description: `Dostarczono do ${recipients.length} odbiorców`
      })

      // Reset form
      setTitle("")
      setContent("")
      setRecipients([])
      setPriority('normal')

      // Redirect after short delay
      setTimeout(() => {
        router.push("/inbox")
      }, 1500)

    } catch (error: any) {
      console.error("❌ Błąd podczas wysyłania wiadomości:", error)
      toast.error("Nie udało się wysłać wiadomości", {
        description: error.message
      })
    } finally {
      setIsSending(false)
    }
  }

  const formatLastSeen = (lastSeen?: string) => {
    if (!lastSeen) return ""
    
    const date = new Date(lastSeen)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "aktywny teraz"
    if (diffMins < 60) return `${diffMins} min temu`
    if (diffHours < 24) return `${diffHours} godz. temu`
    return `${diffDays} dni temu`
  }

  return (
    <div className="py-6 px-2">
      <div className="w-full max-w-4xl mx-auto px-2">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push("/inbox")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Powrót
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {replyId ? "Odpowiedz" : forwardId ? "Przekaż wiadomość" : "Nowa wiadomość"}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Napisz wiadomość do innych użytkowników
            </p>
          </div>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Komponuj wiadomość
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Recipients */}
            <div className="space-y-3">
              <Label htmlFor="recipients" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Odbiorcy
              </Label>
              
              {/* Selected Recipients */}
              {recipients.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {recipients.map((recipient) => (
                    <Badge 
                      key={recipient.$id} 
                      variant="secondary" 
                      className="flex items-center gap-2 py-2 px-3"
                    >
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-xs">
                          {recipient.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{recipient.name}</span>
                      <button
                        onClick={() => removeRecipient(recipient.$id)}
                        className="hover:bg-slate-300 dark:hover:bg-slate-600 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* User Search */}
              <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isSearchOpen}
                    className="w-full justify-between h-11"
                  >
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      <span className="text-slate-500">Wyszukaj użytkowników...</span>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput 
                      placeholder="Wpisz imię, email lub dział..." 
                      value={userSearch}
                      onValueChange={setUserSearch}
                    />
                    <CommandEmpty>
                      {isSearching ? "Wyszukiwanie..." : "Nie znaleziono użytkowników"}
                    </CommandEmpty>
                    
                    {/* Recent Users */}
                    {recentUsers.length > 0 && userSearch.trim().length < 2 && (
                      <CommandGroup heading="Ostatnio używane">
                        {recentUsers.map((user) => (
                          <CommandItem
                            key={user.$id}
                            value={`${user.name} ${user.email} ${user.department}`}
                            onSelect={() => addRecipient(user)}
                            className="flex items-center gap-3 p-3"
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{user.name}</span>
                                {user.isOnline && (
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                )}
                              </div>
                              <div className="text-sm text-slate-500">
                                {user.email} • {user.department}
                              </div>
                              {!user.isOnline && user.lastSeen && (
                                <div className="text-xs text-slate-400">
                                  {formatLastSeen(user.lastSeen)}
                                </div>
                              )}
                            </div>
                            {recipients.find(r => r.$id === user.$id) && (
                              <Check className="h-4 w-4 text-green-600" />
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}

                    {/* Suggested Users */}
                    {suggestedUsers.length > 0 && userSearch.trim().length < 2 && (
                      <CommandGroup heading="Sugerowane">
                        {suggestedUsers.map((user) => (
                          <CommandItem
                            key={user.$id}
                            value={`${user.name} ${user.email} ${user.department}`}
                            onSelect={() => addRecipient(user)}
                            className="flex items-center gap-3 p-3"
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{user.name}</span>
                                {user.isOnline && (
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                )}
                              </div>
                              <div className="text-sm text-slate-500">
                                {user.email} • {user.department}
                              </div>
                            </div>
                            {recipients.find(r => r.$id === user.$id) && (
                              <Check className="h-4 w-4 text-green-600" />
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}

                    {/* Search Results */}
                    {userSearch.trim().length >= 2 && searchResults.length > 0 && (
                      <CommandGroup heading="Wyniki wyszukiwania">
                        {searchResults.map((user) => (
                          <CommandItem
                            key={user.$id}
                            value={`${user.name} ${user.email} ${user.department}`}
                            onSelect={() => addRecipient(user)}
                            className="flex items-center gap-3 p-3"
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{user.name}</span>
                                {user.isOnline && (
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                )}
                              </div>
                              <div className="text-sm text-slate-500">
                                {user.email} • {user.department} • {user.role}
                              </div>
                              {!user.isOnline && user.lastSeen && (
                                <div className="text-xs text-slate-400">
                                  {formatLastSeen(user.lastSeen)}
                                </div>
                              )}
                            </div>
                            {recipients.find(r => r.$id === user.$id) && (
                              <Check className="h-4 w-4 text-green-600" />
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Title and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-3">
                <Label htmlFor="title" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Temat
                </Label>
                <Input
                  id="title"
                  placeholder="Wpisz temat wiadomości"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isSending}
                  required
                  className="h-11 text-base border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Priorytet
                </Label>
                <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        Niski
                      </div>
                    </SelectItem>
                    <SelectItem value="normal">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        Normalny
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                        Wysoki
                      </div>
                    </SelectItem>
                    <SelectItem value="urgent">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                        Pilny
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-3">
              <Label htmlFor="content" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Treść wiadomości
              </Label>
              <Textarea
                id="content"
                placeholder="Wpisz treść wiadomości..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isSending}
                required
                rows={12}
                className="resize-none border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4">
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {recipients.length > 0 && (
                  <span>Wiadomość zostanie wysłana do {recipients.length} odbiorców</span>
                )}
              </div>
              
              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push("/inbox")}
                  disabled={isSending}
                  className="px-6"
                >
                  Anuluj
                </Button>
                <Button 
                  onClick={handleSend}
                  disabled={isSending || !title.trim() || !content.trim() || recipients.length === 0}
                  className="px-8 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  {isSending ? (
                    <>
                      <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Wysyłanie...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Wyślij wiadomość
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

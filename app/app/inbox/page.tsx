"use client";

import { useState, useEffect } from "react";
import { Client, Databases, Account, Query } from "appwrite";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Mail, 
  Search, 
  Plus, 
  Archive, 
  Trash2, 
  Star, 
  Settings,
  BarChart3,
  RefreshCw,
  Menu,
  ArrowLeft,
  Sun,
  Moon
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface Email {
  $id: string;
  sender: string;
  senderEmail: string;
  subject: string;
  content: string;
  isRead: boolean;
  isStarred: boolean;
  $createdAt: string;
  hasAttachment: boolean;
}

const endpoint = 'https://fra.cloud.appwrite.io/v1'
const projectId = '687abe96000d2d31f914'
const APPWRITE_DATABASE_ID = 'votes'
const APPWRITE_EMAILS_COLLECTION_ID = 'emails'

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId);

const databases = new Databases(client);
const account = new Account(client);

export default function InboxPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showEmailContent, setShowEmailContent] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    checkAuth();
    fetchEmails();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await account.get();
      setUser(currentUser);
    } catch (error) {
      console.error("Auth error:", error);
    }
  };

  const fetchEmails = async () => {
    try {
      setIsLoading(true);
      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        APPWRITE_EMAILS_COLLECTION_ID,
        [
          Query.orderDesc("$createdAt"),
          Query.limit(50)
        ]
      );
      setEmails(response.documents as Email[]);
    } catch (error) {
      console.error("Error fetching emails:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (emailId: string) => {
    try {
      await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_EMAILS_COLLECTION_ID,
        emailId,
        { isRead: true }
      );
      
      setEmails(prev => 
        prev.map(email => 
          email.$id === emailId ? { ...email, isRead: true } : email
        )
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const toggleStar = async (emailId: string, currentStarred: boolean) => {
    try {
      await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_EMAILS_COLLECTION_ID,
        emailId,
        { isStarred: !currentStarred }
      );
      
      setEmails(prev => 
        prev.map(email => 
          email.$id === emailId ? { ...email, isStarred: !currentStarred } : email
        )
      );
    } catch (error) {
      console.error("Error toggling star:", error);
    }
  };

  const deleteEmail = async (emailId: string) => {
    try {
      await databases.deleteDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_EMAILS_COLLECTION_ID,
        emailId
      );
      
      setEmails(prev => prev.filter(email => email.$id !== emailId));
      if (selectedEmail?.$id === emailId) {
        setSelectedEmail(null);
        setShowEmailContent(false);
      }
    } catch (error) {
      console.error("Error deleting email:", error);
    }
  };

  const filteredEmails = emails.filter(email =>
    email.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.senderEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadCount = emails.filter(email => !email.isRead).length;

  const selectEmail = (email: Email) => {
    setSelectedEmail(email);
    setShowEmailContent(true);
    if (!email.isRead) markAsRead(email.$id);
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Mail className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">Zseil Mail</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </div>
        
        <Link href="/inbox/compose">
          <Button className="w-full mb-4">
            <Plus className="h-4 w-4 mr-2" />
            Napisz
          </Button>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-4">
        <nav className="space-y-2 py-4">
          <Button variant="secondary" className="w-full justify-start">
            <Mail className="h-4 w-4 mr-2" />
            Odebrane
            {unreadCount > 0 && (
              <Badge variant="default" className="ml-auto">
                {unreadCount}
              </Badge>
            )}
          </Button>
          
          <Button variant="ghost" className="w-full justify-start">
            <Star className="h-4 w-4 mr-2" />
            Oznaczone gwiazdką
          </Button>
          
          <Button variant="ghost" className="w-full justify-start">
            <Archive className="h-4 w-4 mr-2" />
            Zarchiwizowane
          </Button>
          
          <Button variant="ghost" className="w-full justify-start">
            <Trash2 className="h-4 w-4 mr-2" />
            Kosz
          </Button>
        </nav>

        <Separator className="my-4" />

        <div className="space-y-2 pb-4">
          <Link href="/inbox/analytics">
            <Button variant="ghost" className="w-full justify-start">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analityka
            </Button>
          </Link>
          
          <Link href="/inbox/settings">
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="h-4 w-4 mr-2" />
              Ustawienia
            </Button>
          </Link>
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 border-r bg-card/50 backdrop-blur-sm">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Email List */}
      <div className={cn(
        "w-full lg:w-80 border-r bg-card/30 backdrop-blur-sm transition-all duration-300",
        showEmailContent && "hidden md:block"
      )}>
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 mb-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SidebarContent />
              </SheetContent>
            </Sheet>
            
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Szukaj wiadomości..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={fetchEmails}
              disabled={isLoading}
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-120px)]">
          <div className="space-y-1 p-2">
            {isLoading ? (
              // Loading skeleton
              [...Array(5)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-muted rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              filteredEmails.map((email) => (
                <Card
                  key={email.$id}
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:bg-muted/50 animate-fade-in",
                    selectedEmail?.$id === email.$id && "bg-muted ring-2 ring-primary/20",
                    !email.isRead && "border-l-4 border-l-primary shadow-sm"
                  )}
                  onClick={() => selectEmail(email)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Avatar className="h-8 w-8 ring-2 ring-background">
                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${email.sender}`} />
                          <AvatarFallback className="text-xs font-medium">
                            {email.sender.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <p className={cn(
                              "text-sm truncate transition-colors",
                              !email.isRead ? "font-semibold text-foreground" : "text-muted-foreground"
                            )}>
                              {email.sender}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {new Date(email.$createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className={cn(
                            "text-sm truncate transition-colors",
                            !email.isRead ? "font-medium text-foreground" : "text-muted-foreground"
                          )}>
                            {email.subject}
                          </p>
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            {email.content.substring(0, 50)}...
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStar(email.$id, email.isStarred);
                          }}
                        >
                          <Star className={cn(
                            "h-3 w-3 transition-colors",
                            email.isStarred && "fill-yellow-400 text-yellow-400"
                          )} />
                        </Button>
                        {email.hasAttachment && (
                          <div className="h-2 w-2 bg-primary rounded-full" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
            
            {filteredEmails.length === 0 && !isLoading && (
              <div className="text-center p-8 text-muted-foreground animate-fade-in">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">
                  {searchQuery ? 'Nie znaleziono wiadomości' : 'Brak wiadomości'}
                </p>
                <p className="text-sm">
                  {searchQuery ? 'Spróbuj zmienić kryteria wyszukiwania' : 'Nowe wiadomości pojawią się tutaj'}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Email Content */}
      <div className={cn(
        "flex-1 bg-background transition-all duration-300",
        !showEmailContent && "hidden md:block"
      )}>
        {selectedEmail ? (
          <div className="h-full flex flex-col animate-fade-in">
            <div className="border-b bg-card/50 backdrop-blur-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setShowEmailContent(false)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Avatar className="ring-2 ring-background">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedEmail.sender}`} />
                    <AvatarFallback>{selectedEmail.sender.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold">{selectedEmail.sender}</h2>
                    <p className="text-sm text-muted-foreground">{selectedEmail.senderEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleStar(selectedEmail.$id, selectedEmail.isStarred)}
                  >
                    <Star className={cn(
                      "h-4 w-4 transition-colors",
                      selectedEmail.isStarred && "fill-yellow-400 text-yellow-400"
                    )} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteEmail(selectedEmail.$id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <h1 className="text-xl font-semibold mb-2">{selectedEmail.subject}</h1>
              <p className="text-sm text-muted-foreground">
                {new Date(selectedEmail.$createdAt).toLocaleString()}
              </p>
            </div>
            
            <ScrollArea className="flex-1 p-6">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div className="whitespace-pre-wrap leading-relaxed">
                  {selectedEmail.content}
                </div>
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground animate-fade-in">
            <div className="text-center max-w-sm mx-auto p-6">
              <Mail className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Wybierz wiadomość</h3>
              <p className="text-sm text-muted-foreground">
                Kliknij na wiadomość z listy, aby wyświetlić jej zawartość
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

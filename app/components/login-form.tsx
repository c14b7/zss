"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth/AuthProvider"
import { Loader2, Mail, Lock, User, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"

export function LoginForm() {
  const { login, register, user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("login")
  
  // Login form
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  
  // Register form
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [registerName, setRegisterName] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Jeśli użytkownik jest już zalogowany
  if (user) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <CardTitle className="text-xl">Już jesteś zalogowany!</CardTitle>
          <CardDescription>
            Witaj ponownie, <strong>{user.name}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground space-y-1">
            <p>Email: <span className="font-mono">{user.email}</span></p>
            <p>ID: <span className="font-mono text-xs">{user.$id}</span></p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Link href="/vote/manage" className="w-full">
            <Button className="w-full">
              Zarządzaj głosowaniami
            </Button>
          </Link>
          <Link href="/vote/new" className="w-full">
            <Button variant="outline" className="w-full">
              Utwórz nową ankietę
            </Button>
          </Link>
        </CardFooter>
      </Card>
    )
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!loginEmail.trim() || !loginPassword.trim()) {
      toast.error("Wypełnij wszystkie pola")
      return
    }
    
    setIsLoading(true)
    
    try {
      console.log("Rozpoczynam logowanie...")
      await login(loginEmail, loginPassword)
      
      // Redirect po sukcesie
      setTimeout(() => {
        router.push("/vote/manage")
      }, 1500)
      
    } catch (error: any) {
      console.error("Login failed:", error)
      // Toast jest już wyświetlony w AuthProvider
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Walidacja
    if (!registerName.trim()) {
      toast.error("Imię i nazwisko są wymagane")
      return
    }
    
    if (!registerEmail.trim()) {
      toast.error("Email jest wymagany")
      return
    }
    
    if (registerPassword.length < 8) {
      toast.error("Hasło musi mieć co najmniej 8 znaków")
      return
    }
    
    if (registerPassword !== confirmPassword) {
      toast.error("Hasła nie są identyczne")
      return
    }
    
    setIsLoading(true)
    
    try {
      console.log("Rozpoczynam rejestrację...")
      await register(registerEmail, registerPassword, registerName)
      
      // Redirect po sukcesie
      setTimeout(() => {
        router.push("/vote/manage")
      }, 2000)
      
    } catch (error: any) {
      console.error("Registration failed:", error)
      // Toast jest już wyświetlony w AuthProvider
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">ZSS</h1>
        <p className="text-muted-foreground">
          System zarządzania
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Zaloguj się lub zarejestruj</CardTitle>
          <CardDescription>
            Aby zarządzać ankietami potrzebujesz konta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Logowanie</TabsTrigger>
              <TabsTrigger value="register">Rejestracja</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="twoj@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="pl-10"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Hasło</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Twoje hasło"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="pl-10"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Logowanie...
                    </>
                  ) : (
                    "Zaloguj się"
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register" className="space-y-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Imię i nazwisko</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-name"
                      placeholder="Jan Kowalski"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      className="pl-10"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="twoj@email.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      className="pl-10"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Hasło</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Min. 8 znaków"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="pl-10"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Potwierdź hasło</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Powtórz hasło"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Tworzenie konta...
                    </>
                  ) : (
                    "Zarejestruj się"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-center text-sm text-muted-foreground">
            <p>Możesz też głosować bez konta jako gość</p>
          </div>
          <Link href="/vote" className="w-full">
            <Button variant="outline" className="w-full">
              Przeglądaj ankiety
            </Button>
          </Link>
        </CardFooter>
      </Card>
      
      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="bg-gray-50 border-gray-200">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Debug Info
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs font-mono space-y-1">
            <p>Project ID: 687abe96000d2d31f914</p>
            <p>Endpoint: https://fra.cloud.appwrite.io/v1</p>
            <p>Environment: {process.env.NODE_ENV}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
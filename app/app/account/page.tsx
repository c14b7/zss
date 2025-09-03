"use client"

import { useAuth } from "@/components/auth/AuthProvider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Calendar, Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AccountPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Konto użytkownika</h1>
        <p className="text-muted-foreground">
          Zarządzaj swoimi informacjami osobistymi i ustawieniami konta
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profil użytkownika
            </CardTitle>
            <CardDescription>
              Podstawowe informacje o Twoim koncie
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="/avatars/user.jpg" alt={user.name} />
                <AvatarFallback className="text-lg">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-medium">{user.name}</h3>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="grid gap-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Data utworzenia konta</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(user.$createdAt).toLocaleDateString('pl-PL')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Status konta</p>
                  <p className="text-sm text-muted-foreground">
                    {user.emailVerification ? 'Zweryfikowane' : 'Niezweryfikowane'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle>Ustawienia konta</CardTitle>
            <CardDescription>
              Zarządzaj ustawieniami bezpieczeństwa i preferencjami
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-3">
              <Button variant="outline" className="justify-start">
                Zmień hasło
              </Button>
              <Button variant="outline" className="justify-start">
                Ustawienia powiadomień
              </Button>
              <Button variant="outline" className="justify-start">
                Eksportuj dane
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
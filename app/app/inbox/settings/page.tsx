"use client";

import { useState, useEffect } from "react";
import { Client, Account } from "appwrite";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Settings, 
  ArrowLeft, 
  User, 
  Bell, 
  Shield, 
  Palette,
  LogOut,
  Save
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const account = new Account(client);

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    desktopNotifications: false,
    soundNotifications: true,
    readReceipts: false,
    autoMarkAsRead: true,
    theme: "system",
    language: "pl"
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const currentUser = await account.get();
      setUser(currentUser);
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = (key: string, value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = async () => {
    try {
      // Save settings to local storage or database
      localStorage.setItem("zseil-settings", JSON.stringify(settings));
      toast.success("Ustawienia zostały zapisane");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Błąd podczas zapisywania ustawień");
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession("current");
      // Redirect to login page
      window.location.href = "/login";
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Błąd podczas wylogowywania");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/inbox">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-semibold">Ustawienia</h1>
          </div>
        </div>

        <div className="space-y-6">
          {/* Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profil użytkownika
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`} />
                  <AvatarFallback>{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{user?.name}</h3>
                  <p className="text-muted-foreground">{user?.email}</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Zmień zdjęcie
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nazwa użytkownika</Label>
                  <Input id="name" defaultValue={user?.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Adres e-mail</Label>
                  <Input id="email" type="email" defaultValue={user?.email} disabled />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Powiadomienia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Powiadomienia e-mail</Label>
                  <p className="text-sm text-muted-foreground">
                    Otrzymuj powiadomienia o nowych wiadomościach
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(value) => handleSettingChange("emailNotifications", value)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Powiadomienia na pulpicie</Label>
                  <p className="text-sm text-muted-foreground">
                    Wyświetlaj powiadomienia w przeglądarce
                  </p>
                </div>
                <Switch
                  checked={settings.desktopNotifications}
                  onCheckedChange={(value) => handleSettingChange("desktopNotifications", value)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Dźwięki powiadomień</Label>
                  <p className="text-sm text-muted-foreground">
                    Odtwarzaj dźwięk przy nowych wiadomościach
                  </p>
                </div>
                <Switch
                  checked={settings.soundNotifications}
                  onCheckedChange={(value) => handleSettingChange("soundNotifications", value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Prywatność i bezpieczeństwo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Potwierdzenia odczytu</Label>
                  <p className="text-sm text-muted-foreground">
                    Wysyłaj potwierdzenia gdy czytasz wiadomości
                  </p>
                </div>
                <Switch
                  checked={settings.readReceipts}
                  onCheckedChange={(value) => handleSettingChange("readReceipts", value)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Automatyczne oznaczanie jako przeczytane</Label>
                  <p className="text-sm text-muted-foreground">
                    Oznaczaj wiadomości jako przeczytane po otwarciu
                  </p>
                </div>
                <Switch
                  checked={settings.autoMarkAsRead}
                  onCheckedChange={(value) => handleSettingChange("autoMarkAsRead", value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Appearance Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Wygląd
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Motyw</Label>
                <div className="flex gap-2">
                  <Button
                    variant={settings.theme === "light" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSettingChange("theme", "light")}
                  >
                    Jasny
                  </Button>
                  <Button
                    variant={settings.theme === "dark" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSettingChange("theme", "dark")}
                  >
                    Ciemny
                  </Button>
                  <Button
                    variant={settings.theme === "system" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSettingChange("theme", "system")}
                  >
                    Systemowy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6">
            <Button variant="destructive" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Wyloguj się
            </Button>
            
            <Button onClick={saveSettings}>
              <Save className="h-4 w-4 mr-2" />
              Zapisz ustawienia
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

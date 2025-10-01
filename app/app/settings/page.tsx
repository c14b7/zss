'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Bell, 
  Palette, 
  Smartphone, 
  Download,
  Mail,
  MessageSquare,
  Globe,
  Send,
  TestTube
} from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

interface SettingsData {
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    announcements: boolean;
    urgentIssues: boolean;
    budgetAlerts: boolean;
  };
  app: {
    language: string;
    autoInstallPrompt: boolean;
  };
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<SettingsData>({
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      announcements: true,
      urgentIssues: true,
      budgetAlerts: false,
    },
    app: {
      language: 'pl',
      autoInstallPrompt: true,
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [emailTestLoading, setEmailTestLoading] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Sprawdź czy aplikacja może być zainstalowana jako PWA
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Sprawdź czy aplikacja jest już zainstalowana
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setCanInstall(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleSettingChange = (
    section: keyof SettingsData,
    key: string,
    value: boolean | string
  ) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        toast.success('Aplikacja została zainstalowana pomyślnie!');
        setCanInstall(false);
      } else {
        toast.info('Instalacja została anulowana');
      }
      
      setDeferredPrompt(null);
    } else if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')) {
      toast.info('Aby zainstalować aplikację na iOS:\n1. Naciśnij przycisk udostępniania\n2. Wybierz "Dodaj do ekranu głównego"');
    } else {
      toast.info('Instalacja PWA nie jest dostępna w tej przeglądarce');
    }
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Symulacja zapisywania ustawień - w rzeczywistej aplikacji to byłoby API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      localStorage.setItem('zss-settings', JSON.stringify(settings));
      toast.success('Ustawienia zostały zapisane');
    } catch (error) {
      toast.error('Błąd podczas zapisywania ustawień');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestEmailNotification = async () => {
    setEmailTestLoading(true);
    try {
      const { NotificationService } = await import('@/lib/notifications');
      const { VoteService } = await import('@/lib/appwrite');
      
      // Pobierz najnowsze głosowanie do testu
      const votes = await VoteService.getAll();
      if (votes.length > 0) {
        const testVote = votes[0];
        await NotificationService.sendVoteNotification(testVote);
        toast.success('Test email powiadomienia został wysłany!');
      } else {
        toast.error('Brak głosowań do testowania - utwórz najpierw głosowanie');
      }
    } catch (error) {
      console.error('Błąd testu email:', error);
      toast.error('Błąd podczas wysyłania test emaila');
    } finally {
      setEmailTestLoading(false);
    }
  };

  const handleTestNotification = () => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('ZSS - Test powiadomienia', {
          body: 'To jest testowe powiadomienie z systemu ZSS',
          icon: '/favicon.ico',
        });
        toast.success('Powiadomienie zostało wysłane');
      } else if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('ZSS - Test powiadomienia', {
              body: 'To jest testowe powiadomienie z systemu ZSS',
              icon: '/favicon.ico',
            });
            toast.success('Powiadomienie zostało wysłane');
          } else {
            toast.error('Powiadomienia zostały zablokowane');
          }
        });
      } else {
        toast.error('Powiadomienia są zablokowane w przeglądarce');
      }
    } else {
      toast.error('Powiadomienia nie są obsługiwane w tej przeglądarce');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Settings className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Ustawienia systemu</h1>
      </div>

      <div className="grid gap-6">
        {/* Ustawienia powiadomień */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Powiadomienia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Powiadomienia email</Label>
                <p className="text-sm text-muted-foreground">
                  Otrzymuj powiadomienia na adres email
                </p>
              </div>
              <Switch
                checked={settings.notifications.emailNotifications}
                onCheckedChange={(checked) =>
                  handleSettingChange('notifications', 'emailNotifications', checked)
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Powiadomienia push</Label>
                <p className="text-sm text-muted-foreground">
                  Otrzymuj powiadomienia push w przeglądarce
                </p>
              </div>
              <Switch
                checked={settings.notifications.pushNotifications}
                onCheckedChange={(checked) =>
                  handleSettingChange('notifications', 'pushNotifications', checked)
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Nowe ogłoszenia</Label>
                <p className="text-sm text-muted-foreground">
                  Powiadomienia o nowych ogłoszeniach
                </p>
              </div>
              <Switch
                checked={settings.notifications.announcements}
                onCheckedChange={(checked) =>
                  handleSettingChange('notifications', 'announcements', checked)
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Pilne sprawy</Label>
                <p className="text-sm text-muted-foreground">
                  Powiadomienia o pilnych sprawach
                </p>
              </div>
              <Switch
                checked={settings.notifications.urgentIssues}
                onCheckedChange={(checked) =>
                  handleSettingChange('notifications', 'urgentIssues', checked)
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Alerty budżetowe</Label>
                <p className="text-sm text-muted-foreground">
                  Powiadomienia o przekroczeniu budżetu
                </p>
              </div>
              <Switch
                checked={settings.notifications.budgetAlerts}
                onCheckedChange={(checked) =>
                  handleSettingChange('notifications', 'budgetAlerts', checked)
                }
              />
            </div>

            <div className="pt-4 space-y-2">
              <Button variant="outline" onClick={handleTestNotification} className="mr-2">
                <MessageSquare className="h-4 w-4 mr-2" />
                Testuj powiadomienia push
              </Button>
              <Button 
                variant="outline" 
                onClick={handleTestEmailNotification}
                disabled={emailTestLoading}
              >
                <Mail className="h-4 w-4 mr-2" />
                {emailTestLoading ? 'Wysyłanie...' : 'Testuj email powiadomienia'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Ustawienia aplikacji */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Aplikacja mobilna
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Automatyczne zachęty do instalacji</Label>
                <p className="text-sm text-muted-foreground">
                  Pokazuj zachęty do instalacji aplikacji na urządzeniu
                </p>
              </div>
              <Switch
                checked={settings.app.autoInstallPrompt}
                onCheckedChange={(checked) =>
                  handleSettingChange('app', 'autoInstallPrompt', checked)
                }
              />
            </div>

            {canInstall && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label>Instalacja aplikacji</Label>
                  <p className="text-sm text-muted-foreground">
                    Zainstaluj ZSS jako aplikację na swoim urządzeniu dla lepszej wydajności
                  </p>
                  <Button onClick={handleInstallApp} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Zainstaluj aplikację ZSS
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Ustawienia wyglądu */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Wygląd
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Motyw kolorystyczny</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={theme === 'light' ? 'default' : 'outline'}
                  onClick={() => setTheme('light')}
                  size="sm"
                >
                  Jasny
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  onClick={() => setTheme('dark')}
                  size="sm"
                >
                  Ciemny
                </Button>
                <Button
                  variant={theme === 'system' ? 'default' : 'outline'}
                  onClick={() => setTheme('system')}
                  size="sm"
                >
                  Systemowy
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Panel administratora - powiadomienia email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Panel administratora - Testy powiadomień
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Testowanie funkcji powiadomień email przez Appwrite Messaging z Mailgun
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                ℹ️ Instrukcje konfiguracji:
              </h4>
              <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
                <li>Skonfiguruj Provider Mailgun w Appwrite Messaging</li>
                <li>Skopiuj Provider ID i wklej w <code className="bg-blue-200 dark:bg-blue-800 px-1 rounded">notifications.ts</code></li>
                <li>Użyj przycisków poniżej do testowania</li>
              </ol>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status konfiguracji</Label>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Wymaga konfiguracji Provider ID</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Pliki dokumentacji</Label>
                <div className="text-sm text-muted-foreground">
                  📄 <code>POWIADOMIENIA_SETUP.md</code> - pełna instrukcja
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <Button 
                variant="outline" 
                onClick={handleTestEmailNotification}
                disabled={emailTestLoading}
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                {emailTestLoading ? 'Wysyłanie testu...' : 'Wyślij test powiadomienia email'}
              </Button>
              
              <div className="text-xs text-muted-foreground text-center">
                Test zostanie wysłany do wszystkich zweryfikowanych użytkowników z adresem email
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Przycisk zapisz */}
        <div className="flex justify-end">
          <Button onClick={handleSaveSettings} disabled={isLoading}>
            {isLoading ? 'Zapisywanie...' : 'Zapisz ustawienia'}
          </Button>
        </div>
      </div>
    </div>
  );
}
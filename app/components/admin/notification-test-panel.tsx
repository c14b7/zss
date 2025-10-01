"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NotificationService } from '@/lib/notifications';
import { VoteService, type Vote } from '@/lib/appwrite';
import { Mail, Send, Clock, BarChart, Users } from 'lucide-react';

export function NotificationTestPanel() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<string>('');
  const [activeVotes, setActiveVotes] = useState<Vote[]>([]);
  const [testEmail, setTestEmail] = useState('');

  // Pobierz aktywne głosowania
  const loadActiveVotes = async () => {
    const votes = await VoteService.getAll();
    const active = votes.filter(vote => VoteService.isVoteActive(vote));
    setActiveVotes(active);
  };

  // Test wysyłania powiadomienia o nowym głosowaniu
  const testNewVoteNotification = async (vote: Vote) => {
    setIsLoading(true);
    setTestResult('🔄 Wysyłanie powiadomienia o nowym głosowaniu...');
    
    try {
      const success = await NotificationService.sendVoteNotification(vote);
      if (success) {
        setTestResult('✅ Powiadomienie o nowym głosowaniu wysłane pomyślnie!');
      } else {
        setTestResult('❌ Błąd podczas wysyłania powiadomienia o nowym głosowaniu');
      }
    } catch (error) {
      setTestResult(`❌ Błąd: ${error}`);
    }
    
    setIsLoading(false);
  };

  // Test wysyłania przypomnienia
  const testReminderNotification = async (vote: Vote, hours: number) => {
    setIsLoading(true);
    setTestResult(`🔄 Wysyłanie przypomnienia (${hours}h przed końcem)...`);
    
    try {
      const success = await NotificationService.sendVoteReminderNotification(vote, hours);
      if (success) {
        setTestResult(`✅ Przypomnienie (${hours}h) wysłane pomyślnie!`);
      } else {
        setTestResult(`❌ Błąd podczas wysyłania przypomnienia`);
      }
    } catch (error) {
      setTestResult(`❌ Błąd: ${error}`);
    }
    
    setIsLoading(false);
  };

  // Test wysyłania wyników
  const testResultsNotification = async (vote: Vote) => {
    setIsLoading(true);
    setTestResult('🔄 Wysyłanie wyników głosowania...');
    
    try {
      const success = await NotificationService.sendVoteResultsNotification(vote);
      if (success) {
        setTestResult('✅ Wyniki głosowania wysłane pomyślnie!');
      } else {
        setTestResult('❌ Błąd podczas wysyłania wyników');
      }
    } catch (error) {
      setTestResult(`❌ Błąd: ${error}`);
    }
    
    setIsLoading(false);
  };

  // Test schedulera przypomnień
  const testScheduler = async () => {
    setIsLoading(true);
    setTestResult('🔄 Uruchamianie scheduler przypomnień...');
    
    try {
      await NotificationService.scheduleVoteReminders();
      setTestResult('✅ Scheduler przypomnień uruchomiony pomyślnie!');
    } catch (error) {
      setTestResult(`❌ Błąd schedulera: ${error}`);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Panel Testowy Powiadomień</h2>
          <p className="text-muted-foreground">
            Testowanie funkcji powiadomień email przez Appwrite Messaging
          </p>
        </div>
        <Button onClick={loadActiveVotes} variant="outline" size="sm">
          <Users className="w-4 h-4 mr-2" />
          Odśwież głosowania
        </Button>
      </div>

      {/* Status powiadomień */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Status Systemu Powiadomień
          </CardTitle>
          <CardDescription>
            Sprawdź konfigurację i dostępność systemu powiadomień
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Provider</Badge>
              <span className="text-sm">Mailgun (via Appwrite)</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Status</Badge>
              <Badge variant="outline">Skonfigurowane</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Typ</Badge>
              <span className="text-sm">HTML Email</span>
            </div>
          </div>
          
          <div className="pt-4">
            <Button onClick={testScheduler} disabled={isLoading} variant="outline">
              <Clock className="w-4 h-4 mr-2" />
              Test Scheduler Przypomnień
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Aktywne głosowania */}
      <Card>
        <CardHeader>
          <CardTitle>Aktywne Głosowania</CardTitle>
          <CardDescription>
            Testuj powiadomienia dla istniejących głosowań
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeVotes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Brak aktywnych głosowań</p>
              <p className="text-sm">Utwórz nowe głosowanie, aby przetestować powiadomienia</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeVotes.map((vote) => (
                <div key={(vote as any).$id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{vote.title}</h4>
                      <p className="text-sm text-muted-foreground">{vote.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Kategoria: {vote.category} • Kończy się: {new Date(vote.deadline).toLocaleString('pl-PL')}
                      </p>
                    </div>
                    <Badge variant={vote.isFinished ? 'secondary' : 'default'}>
                      {vote.isFinished ? 'Zakończone' : 'Aktywne'}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testNewVoteNotification(vote)}
                      disabled={isLoading}
                    >
                      <Send className="w-3 h-3 mr-1" />
                      Test: Nowe głosowanie
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testReminderNotification(vote, 24)}
                      disabled={isLoading}
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      Test: Przypomnienie 24h
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testReminderNotification(vote, 2)}
                      disabled={isLoading}
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      Test: Przypomnienie 2h
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testResultsNotification(vote)}
                      disabled={isLoading}
                    >
                      <BarChart className="w-3 h-3 mr-1" />
                      Test: Wyniki
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Wynik testów */}
      {testResult && (
        <Card>
          <CardHeader>
            <CardTitle>Wynik Testu</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={testResult}
              readOnly
              className="min-h-[100px] font-mono text-sm"
            />
          </CardContent>
        </Card>
      )}

      {/* Instrukcje */}
      <Card>
        <CardHeader>
          <CardTitle>Instrukcje Konfiguracji</CardTitle>
          <CardDescription>
            Krok po kroku instrukcje konfiguracji powiadomień
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">1. Konfiguracja Provider'a w Appwrite:</h4>
            <p className="text-sm text-muted-foreground">
              • Przejdź do Appwrite Console → Messaging → Providers<br />
              • Dodaj nowego provider'a typu Email (Mailgun)<br />
              • Skopiuj Provider ID
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">2. Aktualizacja kodu:</h4>
            <p className="text-sm text-muted-foreground">
              • Otwórz plik <code className="bg-muted px-1 rounded">app/lib/notifications.ts</code><br />
              • Znajdź zmienną <code className="bg-muted px-1 rounded">MAILGUN_PROVIDER_ID</code><br />
              • Zamień 'YOUR_MAILGUN_PROVIDER_ID' na rzeczywiste ID
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">3. Testowanie:</h4>
            <p className="text-sm text-muted-foreground">
              • Użyj przycisków powyżej do testowania<br />
              • Sprawdź logi w konsoli deweloperskiej<br />
              • Zweryfikuj dostarczenie emaili
            </p>
          </div>
          
          <Badge variant="outline" className="mt-4">
            💡 Pamiętaj: Powiadomienia są wysyłane tylko do zweryfikowanych użytkowników z adresem email
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}

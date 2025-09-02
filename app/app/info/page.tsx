"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Megaphone, Wrench } from "lucide-react";

export default function InfoPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Megaphone className="h-12 w-12 text-muted-foreground" />
              <Wrench className="h-6 w-6 text-orange-500 absolute -top-1 -right-1" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Moduł Informacji</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Ten moduł jest obecnie w trakcie rozwoju i aktualizacji.
          </p>
          <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <p className="text-sm text-orange-700 dark:text-orange-300">
              🚧 <strong>W trakcie prac</strong>
              <br />
              Funkcjonalność zostanie przywrócona wkrótce.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Przepraszamy za niedogodności. Pracujemy nad ulepszeniami.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/*
SKOMENTOWANY ORYGINALNY KOD MODUŁU INFO/OGŁOSZENIA
================================================

Poniżej znajduje się oryginalny kod modułu info/ogłoszenia, który został 
tymczasowo wyłączony podczas prac rozwojowych. Kod zawiera pełną funkcjonalność 
zarządzania ogłoszeniami z wykorzystaniem Appwrite.

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Client, Databases, Query } from "appwrite"
import { 
  Search, Filter, Calendar, User, Eye, Clock, Pin,
  AlertCircle, CheckCircle, Info, Globe, Users, Building
} from "lucide-react"
import { toast } from "sonner"

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("687abe96000d2d31f914")

const databases = new Databases(client)

interface Announcement {
  $id: string
  title: string
  content: string
  excerpt: string
  author: string
  authorName: string
  status: 'current' | 'archived' | 'draft' | 'scheduled'
  category: 'general' | 'urgent' | 'meeting' | 'system' | 'hr' | 'finance'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  viewCount: number
  expirationDate?: string
  publishDate: string
  tags: string[]
  targetAudience: 'all' | 'employees' | 'managers' | 'board'
  $createdAt: string
  $updatedAt: string
}

POZOSTAŁA CZĘŚĆ KODU (około 500+ linii) została również skomentowana
i zostanie przywrócona po zakończeniu prac rozwojowych.

Kod zawierał m.in.:
- Funkcje zarządzania ogłoszeniami (fetchAnnouncements, incrementViewCount)
- Interfejs użytkownika z filtrami i wyszukiwaniem
- Wyświetlanie ogłoszeń w kartach z kategoriami i priorytetami
- Obsługę statusów, tagów i grup docelowych
- Paginację i sortowanie
- Integrację z systemem Appwrite

*/

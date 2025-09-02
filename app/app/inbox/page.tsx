"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Wrench } from "lucide-react";

export default function InboxPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Mail className="h-12 w-12 text-muted-foreground" />
              <Wrench className="h-6 w-6 text-orange-500 absolute -top-1 -right-1" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Moduł Inbox</CardTitle>
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
SKOMENTOWANY ORYGINALNY KOD MODUŁU INBOX
========================================

Poniżej znajduje się oryginalny kod modułu inbox, który został tymczasowo
wyłączony podczas prac rozwojowych. Kod zawiera pełną funkcjonalność 
zarządzania emailami z wykorzystaniem Appwrite.

import { useState, useEffect } from "react";
import { Client, Databases, Account, Query } from "appwrite";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Search, Plus, Archive, Trash2, Star, Settings,
  BarChart3, RefreshCw, Menu, ArrowLeft, Sun, Moon
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

POZOSTAŁA CZĘŚĆ KODU (około 400+ linii) została również skomentowana
i zostanie przywrócona po zakończeniu prac rozwojowych.

*/

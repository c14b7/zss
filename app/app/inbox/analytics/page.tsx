"use client";

import { useState, useEffect } from "react";
import { Client, Databases, Query } from "appwrite";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Mail, 
  TrendingUp, 
  Clock, 
  Star,
  Archive,
  ArrowLeft,
  BarChart3,
  PieChart
} from "lucide-react";
import Link from "next/link";

const endpoint = 'https://fra.cloud.appwrite.io/v1'
const projectId = '687abe96000d2d31f914'
const APPWRITE_DATABASE_ID = 'votes'
const APPWRITE_EMAILS_COLLECTION_ID = 'emails'

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId);

const databases = new Databases(client);

interface AnalyticsData {
  totalEmails: number;
  unreadEmails: number;
  starredEmails: number;
  sentEmails: number;
  emailsThisWeek: number;
  emailsThisMonth: number;
  averageResponseTime: number;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalEmails: 0,
    unreadEmails: 0,
    starredEmails: 0,
    sentEmails: 0,
    emailsThisWeek: 0,
    emailsThisMonth: 0,
    averageResponseTime: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      // Import IDs from a shared config instead of using env

      // Fetch all emails
      const allEmails = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        APPWRITE_EMAILS_COLLECTION_ID
      );

      // Fetch unread emails
      const unreadEmails = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        APPWRITE_EMAILS_COLLECTION_ID,
        [Query.equal("isRead", false)]
      );

      // Fetch starred emails
      const starredEmails = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        APPWRITE_EMAILS_COLLECTION_ID,
        [Query.equal("isStarred", true)]
      );

      // Calculate time-based analytics
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const thisWeekEmails = allEmails.documents.filter(email => 
        new Date(email.$createdAt) >= oneWeekAgo
      );

      const thisMonthEmails = allEmails.documents.filter(email => 
        new Date(email.$createdAt) >= oneMonthAgo
      );

      setAnalytics({
        totalEmails: allEmails.total,
        unreadEmails: unreadEmails.total,
        starredEmails: starredEmails.total,
        sentEmails: allEmails.documents.filter(email => email.type === "sent").length,
        emailsThisWeek: thisWeekEmails.length,
        emailsThisMonth: thisMonthEmails.length,
        averageResponseTime: 2.5 // Mock data for now
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/inbox">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-semibold">Analityka</h1>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Wszystkie wiadomości
                  </CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalEmails}</div>
                  <p className="text-xs text-muted-foreground">
                    Łączna liczba wiadomości
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Nieprzeczytane
                  </CardTitle>
                  <div className="h-2 w-2 bg-primary rounded-full" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.unreadEmails}</div>
                  <p className="text-xs text-muted-foreground">
                    Wymagają uwagi
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Oznaczone gwiazdką
                  </CardTitle>
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.starredEmails}</div>
                  <p className="text-xs text-muted-foreground">
                    Ważne wiadomości
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Wysłane
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.sentEmails}</div>
                  <p className="text-xs text-muted-foreground">
                    Łączna liczba wysłanych
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Ten tydzień
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {analytics.emailsThisWeek}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Nowych wiadomości w tym tygodniu
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Ten miesiąc
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {analytics.emailsThisMonth}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Nowych wiadomości w tym miesiącu
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Archive className="h-5 w-5" />
                    Średni czas odpowiedzi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">
                    {analytics.averageResponseTime}h
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Średni czas reakcji na wiadomości
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Podsumowanie aktywności</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Wskaźnik przeczytania</span>
                    <span className="font-semibold">
                      {((analytics.totalEmails - analytics.unreadEmails) / analytics.totalEmails * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Wiadomości oznaczone gwiazdką</span>
                    <span className="font-semibold">
                      {(analytics.starredEmails / analytics.totalEmails * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Aktywność tego miesiąca</span>
                    <span className="font-semibold">
                      {analytics.emailsThisMonth > analytics.emailsThisWeek * 4 ? "Wysoka" : "Średnia"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

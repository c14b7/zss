'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Client, Databases, Query } from 'appwrite';

export function UrgentAnnouncementsBadge() {
  const [urgentCount, setUrgentCount] = useState(0);

  useEffect(() => {
    fetchUrgentCount();
  }, []);

  const fetchUrgentCount = async () => {
    try {
      const client = new Client()
        .setEndpoint('https://cloud.appwrite.io/v1')
        .setProject('676b2af40008104b1e7f');

      const databases = new Databases(client);

      const response = await databases.listDocuments(
        'votes',
        'announcements',
        [
          Query.equal('status', 'current'),
          Query.or([
            Query.equal('priority', 'urgent'),
            Query.contains('tags', 'pilne')
          ]),
          Query.limit(10)
        ]
      );

      setUrgentCount(response.total);
    } catch (error) {
      console.error('❌ Błąd przy pobieraniu pilnych ogłoszeń:', error);
      // Mock fallback
      setUrgentCount(1);
    }
  };

  if (urgentCount === 0) return null;

  return (
    <Badge 
      variant="destructive" 
      className="absolute -top-1 -right-1 h-5 min-w-5 text-xs font-bold animate-pulse"
    >
      {urgentCount}
    </Badge>
  );
}

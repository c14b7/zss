'use client';

import { useState } from 'react';
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AnnouncementFiltersProps {
  searchQuery: string;
  filterCategory: string;
  filterStatus: string;
  sortOrder: 'asc' | 'desc';
  onSearchChange: (query: string) => void;
  onCategoryChange: (category: string) => void;
  onStatusChange: (status: string) => void;
  onSortChange: (order: 'asc' | 'desc') => void;
  totalCount: number;
  filteredCount: number;
  urgentCount?: number;
}

const CATEGORIES = [
  { value: 'all', label: 'Wszystkie kategorie' },
  { value: 'general', label: 'Ogólne' },
  { value: 'urgent', label: 'Pilne' },
  { value: 'meeting', label: 'Spotkania' },
  { value: 'system', label: 'System' },
  { value: 'hr', label: 'HR' },
  { value: 'finance', label: 'Finanse' },
];

const STATUSES = [
  { value: 'all', label: 'Wszystkie' },
  { value: 'current', label: 'Aktualne' },
  { value: 'archived', label: 'Archiwalne' },
  { value: 'draft', label: 'Szkice' },
  { value: 'scheduled', label: 'Zaplanowane' },
];

export function AnnouncementFilters({
  searchQuery,
  filterCategory,
  filterStatus,
  sortOrder,
  onSearchChange,
  onCategoryChange,
  onStatusChange,
  onSortChange,
  totalCount,
  filteredCount,
  urgentCount = 0,
}: AnnouncementFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card>
      <CardContent className="p-4">
        {/* Quick Stats */}
        <div className="flex items-center gap-4 mb-4">
          <Badge variant="secondary" className="text-xs">
            Wszystkich: {totalCount}
          </Badge>
          <Badge variant="default" className="text-xs">
            Wyświetlanych: {filteredCount}
          </Badge>
          {urgentCount > 0 && (
            <Badge variant="destructive" className="text-xs animate-pulse">
              Pilnych: {urgentCount}
            </Badge>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Szukaj w ogłoszeniach..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Advanced Filters Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mb-4 w-full"
        >
          <Filter className="h-4 w-4 mr-2" />
          {isExpanded ? 'Ukryj filtry' : 'Pokaż filtry'}
        </Button>

        {/* Advanced Filters */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Kategoria
              </label>
              <Select value={filterCategory} onValueChange={onCategoryChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Status
              </label>
              <Select value={filterStatus} onValueChange={onStatusChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Sortowanie
              </label>
              <Button
                variant="outline"
                onClick={() => onSortChange(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="w-full justify-start"
              >
                {sortOrder === 'asc' ? (
                  <SortAsc className="h-4 w-4 mr-2" />
                ) : (
                  <SortDesc className="h-4 w-4 mr-2" />
                )}
                {sortOrder === 'asc' ? 'Najstarsze pierwsze' : 'Najnowsze pierwsze'}
              </Button>
            </div>
          </div>
        )}

        {/* Active Filters Summary */}
        {(filterCategory !== 'all' || filterStatus !== 'current' || searchQuery.trim()) && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Aktywne filtry:</span>
              
              {filterCategory !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  Kategoria: {CATEGORIES.find(c => c.value === filterCategory)?.label}
                </Badge>
              )}
              
              {filterStatus !== 'current' && (
                <Badge variant="secondary" className="text-xs">
                  Status: {STATUSES.find(s => s.value === filterStatus)?.label}
                </Badge>
              )}
              
              {searchQuery.trim() && (
                <Badge variant="secondary" className="text-xs">
                  Wyszukiwanie: "{searchQuery}"
                </Badge>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onSearchChange('');
                  onCategoryChange('all');
                  onStatusChange('current');
                }}
                className="text-xs h-6 px-2"
              >
                Wyczyść wszystkie
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

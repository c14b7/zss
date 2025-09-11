"use client";

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  FileImage, 
  FileText, 
  Calendar,
  BarChart3,
  Clock
} from 'lucide-react';
import { Bar, BarChart, XAxis, YAxis } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { 
  exportToPNG, 
  exportToJPG, 
  exportToPDF, 
  getVotingStatusText,
  getGenerationTimestamp,
  VoteSummaryData 
} from '@/lib/vote-export';
import { Vote, VoteOption } from '@/lib/appwrite';

interface VotingSummaryGeneratorProps {
  vote: Vote;
  onClose: () => void;
}

interface ChartDataItem {
  option: string;
  votes: number;
  percentage: number;
  fill: string;
  label: string;
  value: number;
}

// Konfiguracja kolorów dla wykresu
const chartConfig = {
  votes: {
    label: "Głosy",
  },
  za: {
    label: "Za",
    color: "hsl(142, 76%, 36%)", // Zielony
  },
  przeciw: {
    label: "Przeciw", 
    color: "hsl(0, 84%, 60%)", // Czerwony
  },
  wstrzymuje: {
    label: "Wstrzymuje się",
    color: "hsl(47, 96%, 53%)", // Żółty
  },
  inne: {
    label: "Inne",
    color: "hsl(210, 40%, 60%)", // Niebieski
  },
} satisfies ChartConfig;

export function VotingSummaryGenerator({ vote, onClose }: VotingSummaryGeneratorProps) {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  // Przygotowanie danych wykresu
  const options: VoteOption[] = JSON.parse(vote.options);
  const results = JSON.parse(vote.results);
  
  const chartData: ChartDataItem[] = options.map((option) => {
    const votes = results[option.value.toString()] || 0;
    const percentage = vote.totalVotes > 0 ? (votes / vote.totalVotes) * 100 : 0;
    
    // Mapowanie kolorów na podstawie wartości opcji
    let colorKey = "inne";
    if (option.value === 1) colorKey = "za";
    else if (option.value === -1) colorKey = "przeciw";
    else if (option.value === 0) colorKey = "wstrzymuje";
    
    return {
      option: option.label,
      votes,
      percentage: Math.round(percentage * 10) / 10,
      fill: (chartConfig[colorKey as keyof typeof chartConfig] as any)?.color || (chartConfig.inne as any).color,
      label: option.label,
      value: option.value
    };
  }).sort((a, b) => b.votes - a.votes);

  const winningOption = chartData[0];
  const statusInfo = getVotingStatusText(vote.deadline, vote.isFinished);
  const generationTime = getGenerationTimestamp();

  // Określenie czy głosowanie jest zakończone
  const isFinished = vote.isFinished || new Date(vote.deadline) < new Date();
  const endDate = vote.isFinished && vote.endedAt 
    ? new Date(vote.endedAt).toLocaleDateString('pl-PL')
    : new Date(vote.deadline).toLocaleDateString('pl-PL');

  const handleExport = async (format: 'png' | 'jpg' | 'pdf') => {
    if (!summaryRef.current) return;
    
    setIsExporting(true);
    try {
      const filename = `podsumowanie-glosowania-${vote.$id}-${Date.now()}`;
      
      switch (format) {
        case 'png':
          await exportToPNG(summaryRef.current, filename);
          break;
        case 'jpg':
          await exportToJPG(summaryRef.current, filename);
          break;
        case 'pdf':
          await exportToPDF(summaryRef.current, filename);
          break;
      }
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Formularz konfiguracji */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Generator podsumowania wyników głosowania</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Duży tekst (tytuł)</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Wprowadź tytuł podsumowania..."
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Mały tekst (opis)</label>
                <Textarea
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Wprowadź opis lub dodatkowe informacje..."
                  className="mt-1"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Podgląd podsumowania */}
          <div ref={summaryRef} className="bg-white p-8 border rounded-lg mb-6">
            {/* Header z tytułem */}
            {title && (
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
                {subtitle && (
                  <p className="text-lg text-gray-600">{subtitle}</p>
                )}
              </div>
            )}

            {/* Informacje o głosowaniu */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-xl">{vote.title}</CardTitle>
                    <p className="text-gray-600">{vote.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <Badge variant="secondary">{vote.category}</Badge>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Termin: {new Date(vote.deadline).toLocaleDateString('pl-PL')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <Badge 
                      variant="secondary" 
                      className={`${statusInfo.bgColor} ${statusInfo.color}`}
                    >
                      {statusInfo.text}
                    </Badge>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {isFinished ? `Zakończono: ${endDate}` : `Wygenerowano: ${generationTime}`}
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Wykres wyników */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Wyniki głosowania
                </CardTitle>
                <p className="text-gray-600">
                  Rozkład głosów w ankiecie - łącznie {vote.totalVotes} głosów
                </p>
              </CardHeader>
              <CardContent>
                {vote.totalVotes > 0 ? (
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <BarChart
                      accessibilityLayer
                      data={chartData}
                      layout="vertical"
                      margin={{ left: 80, right: 20, top: 20, bottom: 20 }}
                    >
                      <YAxis
                        dataKey="option"
                        type="category"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        width={70}
                      />
                      <XAxis 
                        dataKey="votes" 
                        type="number" 
                        hide 
                      />
                      <ChartTooltip
                        cursor={false}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload as ChartDataItem;
                            return (
                              <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
                                <p className="font-medium">{data.label}</p>
                                <p className="text-sm text-gray-600">
                                  {data.votes} głosów ({data.percentage}%)
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar 
                        dataKey="votes" 
                        layout="vertical" 
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <div className="flex items-center justify-center h-32 text-gray-500">
                    <div className="text-center">
                      <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Brak głosów do wyświetlenia</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Szczegółowe statystyki */}
            <Card>
              <CardHeader>
                <CardTitle>Szczegółowe statystyki</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {chartData.map((item, index) => (
                    <div key={item.option}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.fill }}
                          />
                          <span className="font-medium">{item.label}</span>
                          <Badge variant={index === 0 ? "default" : "secondary"}>
                            {index === 0 ? "Prowadzi" : `${index + 1}. miejsce`}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold">{item.votes}</div>
                          <div className="text-sm text-gray-600">{item.percentage}%</div>
                        </div>
                      </div>
                      {index < chartData.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Przyciski akcji */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={onClose}>
              Zamknij
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => handleExport('png')}
                disabled={isExporting}
                className="flex items-center gap-2"
              >
                <FileImage className="w-4 h-4" />
                Pobierz PNG
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleExport('jpg')}
                disabled={isExporting}
                className="flex items-center gap-2"
              >
                <FileImage className="w-4 h-4" />
                Pobierz JPG
              </Button>
              <Button 
                onClick={() => handleExport('pdf')}
                disabled={isExporting}
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Pobierz PDF
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
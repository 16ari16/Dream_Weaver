
"use client";

import React from 'react';
import type { Dream } from '@/types';
import { DreamCard } from './dream-card';
// Removed: import { ScrollArea } from '@/components/ui/scroll-area'; // Removed ScrollArea
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ListCollapse } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface DreamTimelineProps {
  dreams: Dream[];
  onDeleteDream: (id: string) => void; 
  onUpdateDream: (id: string, updates: Partial<Omit<Dream, 'id'>>) => void; 
}

export function DreamTimeline({ dreams, onDeleteDream, onUpdateDream }: DreamTimelineProps) {
  const { t } = useLanguage();

  if (dreams.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
           <CardTitle className="text-2xl font-semibold text-primary flex items-center">
             <ListCollapse className="mr-2 h-6 w-6 animate-float" /> {t('dreamTimeline.title')}
            </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-muted-foreground">
            <p className="text-lg mb-2">{t('dreamTimeline.emptyJournal')}</p>
            <p>{t('dreamTimeline.emptyJournalPrompt')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-primary flex items-center">
           <ListCollapse className="mr-2 h-6 w-6 animate-float" /> {t('dreamTimeline.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Removed ScrollArea with fixed height */}
        <div className="space-y-4">
          {dreams.map(dream => (
            <DreamCard key={dream.id} dream={dream} onDelete={onDeleteDream} onUpdate={onUpdateDream} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

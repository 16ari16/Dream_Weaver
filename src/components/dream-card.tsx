
"use client";

import React, { useState } from 'react';
import type { Dream } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Eye, Feather, Waves, Route, CalendarDays, BookOpen, MessageSquare } from 'lucide-react';
import { format, parseISO } from 'date-fns';
// Removed: import { ru } from 'date-fns/locale';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext'; // Новый импорт

interface DreamCardProps {
  dream: Dream;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Omit<Dream, 'id'>>) => void;
}

const moodIcons: { [key: string]: React.ElementType } = {
  happy: () => <span role="img" aria-label="happy">😊</span>,
  sad: () => <span role="img" aria-label="sad">😢</span>,
  anxious: () => <span role="img" aria-label="anxious">😟</span>,
  mysterious: () => <span role="img" aria-label="mysterious">🤔</span>,
  neutral: () => <span role="img" aria-label="neutral">😐</span>,
  default: MessageSquare,
};

export function DreamCard({ dream, onDelete, onUpdate }: DreamCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { t, dateLocale } = useLanguage(); // Hook для переводов и локали даты

  const handleDelete = () => {
    onDelete(dream.id);
  };

  const DreamIcon = dream.category === 'Flying' ? Feather :
                    dream.category === 'Water' ? Waves :
                    dream.category === 'Journey' ? Route :
                    BookOpen;
  
  const MoodIcon = moodIcons[dream.mood?.toLowerCase() || 'default'] || moodIcons['default'];

  const parsedDate = parseISO(dream.date);
  const formattedDateForTitle = format(parsedDate, 'PPP', { locale: dateLocale });
  const fullFormattedDate = format(parsedDate, 'PPPPpppp', { locale: dateLocale });

  const cardTitle = dream.title || t('dreamCard.dreamFromDate', { date: formattedDateForTitle });

  return (
    <Card className="shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl text-primary-foreground flex items-center" style={{color: 'hsl(var(--primary-foreground))'}}>
              <DreamIcon className="mr-2 h-5 w-5 text-accent" />
              {cardTitle}
            </CardTitle>
            <CardDescription className="text-xs flex items-center mt-1">
              <CalendarDays className="mr-1 h-3 w-3" /> {fullFormattedDate}
            </CardDescription>
          </div>
          {dream.mood && (
            <Badge variant="outline" className="ml-2 flex items-center gap-1 text-sm">
               <MoodIcon className="h-4 w-4" /> {dream.mood}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm line-clamp-3 mb-2">{dream.summary || dream.dreamDetails}</p>
        {dream.tags && dream.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {dream.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
            {dream.tags.length > 3 && <Badge variant="secondary" className="text-xs">{t('dreamCard.moreTags', { count: dream.tags.length - 3 })}</Badge>}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm"><Eye className="mr-1 h-4 w-4" /> {t('dreamCard.viewButton')}</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-2xl text-primary flex items-center">
                 <DreamIcon className="mr-2 h-6 w-6 text-accent" />
                {cardTitle}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {fullFormattedDate}
                {dream.mood && ` | ${t('dreamCard.moodPrefix')} ${dream.mood}`}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-4 py-4">
                <div>
                  <h4 className="font-semibold text-lg mb-1 text-accent-foreground">{t('dreamCard.dreamDetailsTitle')}</h4>
                  <p className="text-sm whitespace-pre-wrap">{dream.dreamDetails}</p>
                </div>
                {dream.culturalContext && (
                  <div>
                    <h4 className="font-semibold text-lg mb-1 text-accent-foreground">{t('dreamCard.culturalContextTitle')}</h4>
                    <p className="text-sm whitespace-pre-wrap">{dream.culturalContext}</p>
                  </div>
                )}
                {dream.interpretation && (
                  <div>
                    <h4 className="font-semibold text-lg mb-1 text-accent-foreground">{t('dreamCard.aiInterpretationTitle')}</h4>
                    <p className="text-sm whitespace-pre-wrap">{dream.interpretation}</p>
                  </div>
                )}
                {dream.summary && (
                  <div>
                    <h4 className="font-semibold text-lg mb-1 text-accent-foreground">{t('dreamCard.aiSummaryTitle')}</h4>
                    <p className="text-sm whitespace-pre-wrap">{dream.summary}</p>
                  </div>
                )}
                {dream.category && (
                  <div>
                    <h4 className="font-semibold text-lg mb-1 text-accent-foreground">{t('dreamCard.aiCategoryTitle')}</h4>
                    <Badge variant="secondary">{dream.category}</Badge>
                  </div>
                )}
                {dream.tags && dream.tags.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-lg mb-1 text-accent-foreground">{t('dreamCard.aiTagsTitle')}</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {dream.tags.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm"><Trash2 className="mr-1 h-4 w-4" /> {t('dreamCard.deleteButton')}</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('dreamCard.deleteConfirmationTitle')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('dreamCard.deleteConfirmationDescription')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('dreamCard.cancelButton')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>{t('dreamCard.confirmDeleteButton')}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}

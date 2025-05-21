
"use client";

import React from 'react';
import { DreamEntryForm } from '@/components/dream-entry-form';
import { DreamTimeline } from '@/components/dream-timeline';
import { useDreamStore } from '@/hooks/useDreamStore';
import type { Dream } from '@/types';
import { MoonStar, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useLanguage } from '@/contexts/LanguageContext';

export default function HomePage() {
  const { dreams, addDream, updateDream, deleteDream, isInitialized } = useDreamStore();
  const isMobile = useIsMobile();
  const { t } = useLanguage(); // Вызываем useLanguage безусловно

  const handleDreamSaved = (newDreamData: Omit<Dream, 'id' | 'date'>) => {
    try {
      addDream(newDreamData);
    } catch (error) {
      console.error("Failed to save dream from HomePage:", error);
    }
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <MoonStar className="h-12 w-12 text-primary animate-spin" />
        {/* Используем текст из t() или жестко закодированный, если t еще не готов с нужными переводами */}
        <p className="ml-4 text-xl text-foreground">{t('homePage.loading') || 'Loading Dream Weaver...'}</p>
      </div>
    );
  }

  const leftPanelContent = (
    <DreamEntryForm onDreamSaved={handleDreamSaved} />
  );

  const rightPanelContent = (
    <DreamTimeline dreams={dreams} onDeleteDream={deleteDream} onUpdateDream={updateDream} />
  );

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 p-4 shadow-md bg-card border-b">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-primary flex items-center">
            <MoonStar className="mr-3 h-8 w-8 animate-float" />
            {t('header.title')}
          </h1>
          <div className="flex items-center gap-2">
            <ThemeToggleButton />
            <LanguageSwitcher />
            {isMobile && (
               <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0 overflow-y-auto">
                  <SheetHeader className="p-4 border-b sticky top-0 bg-card z-10">
                     <SheetTitle className="text-2xl text-primary flex items-center">
                       <MoonStar className="mr-2 h-6 w-6" /> {t('header.menu')}
                     </SheetTitle>
                  </SheetHeader>
                  <div className="p-4">
                    {leftPanelContent}
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-6">
        {isMobile ? (
          <div className="space-y-6">
            {/* On mobile, DreamEntryForm is in the sheet, only timeline is here */}
            {rightPanelContent}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8 items-start">
            <div className="sticky top-[calc(theme(spacing.16)+1.5rem)] h-[calc(100vh-theme(spacing.16)-3rem)] overflow-y-auto pr-2">
              {/* Adjust top value based on actual header height if needed, spacing.16 is 4rem (64px) approx */}
              {/* Added h-screen with offset and overflow-y-auto for form panel scrolling */}
              {leftPanelContent}
            </div>
            <div>
              {rightPanelContent}
            </div>
          </div>
        )}
      </main>

      <footer className="p-4 text-center text-xs text-muted-foreground border-t">
        {t('homePage.footerText', { year: new Date().getFullYear() })}
      </footer>
    </div>
  );
}

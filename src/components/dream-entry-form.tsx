
"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Loader2, Mic, Wand2, Save, MicOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { analyzeDream } from '@/ai/flows/dream-analyzer';
import type { AnalyzeDreamOutput } from '@/ai/flows/dream-analyzer';
import { aiDreamJournal } from '@/ai/flows/ai-dream-journal';
import type { AiDreamJournalOutput } from '@/ai/flows/ai-dream-journal';
import type { Dream, DreamFormValues } from '@/types';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext'; 

interface DreamEntryFormProps {
  onDreamSaved: (dream: Omit<Dream, 'id' | 'date'>) => void; 
}

export function DreamEntryForm({ onDreamSaved }: DreamEntryFormProps) {
  const { t, language } = useLanguage(); 

  const dreamFormSchema = useMemo(() => z.object({
    title: z.string().optional(),
    dreamDetails: z.string().min(10, { message: t('dreamForm.dreamDetailsError') }),
    culturalContext: z.string().optional(),
    mood: z.string().optional(),
  }), [t]);
  
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeDreamOutput | null>(null);
  const [journalData, setJournalData] = useState<AiDreamJournalOutput | null>(null);
  const [currentDreamDetails, setCurrentDreamDetails] = useState<DreamFormValues | null>(null);
  const { toast } = useToast();

  const [isListening, setIsListening] = useState(false);
  const [speechRecognitionError, setSpeechRecognitionError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);


  const form = useForm<DreamFormValues>({
    resolver: zodResolver(dreamFormSchema),
    defaultValues: {
      title: '',
      dreamDetails: '',
      culturalContext: '',
      mood: '',
    },
  });
  
  useEffect(() => {
    if (Object.keys(form.formState.errors).length > 0) {
      form.clearErrors();
    }
    form.trigger();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, form.trigger, dreamFormSchema]); 


  const handleVoiceJournalClick = () => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      toast({ title: t('dreamForm.errorToastTitle'), description: t('dreamForm.speechRecognitionNotSupported'), variant: "destructive" });
      setSpeechRecognitionError(t('dreamForm.speechRecognitionNotSupported'));
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognitionAPI();
    const recognition = recognitionRef.current;

    if (!recognition) return;

    recognition.lang = language === 'ru' ? 'ru-RU' : 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
      setSpeechRecognitionError(null);
      toast({ title: t('dreamForm.listeningToastTitle'), description: t('dreamForm.listeningToastDescription') });
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      const currentDetails = form.getValues("dreamDetails");
      form.setValue("dreamDetails", (currentDetails ? currentDetails.trim() + " " : "") + transcript, {
        shouldValidate: true,
        shouldDirty: true
      });
      toast({ title: t('dreamForm.textAddedToastTitle'), description: t('dreamForm.textAddedToastDescription')});
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      let errorMessageKey = 'dreamForm.speechRecognitionError';
      let logAsErrorToConsole = true;

      if (event.error === 'no-speech') {
        errorMessageKey = "dreamForm.speechRecognitionNoSpeech";
        logAsErrorToConsole = false; 
      } else if (event.error === 'audio-capture') {
        errorMessageKey = "dreamForm.speechRecognitionAudioCaptureError";
      } else if (event.error === 'not-allowed') {
        errorMessageKey = "dreamForm.speechRecognitionNotAllowed";
        logAsErrorToConsole = false;
      }
      
      if (logAsErrorToConsole) {
        console.error("Ошибка распознавания речи:", event.error);
      }

      const errorMessage = t(errorMessageKey);
      setSpeechRecognitionError(errorMessage);
      toast({ title: t('dreamForm.errorToastTitle'), description: errorMessage, variant: "destructive" });
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error("Ошибка запуска распознавания:", e);
      setSpeechRecognitionError(t('dreamForm.speechRecognitionStartError'));
      toast({ title: t('dreamForm.errorToastTitle'), description: t('dreamForm.speechRecognitionStartError'), variant: "destructive" });
      setIsListening(false);
    }
  };

  const onSubmit = async (data: DreamFormValues) => {
    setIsAiProcessing(true);
    setAnalysisResult(null);
    setJournalData(null);
    setCurrentDreamDetails(data);

    try {
      toast({ title: t('dreamForm.analyzingToastTitle'), description: t('dreamForm.analyzingToastDescription') });
      
      const interpretationPromise = analyzeDream({
        dreamDetails: data.dreamDetails,
        culturalContext: data.culturalContext || undefined,
      });
      const journalPromise = aiDreamJournal({
        dreamText: data.dreamDetails,
      });

      const [interpretationResult, dreamJournalResult] = await Promise.all([interpretationPromise, journalPromise]);

      setAnalysisResult(interpretationResult);
      toast({ title: t('dreamForm.interpretationReadyToastTitle'), variant: "default" });

      setJournalData(dreamJournalResult);
      toast({ title: t('dreamForm.categorizedToastTitle'), variant: "default" });

    } catch (error) {
      console.error("Ошибка обработки сна:", error);
      toast({
        title: t('dreamForm.errorToastTitle'),
        description: t('dreamForm.errorToastDescription'),
        variant: "destructive",
      });
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleSaveToJournal = () => { 
    if (!currentDreamDetails || !analysisResult || !journalData) {
      toast({ title: t('dreamForm.saveErrorToastTitle'), description: t('dreamForm.saveErrorToastDescription'), variant: "destructive" });
      return;
    }
    setIsSaving(true);
    const newDream: Omit<Dream, 'id' | 'date'> = {
      title: currentDreamDetails.title,
      dreamDetails: currentDreamDetails.dreamDetails,
      culturalContext: currentDreamDetails.culturalContext,
      mood: currentDreamDetails.mood,
      interpretation: analysisResult.interpretation,
      tags: journalData.tags,
      category: journalData.category,
      summary: journalData.summary,
    };
    try {
      onDreamSaved(newDream); 
      toast({ title: t('dreamForm.savingToastTitle'), description: t('dreamForm.savingToastDescription') });
      form.reset();
      setAnalysisResult(null);
      setJournalData(null);
      setCurrentDreamDetails(null);
      setSpeechRecognitionError(null);
    } catch (error) {
      console.error("Ошибка сохранения сна:", error);
       toast({ title: t('dreamForm.saveErrorToastTitle'), description: t('dreamForm.saveErrorToastDescription'), variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const isProcessing = isAiProcessing || isSaving;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-primary flex items-center">
          <Wand2 className="mr-2 h-6 w-6 animate-float" /> {t('dreamForm.newDreamTitle')}
        </CardTitle>
        <CardDescription>{t('dreamForm.newDreamDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">{t('dreamForm.titleLabel')}</Label>
            <Input id="title" {...form.register("title")} placeholder={t('dreamForm.titlePlaceholder')} disabled={isProcessing} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dreamDetails">{t('dreamForm.dreamDetailsLabel')}</Label>
            <Textarea
              id="dreamDetails"
              {...form.register("dreamDetails")}
              placeholder={t('dreamForm.dreamDetailsPlaceholder')}
              rows={6}
              className="resize-none"
              disabled={isProcessing}
            />
            {form.formState.errors.dreamDetails && (
              <p className="text-sm text-destructive">{form.formState.errors.dreamDetails.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="culturalContext">{t('dreamForm.culturalContextLabel')}</Label>
            <Input
              id="culturalContext"
              {...form.register("culturalContext")}
              placeholder={t('dreamForm.culturalContextPlaceholder')}
              disabled={isProcessing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mood">{t('dreamForm.moodLabel')}</Label>
            <Input id="mood" {...form.register("mood")} placeholder={t('dreamForm.moodPlaceholder')} disabled={isProcessing}/>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleVoiceJournalClick}
              disabled={isProcessing || isListening}
              aria-label={isListening ? t('dreamForm.stopRecordingButton') : t('dreamForm.voiceJournalButton')}
            >
              {isListening ? (
                <>
                  <MicOff className="mr-2 h-4 w-4 animate-pulse" /> {t('dreamForm.stopRecordingButton')}
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-4 w-4" /> {t('dreamForm.voiceJournalButton')}
                </>
              )}
            </Button>
            <Button type="submit" className="flex-1" disabled={isProcessing || isListening}>
              {isAiProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              {t('dreamForm.analyzeButton')}
            </Button>
          </div>
          {speechRecognitionError && (
            <p className="text-sm text-destructive mt-2">{speechRecognitionError}</p>
          )}
        </form>

        {(analysisResult || journalData) && !isAiProcessing && (
          <div className="mt-8 space-y-6 pt-6 border-t">
            {analysisResult && (
              <div>
                <h3 className="text-xl font-semibold mb-2 text-accent-foreground">{t('dreamForm.interpretationSectionTitle')}</h3>
                 <ScrollArea className="h-[150px] rounded-md border p-3 bg-secondary/30">
                    <p className="text-sm whitespace-pre-wrap">{analysisResult.interpretation}</p>
                 </ScrollArea>
              </div>
            )}
            {journalData && (
              <div>
                <h3 className="text-xl font-semibold mb-2 text-accent-foreground">{t('dreamForm.aiAnalyticsSectionTitle')}</h3>
                 <div className="space-y-1">
                  <div className="text-sm"><strong className="font-medium">{t('dreamForm.summaryLabel')}</strong> {journalData.summary}</div>
                  <div className="text-sm"><strong className="font-medium">{t('dreamForm.categoryLabel')}</strong> <Badge variant="secondary">{journalData.category}</Badge></div>
                  <div className="text-sm mt-1">
                    <strong className="font-medium">{t('dreamForm.tagsLabel')}</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {journalData.tags.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}
                    </div>
                  </div>
                </div>
              </div>
            )}
             <Button onClick={handleSaveToJournal} disabled={isSaving || isAiProcessing || !currentDreamDetails} className="w-full mt-4">
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
               {t('dreamForm.saveButton')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


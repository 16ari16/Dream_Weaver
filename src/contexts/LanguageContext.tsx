
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Locale } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';

// Define default messages to prevent breaking the app if translations are not loaded
const defaultRuTranslations: Record<string, string> = {
  "header.title": "Ткач Снов",
  "languageSwitcher.currentLanguage": "RU",
  "languageSwitcher.switchToEnglish": "EN",
  // Add other essential keys that might be used on initial load
  "homePage.loading": "Загрузка Ткача Снов...",
  "header.menu": "Меню",
  "homePage.footerText": "© {year} Ткач Снов. Исследуйте гобелен вашего разума.",
};

const defaultEnTranslations: Record<string, string> = {
  "header.title": "Dream Weaver",
  "languageSwitcher.currentLanguage": "EN",
  "languageSwitcher.switchToRussian": "RU",
  // Add other essential keys
  "homePage.loading": "Loading Dream Weaver...",
  "header.menu": "Menu",
  "homePage.footerText": "© {year} Dream Weaver. Explore the tapestry of your mind.",
};

interface LanguageContextProps {
  language: 'ru' | 'en';
  setLanguage: (language: 'ru' | 'en') => void;
  t: (key: string, interpolations?: Record<string, string | number>) => string;
  dateLocale: Locale;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<'ru' | 'en'>('ru');
  const [translations, setTranslations] = useState<Record<string, string>>(defaultRuTranslations);
  const [dateLocale, setDateLocale] = useState<Locale>(ru);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedLang = localStorage.getItem('app-language') as 'ru' | 'en' | null;
    if (storedLang) {
      setLanguageState(storedLang);
    } else {
      const browserLang = typeof navigator !== 'undefined' ? navigator.language.split('-')[0] : 'ru';
      if (browserLang === 'en') {
        setLanguageState('en');
      }
      // Default is 'ru'
    }
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    localStorage.setItem('app-language', language);
    if (typeof document !== 'undefined') {
        document.documentElement.lang = language;
    }

    const loadTranslations = async () => {
      try {
        if (language === 'ru') {
          const module = await import('@/locales/ru.json');
          setTranslations(module.default);
          setDateLocale(ru);
        } else {
          const module = await import('@/locales/en.json');
          setTranslations(module.default);
          setDateLocale(enUS);
        }
      } catch (error) {
        console.error("Failed to load translations:", error);
        // Fallback to default translations if loading fails
        setTranslations(language === 'ru' ? defaultRuTranslations : defaultEnTranslations);
        setDateLocale(language === 'ru' ? ru : enUS);
      }
    };

    loadTranslations();

  }, [language, isMounted]);

  const setLanguage = useCallback((lang: 'ru' | 'en') => {
    setLanguageState(lang);
  }, []);

  const t = useCallback((key: string, interpolations?: Record<string, string | number>): string => {
    let translation = translations[key] || key;
    if (interpolations) {
      Object.keys(interpolations).forEach(interKey => {
        const regex = new RegExp(`{${interKey}}`, 'g');
        translation = translation.replace(regex, String(interpolations[interKey]));
      });
    }
    return translation;
  }, [translations]);
  
  const contextValue = {
    language,
    setLanguage,
    t,
    dateLocale,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

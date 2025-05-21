
"use client";

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react'; // Using a generic language icon

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleLanguage = () => {
    setLanguage(language === 'ru' ? 'en' : 'ru');
  };

  if (!isMounted) {
    // Render a placeholder or null on the server/initial client render
    // to avoid hydration mismatch.
    return <Button variant="ghost" size="icon" disabled className="h-[1.2rem] w-[1.2rem]" />;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      aria-label={language === 'ru' ? t('languageSwitcher.aria.switchToEnglish') : t('languageSwitcher.aria.switchToRussian')}
      className="flex items-center gap-1"
    >
      <Languages className="h-4 w-4" />
      {language === 'ru' ? t('languageSwitcher.switchToEnglish') : t('languageSwitcher.switchToRussian')}
    </Button>
  );
}

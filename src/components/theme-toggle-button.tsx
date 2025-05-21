
'use client';

import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider';
import { useEffect, useState } from 'react';

export function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render a placeholder or null on the server/initial client render
    // to avoid hydration mismatch for the icon.
    // The button itself can be rendered, but its icon depends on the theme.
    return <Button variant="ghost" size="icon" disabled className="h-[1.2rem] w-[1.2rem]" />;
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Переключить тему">
      {theme === 'light' ? <Moon className="h-[1.2rem] w-[1.2rem]" /> : <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-100" />}
      <span className="sr-only">Переключить тему</span>
    </Button>
  );
}

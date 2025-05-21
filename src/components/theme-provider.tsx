
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';

type Theme = 'light' | 'dark';
const THEME_STORAGE_KEY = 'dream-weaver-theme';

interface ThemeContextProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeInternal] = useState<Theme>('light'); // Default for SSR and initial client render before useEffect
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // Component has mounted on client
    try {
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      if (storedTheme) {
        setThemeInternal(storedTheme);
      } else {
        // Default to system preference if no theme is stored
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setThemeInternal(systemPrefersDark ? 'dark' : 'light');
      }
    } catch (error) {
      // localStorage might be unavailable (e.g., in incognito iframe or SSR)
      // Fallback to system preference or a default
      console.warn('Could not access localStorage for theme:', error);
      if (typeof window !== 'undefined') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setThemeInternal(systemPrefersDark ? 'dark' : 'light');
      } else {
        setThemeInternal('light'); // Default for SSR if window is not defined
      }
    }
  }, []);

  useEffect(() => {
    if (!mounted) return; // Don't run this effect on server or before initial theme is set from localStorage

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
        console.warn('Could not save theme to localStorage:', error);
    }
  }, [theme, mounted]);

  const setTheme = useCallback((newTheme: Theme) => {
    if (mounted) { // Ensure this only runs client-side after mount
      setThemeInternal(newTheme);
    }
  }, [mounted]);

  const toggleTheme = useCallback(() => {
    if (mounted) { // Ensure this only runs client-side after mount
      setThemeInternal(prev => (prev === 'light' ? 'dark' : 'light'));
    }
  }, [mounted]);
  
  const contextValue = {
    theme: theme, // Provide the current theme, will update after mount
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

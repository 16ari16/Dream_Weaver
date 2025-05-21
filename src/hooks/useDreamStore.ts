
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Dream } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const LOCAL_STORAGE_KEY = 'dreamWeaverDreams';

export function useDreamStore() {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load dreams from localStorage on initial mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedDreams = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedDreams) {
          const parsedDreams: Dream[] = JSON.parse(storedDreams);
          // Ensure dates are correctly parsed and sorted
          setDreams(parsedDreams.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        } else {
          setDreams([]); // Initialize with empty array if nothing in localStorage
        }
      } catch (error) {
        console.error("Failed to load dreams from localStorage", error);
        setDreams([]); // Fallback to empty array on error
      } finally {
        setIsInitialized(true);
      }
    }
  }, []);

  // Save dreams to localStorage whenever the dreams state changes
  useEffect(() => {
    if (typeof window !== 'undefined' && isInitialized) { // Only save after initial load
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dreams));
      } catch (error) {
        console.error("Failed to save dreams to localStorage", error);
      }
    }
  }, [dreams, isInitialized]);

  const addDream = useCallback((newDreamData: Omit<Dream, 'id' | 'date'> & { date?: string }): Dream => {
    const dateToStore = newDreamData.date ? new Date(newDreamData.date) : new Date();
    const newDream: Dream = {
      ...newDreamData,
      id: uuidv4(),
      date: dateToStore.toISOString(),
    };
    setDreams((prevDreams) =>
      [newDream, ...prevDreams].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );
    return newDream;
  }, []);

  const updateDream = useCallback((id: string, updates: Partial<Omit<Dream, 'id'>>) => {
    setDreams((prevDreams) =>
      prevDreams.map((dream) =>
        dream.id === id ? { ...dream, ...updates, id } : dream
      ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );
  }, []);

  const deleteDream = useCallback((id: string) => {
    setDreams((prevDreams) => prevDreams.filter((dream) => dream.id !== id));
  }, []);

  const getDreamById = useCallback((id: string): Dream | undefined => {
    return dreams.find(dream => dream.id === id);
  }, [dreams]);

  return { dreams, addDream, updateDream, deleteDream, getDreamById, isInitialized, setDreams };
}

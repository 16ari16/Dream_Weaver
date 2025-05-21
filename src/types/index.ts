
export interface Dream {
  id: string;
  date: string; // ISO string for app-level consistency
  title?: string;
  dreamDetails: string;
  culturalContext?: string;
  interpretation?: string;
  tags?: string[];
  category?: string;
  summary?: string;
  mood?: string; // e.g., "happy", "sad", "anxious", "neutral"
  // Any other user-specific fields can be added here
}

// For the dream entry form
export interface DreamFormValues {
  dreamDetails: string;
  culturalContext?: string;
  title?: string;
  mood?: string;
}

// DreamFirestoreRecord is removed as Firebase is no longer used.

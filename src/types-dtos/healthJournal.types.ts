export interface HealthJournalEntry {
  id: string;
  date: string; // ISO date string
  photoUrl: string;
  score: number; // 0–100
  assessment: string; // AI-generated in Spanish
  steps: string[]; // AI-generated action steps in Spanish
  notes: string; // user notes (empty string if none)
}

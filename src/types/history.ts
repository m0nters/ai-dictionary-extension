import { ParsedTranslation } from "./translation";

export interface HistoryEntry {
  id: string;
  timestamp: number;
  translation: ParsedTranslation;
}

export interface HistoryState {
  entries: HistoryEntry[];
  searchQuery: string;
  selectedEntry: HistoryEntry | null;
}

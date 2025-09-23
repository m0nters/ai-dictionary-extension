import { ParsedTranslation } from "./translation";

export interface HistoryEntry {
  id: string;
  timestamp: number;
  translation: ParsedTranslation;
  pinnedAt?: number;
}

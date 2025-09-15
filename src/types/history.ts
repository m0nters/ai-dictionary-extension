import { ParsedTranslation } from "./translation";

export interface HistoryEntry {
  id: string;
  timestamp: number;
  translation: ParsedTranslation;
  pinned?: boolean;
  pinnedAt?: number;
}

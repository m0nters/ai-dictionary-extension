import { HistoryEntry, ParsedTranslation } from "@/types";
import { isPhraseTranslation, isSingleWordTranslation } from "@/utils";

const HISTORY_STORAGE_KEY = "translationHistory";
const MAX_HISTORY_ENTRIES = 20;

export class HistoryService {
  /**
   * Save a new translation to history
   * Maintains maximum of 20 entries, removing oldest when necessary
   */
  static async saveTranslation(translation: ParsedTranslation): Promise<void> {
    try {
      const entries = await this.getHistory();

      // Create new entry
      const newEntry: HistoryEntry = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        translation,
      };

      // Add new entry at the beginning (most recent first)
      const updatedEntries = [newEntry, ...entries];

      // Keep only the most recent 20 entries
      const trimmedEntries = updatedEntries.slice(0, MAX_HISTORY_ENTRIES);

      // Save to chrome storage
      await chrome.storage.local.set({ [HISTORY_STORAGE_KEY]: trimmedEntries });
    } catch (error) {
      console.error("Failed to save translation to history:", error);
    }
  }

  /**
   * Retrieve all history entries
   */
  static async getHistory(): Promise<HistoryEntry[]> {
    try {
      const result = await chrome.storage.local.get([HISTORY_STORAGE_KEY]);
      return result[HISTORY_STORAGE_KEY] || [];
    } catch (error) {
      console.error("Failed to retrieve history:", error);
      return [];
    }
  }

  /**
   * Search history entries based on query
   * Searches in word/text content and language codes
   */
  static async searchHistory(query: string): Promise<HistoryEntry[]> {
    const entries = await this.getHistory();

    if (!query.trim()) {
      return entries;
    }

    const searchTerm = query.toLowerCase();

    return entries.filter((entry) => {
      const { translation } = entry;

      if (isSingleWordTranslation(translation)) {
        return translation.word.toLowerCase().includes(searchTerm);
      } else {
        return translation.text.toLowerCase().includes(searchTerm);
      }
    });
  }

  /**
   * Get a specific history entry by ID
   */
  static async getHistoryEntry(id: string): Promise<HistoryEntry | null> {
    const entries = await this.getHistory();
    return entries.find((entry) => entry.id === id) || null;
  }

  /**
   * Clear all history
   */
  static async clearHistory(): Promise<void> {
    try {
      await chrome.storage.local.remove([HISTORY_STORAGE_KEY]);
    } catch (error) {
      console.error("Failed to clear history:", error);
    }
  }

  /**
   * Remove a specific history entry
   */
  static async removeHistoryEntry(id: string): Promise<void> {
    try {
      const entries = await this.getHistory();
      const updatedEntries = entries.filter((entry) => entry.id !== id);
      await chrome.storage.local.set({ [HISTORY_STORAGE_KEY]: updatedEntries });
    } catch (error) {
      console.error("Failed to remove history entry:", error);
    }
  }

  /**
   * Get display text for history entry (for list view)
   */
  static getDisplayText(entry: HistoryEntry): {
    primaryText: string;
    secondaryText: string;
  } {
    const { translation } = entry;

    if (isSingleWordTranslation(translation)) {
      const pronunciation = translation.meanings[0]?.pronunciation; // take the first meaning as example for displaying

      let ipa = "";
      if (typeof pronunciation === "string") {
        ipa = pronunciation;
      } else if (pronunciation) {
        // Show both US and UK if available
        const variants = [];
        if (pronunciation.US) variants.push(`US: ${pronunciation.US}`);
        if (pronunciation.UK) variants.push(`UK: ${pronunciation.UK}`);
        ipa = variants.join(" | ");
      }

      return {
        primaryText: translation.word,
        secondaryText: ipa ? `${ipa}` : "",
      };
    } else if (isPhraseTranslation(translation)) {
      // Truncate long text with ellipsis
      const maxLength = 30;
      const truncatedText =
        translation.text.length > maxLength
          ? translation.text.substring(0, maxLength) + "..."
          : translation.text;

      return {
        primaryText: truncatedText,
        secondaryText: "",
      };
    }

    return {
      primaryText: "Unknown translation",
      secondaryText: "",
    };
  }
}

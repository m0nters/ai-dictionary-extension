import type { SearchOperator, SearchOperatorType } from "@/constants";
import { SEARCH_OPERATOR_REGEX } from "@/constants";
import { HistoryEntry, ParsedTranslation } from "@/types";
import { isPhraseTranslation, isSingleWordTranslation } from "@/utils";

const HISTORY_STORAGE_KEY = "translationHistory";
const MAX_HISTORY_ENTRIES = 20;

/**
 * Save a new translation to history
 * Maintains maximum of `MAX_HISTORY_ENTRIES` entries, removing oldest when necessary
 */
export const saveTranslation = async (
  translation: ParsedTranslation,
): Promise<void> => {
  try {
    const entries = await getHistory();

    // Create new entry
    const newEntry: HistoryEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      translation,
    };

    // Add new entry at the beginning (most recent first)
    const updatedEntries = [newEntry, ...entries];

    // Keep only the most recent 20 entries
    const trimmedEntries = updatedEntries.slice(0, MAX_HISTORY_ENTRIES);

    // Save to chrome storage
    await chrome.storage.sync.set({ [HISTORY_STORAGE_KEY]: trimmedEntries });
  } catch (error) {
    console.error("Failed to save translation to history:", error);
  }
};

/**
 * Retrieve all history entries
 */
export const getHistory = async (): Promise<HistoryEntry[]> => {
  try {
    const result = await chrome.storage.sync.get([HISTORY_STORAGE_KEY]);
    return result[HISTORY_STORAGE_KEY] || [];
  } catch (error) {
    console.error("Failed to retrieve history:", error);
    return [];
  }
};

/**
 * Parse search operators from query
 * Supports: source:langcode, target:langcode
 */
const parseSearchOperators = (
  query: string,
): {
  operators: SearchOperator[];
  remainingText: string;
} => {
  const operators: SearchOperator[] = [];
  let remainingText = query;

  // Use the shared regex pattern
  const operatorRegex = new RegExp(SEARCH_OPERATOR_REGEX);
  let match;

  while ((match = operatorRegex.exec(query)) !== null) {
    const operatorType = match[1].toLowerCase() as SearchOperatorType;
    const langCode = match[2].toLowerCase();

    operators.push({ type: operatorType, value: langCode });

    // Remove this operator from the remaining text
    remainingText = remainingText.replace(match[0], "").trim();
  }

  return { operators, remainingText };
};

/**
 * Search history entries based on query with support for search operators
 * Supports operators: source:langcode, target:langcode
 * Examples: "source:en hello", "target:vi", "source:en target:zh translation"
 */
export const searchHistory = async (query: string): Promise<HistoryEntry[]> => {
  const entries = await getHistory();

  if (!query.trim()) {
    return entries;
  }

  const { operators, remainingText } = parseSearchOperators(query);
  const searchTerm = remainingText.toLowerCase();

  return entries.filter((entry) => {
    const { translation } = entry;

    // Check search operators
    for (const operator of operators) {
      if (operator.type === "source") {
        if (translation.source_language_code.toLowerCase() !== operator.value) {
          return false;
        }
      } else if (operator.type === "target") {
        if (
          translation.translated_language_code.toLowerCase() !== operator.value
        ) {
          return false;
        }
      }
    }

    // If there's remaining text, search in content
    if (searchTerm) {
      if (isSingleWordTranslation(translation)) {
        return translation.word.toLowerCase().includes(searchTerm);
      } else if (isPhraseTranslation(translation)) {
        return translation.text.toLowerCase().includes(searchTerm);
      }
      return false;
    }

    // If only operators were used (no text search), return true
    return true;
  });
};

/**
 * Get a specific history entry by ID
 */
export const getHistoryEntry = async (
  id: string,
): Promise<HistoryEntry | null> => {
  const entries = await getHistory();
  return entries.find((entry) => entry.id === id) || null;
};

/**
 * Clear all history
 */
export const clearHistory = async (): Promise<void> => {
  try {
    await chrome.storage.sync.remove([HISTORY_STORAGE_KEY]);
  } catch (error) {
    console.error("Failed to clear history:", error);
  }
};

/**
 * Remove a specific history entry
 */
export const removeHistoryEntry = async (id: string): Promise<void> => {
  try {
    const entries = await getHistory();
    const updatedEntries = entries.filter((entry) => entry.id !== id);
    await chrome.storage.sync.set({ [HISTORY_STORAGE_KEY]: updatedEntries });
  } catch (error) {
    console.error("Failed to remove history entry:", error);
  }
};

/**
 * Get display text for history entry (for list view)
 */
export const getDisplayText = (
  entry: HistoryEntry,
): {
  primaryText: string;
  secondaryText: string;
} => {
  const { translation } = entry;

  if (isSingleWordTranslation(translation)) {
    const pronunciation = translation.meanings[0]?.pronunciation; // take the first meaning as an example for displaying only

    let ipa = "";
    if (typeof pronunciation === "string") {
      ipa = pronunciation;
    } else if (pronunciation) {
      // take one variant as an example for displaying only
      ipa = Object.values(pronunciation).find((value) => value);
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
};

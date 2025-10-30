import type { SearchOperator, SearchOperatorType } from "@/constants";
import { SEARCH_OPERATOR_REGEX } from "@/constants";
import { HistoryEntry } from "@/types";
import { isPhraseTranslation, isSingleWordTranslation } from "@/utils";
import { getHistory } from "./historyStorage";

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
  let match;

  while ((match = SEARCH_OPERATOR_REGEX.exec(query)) !== null) {
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

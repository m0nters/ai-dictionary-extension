import { HistoryEntry } from "@/types";
import { isPhraseTranslation, isSingleWordTranslation } from "@/utils";

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
      const firstVariant = Object.values(pronunciation).find((value) => value);
      // take the first IPA if multiple
      ipa = firstVariant?.ipa[0] || "";
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

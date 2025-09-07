import React from "react";

/**
 * Renders text with bold formatting for markdown-style **text** syntax
 * @param text - The text to render with potential bold formatting
 * @returns React elements with bold styling applied
 */
export const renderTextWithBold = (text: string): React.ReactNode => {
  const parts = text.split(/(\*\*.*?\*\*)/);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      // Remove the ** markers and make it bold
      const boldText = part.slice(2, -2);
      return React.createElement(
        "strong",
        { key: index, className: "font-bold text-indigo-600" },
        boldText,
      );
    }
    return part;
  });
};

/**
 * Parses a line to extract word and pronunciation variants
 * @param line - Line containing word and pronunciation (e.g., "word /pronunciation/ (UK), /pronunciation/ (US)")
 * @returns Object with word and pronunciation details
 */
export const parseWordAndPronunciation = (
  line: string,
): {
  word: string;
  singlePronunciation?: string; // For languages with one IPA (most languages)
  pronunciationVariants?: Array<{ ipa: string; region: string }>; // For languages with regional variants (like English UK/US)
} => {
  const parts = line.split(" /");
  const word = parts[0];
  const rawPronunciation = "/" + parts.slice(1).join(" /");

  // Check if there are UK/US regional variants (mainly for English)
  const regionalVariantsPattern = /\/([^/]+)\/ \(UK\), \/([^/]+)\/ \(US\)/;
  const match = rawPronunciation.match(regionalVariantsPattern);

  if (match) {
    // Multiple regional pronunciations (e.g., English with UK/US variants)
    return {
      word,
      pronunciationVariants: [
        { ipa: `/${match[1]}/`, region: "UK" },
        { ipa: `/${match[2]}/`, region: "US" },
      ],
    };
  }

  // Single pronunciation (most languages)
  return {
    word,
    singlePronunciation: rawPronunciation,
  };
};

/**
 * Parses a line to extract part of speech and meaning
 * @param line - Line containing part of speech and meaning (e.g., "(noun) meaning")
 * @returns Object with part of speech and meaning, or null if no match
 */
export const parsePartOfSpeechAndMeaning = (
  line: string,
): { partOfSpeech: string; meaning: string } | null => {
  const parts = line.match(/\(([^)]+)\)\s*(.+)/);
  if (parts) {
    return {
      partOfSpeech: parts[1],
      meaning: parts[2],
    };
  }
  return null;
};

/**
 * Parses an example sentence line
 * @param line - Example line starting with "- "
 * @returns Object with original and optional translation
 */
export const parseExampleSentence = (
  line: string,
): { original: string; translation?: string } => {
  const exampleText = line.substring(2); // Remove "- "
  const parts = exampleText.split(" → ");

  if (parts.length === 2) {
    return {
      original: parts[0].trim(),
      translation: parts[1].trim(),
    };
  } else {
    return {
      original: exampleText.trim(),
    };
  }
};

/**
 * Parses a verb conjugation line (e.g., "[VERB FORMS: bow / bowed / bowed]")
 * @param line - Line containing verb conjugations in the specified format
 * @returns Array of conjugation forms
 */
export const parseVerbConjugation = (line: string): string[] => {
  // Extract content between brackets and after "VERB FORMS:"
  const match = line.match(/\[VERB FORMS:\s*(.+?)\s*\]/);
  if (match) {
    return match[1]
      .split("/")
      .map((form) => form.trim())
      .filter((form) => form.length > 0);
  }
  return [];
};

/**
 * Checks if a line contains verb conjugations
 * @param line - The line to check
 * @returns True if line appears to be verb conjugations
 */
export const isVerbConjugationLine = (line: string): boolean => {
  return line.startsWith("[VERB FORMS:") && line.endsWith("]");
};

/**
 * Determines the type of line in translation text
 * @param line - The line to analyze
 * @returns The type of line
 */
export const getLineType = (
  line: string,
):
  | "word-pronunciation"
  | "part-of-speech"
  | "example"
  | "verb-conjugation"
  | "other" => {
  if (isVerbConjugationLine(line)) {
    return "verb-conjugation";
  } else if (line.includes("/") && !line.startsWith("- ")) {
    return "word-pronunciation";
  } else if (line.startsWith("(") && line.includes(")")) {
    return "part-of-speech";
  } else if (line.startsWith("- ")) {
    return "example";
  } else {
    return "other";
  }
};

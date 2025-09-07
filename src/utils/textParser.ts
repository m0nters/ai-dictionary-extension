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
        boldText
      );
    }
    return part;
  });
};

/**
 * Parses a line to extract word and pronunciation
 * @param line - Line containing word and pronunciation (e.g., "word /pronunciation/")
 * @returns Object with word and pronunciation
 */
export const parseWordAndPronunciation = (
  line: string
): { word: string; pronunciation: string } => {
  const parts = line.split(" /");
  const word = parts[0];
  const pronunciation = "/" + parts.slice(1).join(" /");
  return { word, pronunciation };
};

/**
 * Parses a line to extract part of speech and meaning
 * @param line - Line containing part of speech and meaning (e.g., "(noun) meaning")
 * @returns Object with part of speech and meaning, or null if no match
 */
export const parsePartOfSpeechAndMeaning = (
  line: string
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
  line: string
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
 * Determines the type of line in translation text
 * @param line - The line to analyze
 * @returns The type of line
 */
export const getLineType = (
  line: string
): "word-pronunciation" | "part-of-speech" | "example" | "other" => {
  if (line.includes("/") && !line.startsWith("- ")) {
    return "word-pronunciation";
  } else if (line.startsWith("(") && line.includes(")")) {
    return "part-of-speech";
  } else if (line.startsWith("- ")) {
    return "example";
  } else {
    return "other";
  }
};

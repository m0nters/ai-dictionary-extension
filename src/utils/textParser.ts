import {
  ParsedTranslation,
  PhraseTranslation,
  PronunciationVariants,
  SingleWordTranslation,
} from "@/types/";
import { createElement } from "react";

/**
 * Renders text with **bold** markdown as JSX
 */
const renderBoldText = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const boldText = part.slice(2, -2);
      return createElement("strong", { key: index }, boldText);
    }
    return part;
  });
};

/**
 * Renders text in total
 */
export const renderText = (text: string) => {
  // First, split by newlines
  const lines = text.split("\n");

  return lines.reduce(
    (acc, line, lineIndex) => {
      const processedLine = renderBoldText(line);
      acc.push(...processedLine);
      // Add line break if not the last line
      if (lineIndex < lines.length - 1) {
        acc.push(createElement("br", { key: `br-${lineIndex}` }));
      }

      return acc;
    },
    [] as (string | React.ReactElement)[],
  );
};

/**
 * Checks if a translation is a single word or phrase
 */
export const isSingleWordTranslation = (
  translation: ParsedTranslation,
): translation is SingleWordTranslation => {
  return "word" in translation;
};

/**
 * Checks if a translation is a phrase
 */
export const isPhraseTranslation = (
  translation: ParsedTranslation,
): translation is PhraseTranslation => {
  return "text" in translation;
};

/**
 * Checks if pronunciation has variants (UK/US)
 */
export const hasPronunciationVariants = (
  pronunciation: string | PronunciationVariants,
): pronunciation is PronunciationVariants => {
  return typeof pronunciation === "object" && pronunciation !== null;
};

/**
 * Parses the JSON translation content from the API
 */
export const parseTranslationContent = (content: string): ParsedTranslation => {
  try {
    // Extract JSON from the response (in case it's wrapped in markdown)
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    let jsonString = jsonMatch ? jsonMatch[1] : content;

    // Clean up trailing commas that make JSON invalid
    jsonString = jsonString
      .replace(/,(\s*[}\]])/g, "$1") // Remove comma before } or ]
      .replace(/,(\s*\n\s*[}\]])/g, "$1"); // Handle multi-line cases

    const parsed = JSON.parse(jsonString);

    // Use the AI-provided source language directly, with fallback if missing
    if (!parsed.source_language_code) {
      parsed.source_language_code = "unknown";
    }

    // Validate the structure
    if (parsed.word) {
      return parsed as SingleWordTranslation;
    } else if (parsed.text) {
      return parsed as PhraseTranslation;
    } else {
      throw new Error("Invalid JSON structure - missing required fields");
    }
  } catch (error) {
    console.error("Failed to parse JSON translation:", error);
    console.log("Content that failed to parse:", content);

    // Fallback: create a simple phrase translation
    return {
      text: content.substring(0, 100) + (content.length > 100 ? "..." : ""),
      translation: content,
      source_language_code: "unknown",
    } as PhraseTranslation;
  }
};

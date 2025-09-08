import { createElement } from "react";
import {
  ParsedTranslation,
  PhraseTranslation,
  PronunciationVariants,
  SingleWordTranslation,
} from "../types/translation";

/**
 * Renders text with **bold** markdown as JSX
 */
export const renderTextWithBold = (text: string) => {
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
 * Checks if a translation is a single word or phrase
 */
export const isSingleWordTranslation = (
  translation: ParsedTranslation,
): translation is SingleWordTranslation => {
  return "word" in translation && "meanings" in translation;
};

/**
 * Checks if a translation is a phrase
 */
export const isPhraseTranslation = (
  translation: ParsedTranslation,
): translation is PhraseTranslation => {
  return (
    "text" in translation &&
    "translation" in translation &&
    !("word" in translation)
  );
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
    const jsonString = jsonMatch ? jsonMatch[1] : content;

    console.log("Parsing translation content:", {
      original: content,
      extracted: jsonString,
    });

    const parsed = JSON.parse(jsonString);

    console.log("Parsed JSON:", parsed);

    // Validate the structure
    if (parsed.word && parsed.meanings) {
      // Single word translation
      console.log("Detected single word translation");
      return parsed as SingleWordTranslation;
    } else if (parsed.text && parsed.translation) {
      // Phrase translation
      console.log("Detected phrase translation");
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
    } as PhraseTranslation;
  }
};

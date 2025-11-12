import {
  ParsedTranslation,
  PhraseTranslation,
  PronunciationVariants,
  SingleWordTranslation,
} from "@/types";
import { jsonrepair } from "jsonrepair";
import Markdown from "markdown-to-jsx";
import { createElement } from "react";

/**
 * Renders text with support format using markdown-to-jsx
 */
export const renderText = (text: string) => {
  return createElement(Markdown, {
    options: {
      overrides: {
        code: {
          component: "code",
          props: {
            className:
              "bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm font-mono",
          },
        },
        a: {
          component: "a",
          props: {
            className:
              "font-semibold text-indigo-600 underline decoration-indigo-300 decoration-2 underline-offset-2 transition-colors hover:text-indigo-700 hover:decoration-indigo-400",
            target: "_blank",
            rel: "noopener noreferrer",
          },
        },
      },
    },
    children: text,
  });
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
export const parseTranslationJSON = (content: string): ParsedTranslation => {
  try {
    // Extract JSON from the response (in case it's wrapped in markdown)
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    let jsonString = jsonMatch ? jsonMatch[1] : content;

    const repairedJson = jsonrepair(jsonString); // AI generated JSON format can be malformed, this 3rd party lib repairs it
    const parsed = JSON.parse(repairedJson);

    // Validate the structure
    if (parsed.word) {
      return parsed as SingleWordTranslation;
    } else if (parsed.text) {
      return parsed as PhraseTranslation;
    } else {
      throw new Error(
        "Invalid JSON structure - can't parse this into either single word or phrase",
      );
    }
  } catch (error) {
    console.error("Failed to parse JSON translation:", error);
    console.error("Content that failed to parse:", content);

    throw new Error("Failed to parse JSON translation");
  }
};

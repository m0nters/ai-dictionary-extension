/**
 * Fallback source language info for unknown languages
 */
export const UNKNOWN_SOURCE_LANGUAGE = "Unknown";

/**
 * Gets source language info, with fallback for unknown languages
 */
export const getSourceLanguageInfo = (languageInfo?: string): string => {
  return languageInfo || UNKNOWN_SOURCE_LANGUAGE;
};

export interface SourceLanguageInfo {
  code: string;
  name: string;
}

/**
 * Fallback source language info for unknown languages
 */
export const UNKNOWN_SOURCE_LANGUAGE: SourceLanguageInfo = {
  code: "unknown",
  name: "Unknown",
};

/**
 * Gets source language info, with fallback for unknown languages
 */
export const getSourceLanguageInfo = (
  languageInfo?: SourceLanguageInfo,
): SourceLanguageInfo => {
  return languageInfo || UNKNOWN_SOURCE_LANGUAGE;
};

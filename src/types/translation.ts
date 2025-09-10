export interface TranslationResult {
  text: string;
  translation: string;
  loading: boolean;
  error?: string;
}

export interface PronunciationVariants {
  UK?: string;
  US?: string;
}

export interface ExampleSentence {
  text: string;
  pronunciation?: string; // For non-Latin languages like Chinese (pinyin), Japanese (romaji)
  translation?: string; // Optional for same-language translations
}

export interface MeaningEntry {
  pronunciation: string | PronunciationVariants;
  part_of_speech: string;
  translation?: string; // For translations to other languages
  definition?: string; // For same-language definitions
  synonyms?: string[]; // Array of synonyms in the source language
  examples: ExampleSentence[];
}

export interface SingleWordTranslation {
  word: string;
  verb_forms?: string[];
  meanings: MeaningEntry[];
  source_language?: string;
}

export interface PhraseTranslation {
  text: string;
  translation: string;
  source_language?: string;
}

export type ParsedTranslation = SingleWordTranslation | PhraseTranslation;

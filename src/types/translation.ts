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
  definition: string;
  synonyms?: string[]; // Array of synonyms in the source language
  examples: ExampleSentence[];
}

interface BaseTranslation {
  source_language_code: string;
  translated_language_code: string;
}

export interface SingleWordTranslation extends BaseTranslation {
  word: string;
  verb_forms?: string[];
  meanings: MeaningEntry[];
}

export interface PhraseTranslation extends BaseTranslation {
  text: string;
  translation: string;
}

export type ParsedTranslation = SingleWordTranslation | PhraseTranslation;

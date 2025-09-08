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
  examples: ExampleSentence[];
}

export interface SourceLanguage {
  code: string;
  name: string;
}

export interface SingleWordTranslation {
  word: string;
  verb_forms?: string[];
  meanings: MeaningEntry[];
  source_language?: SourceLanguage;
}

export interface PhraseTranslation {
  text: string;
  translation: string;
  source_language?: SourceLanguage;
}

export type ParsedTranslation = SingleWordTranslation | PhraseTranslation;

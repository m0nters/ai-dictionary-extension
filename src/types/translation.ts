export interface TranslationResult {
  text: string;
  translation: string;
  loading: boolean;
  error?: string;
}

export interface PronunciationDetail {
  ipa: string[];
  tts_code: string;
}

export interface PronunciationVariants {
  UK?: PronunciationDetail;
  US?: PronunciationDetail;
}

export interface ExampleSentence {
  text: string;
  pronunciation?: string; // For non-Latin languages like Chinese (pinyin), Japanese (romaji)
  translation?: string; // Optional for same-language translations
}

export interface SynonymGroup {
  label: string;
  items: string[];
}

export interface IdiomEntry {
  idiom: string;
  meaning: string;
  examples: ExampleSentence[];
}

export interface IdiomGroup {
  label: string;
  items: IdiomEntry[];
}

export interface PhrasalVerbEntry {
  phrasal_verb: string;
  meaning: string;
  examples: ExampleSentence[];
}

export interface PhrasalVerbGroup {
  label: string;
  items: PhrasalVerbEntry[];
}

export interface MeaningEntry {
  pronunciation: string | PronunciationVariants;
  part_of_speech: string;
  definition: string;
  synonyms?: SynonymGroup;
  idioms?: IdiomGroup;
  phrasal_verbs?: PhrasalVerbGroup;
  examples: ExampleSentence[];
}

interface BaseTranslation {
  source_language_code: string;
  translated_language_code: string;
  main_tts_language_code?: string; // undefined in case of gibberish or non-existent language
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

export interface TranslationResult {
  text: string;
  translation: string;
  loading: boolean;
  error?: string;
}

export interface DictionaryEntry {
  word: string;
  pronunciation?: string;
  partOfSpeech?: string;
  meaning?: string;
  examples?: ExampleSentence[];
}

export interface ExampleSentence {
  original: string;
  translation?: string;
}

export interface ParsedTranslation {
  sections: DictionarySection[];
}

export interface DictionarySection {
  word: string;
  pronunciation?: string;
  entries: DictionaryEntry[];
}

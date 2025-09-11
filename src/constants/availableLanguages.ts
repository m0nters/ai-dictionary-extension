export interface Language {
  code: string;
  englishName: string;
  nativeName: string;
}

export const AVAILABLE_LANGUAGES: Language[] = [
  { code: "en", englishName: "English", nativeName: "English" },
  { code: "vi", englishName: "Vietnamese", nativeName: "Tiếng Việt" },
  { code: "zh", englishName: "Chinese", nativeName: "中文" },
  { code: "ja", englishName: "Japanese", nativeName: "日本語" },
  { code: "ko", englishName: "Korean", nativeName: "한국어" },
  { code: "fr", englishName: "French", nativeName: "Français" },
  { code: "es", englishName: "Spanish", nativeName: "Español" },
  { code: "de", englishName: "German", nativeName: "Deutsch" },
];

export const DEFAULT_LANGUAGE_CODE = "en";

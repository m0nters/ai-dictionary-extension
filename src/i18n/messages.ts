// Import JSON locale files
import deMessages from "./locales/de.json";
import enMessages from "./locales/en.json";
import esMessages from "./locales/es.json";
import frMessages from "./locales/fr.json";
import jaMessages from "./locales/ja.json";
import koMessages from "./locales/ko.json";
import viMessages from "./locales/vi.json";
import zhMessages from "./locales/zh.json";

export interface TranslationMessages {
  appTitle: string;
  appSubtitle: string;
  translateTo: string;
  appLanguage: string;
  saved: string;
  howToUse: string;
  step1: string;
  step2: string;
  step3: string;
  dictionaryButton: string;
  languages: {
    vi: string;
    en: string;
    ja: string;
    ko: string;
    zh: string;
    fr: string;
    de: string;
    es: string;
  };
}

export const messages: Record<string, TranslationMessages> = {
  en: enMessages,
  vi: viMessages,
  zh: zhMessages,
  ja: jaMessages,
  ko: koMessages,
  fr: frMessages,
  es: esMessages,
  de: deMessages,
};

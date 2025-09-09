// Import JSON locale files from folder structure
import enCommon from "./locales/en/common.json";
import enLanguages from "./locales/en/languages.json";
import enPopup from "./locales/en/popup.json";
import enThankYou from "./locales/en/thankYou.json";

import viCommon from "./locales/vi/common.json";
import viLanguages from "./locales/vi/languages.json";
import viPopup from "./locales/vi/popup.json";
import viThankYou from "./locales/vi/thankYou.json";

import esCommon from "./locales/es/common.json";
import esLanguages from "./locales/es/languages.json";
import esPopup from "./locales/es/popup.json";
import esThankYou from "./locales/es/thankYou.json";

import frCommon from "./locales/fr/common.json";
import frLanguages from "./locales/fr/languages.json";
import frPopup from "./locales/fr/popup.json";
import frThankYou from "./locales/fr/thankYou.json";

import deCommon from "./locales/de/common.json";
import deLanguages from "./locales/de/languages.json";
import dePopup from "./locales/de/popup.json";
import deThankYou from "./locales/de/thankYou.json";

import jaCommon from "./locales/ja/common.json";
import jaLanguages from "./locales/ja/languages.json";
import jaPopup from "./locales/ja/popup.json";
import jaThankYou from "./locales/ja/thankYou.json";

import koCommon from "./locales/ko/common.json";
import koLanguages from "./locales/ko/languages.json";
import koPopup from "./locales/ko/popup.json";
import koThankYou from "./locales/ko/thankYou.json";

import zhCommon from "./locales/zh/common.json";
import zhLanguages from "./locales/zh/languages.json";
import zhPopup from "./locales/zh/popup.json";
import zhThankYou from "./locales/zh/thankYou.json";

export interface TranslationMessages {
  // Popup/App context
  appTitle: string;
  appSubtitle: string;
  translateTo: string;
  appLanguage: string;
  detectedLanguage: string;
  saved: string;
  extensionDisabled: string;
  toggleToEnable: string;

  // Common context
  howToUse: string;
  step1: string;
  step2: string;
  step3: string;
  dictionaryButton: string;
  loading: string;
  noTranslationAvailable: string;
  selectTextToTranslate: string;
  on: string;
  off: string;

  // Thank You page context
  thankYou: {
    title: string;
    subtitle: string;
    featuresTitle: string;
    features: {
      aiTranslation: {
        title: string;
        description: string;
      };
      multiLanguage: {
        title: string;
        description: string;
      };
      professional: {
        title: string;
        description: string;
      };
      everywhere: {
        title: string;
        description: string;
      };
    };
    usageDescription: string;
    author: string;
  };

  // Languages context
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

// Helper function to merge translations
function mergeTranslations(
  popup: any,
  common: any,
  thankYou: any,
  languages: any,
): TranslationMessages {
  return {
    ...popup,
    ...common,
    thankYou,
    languages,
  };
}

export const messages: Record<string, TranslationMessages> = {
  en: mergeTranslations(enPopup, enCommon, enThankYou, enLanguages),
  vi: mergeTranslations(viPopup, viCommon, viThankYou, viLanguages),
  es: mergeTranslations(esPopup, esCommon, esThankYou, esLanguages),
  fr: mergeTranslations(frPopup, frCommon, frThankYou, frLanguages),
  de: mergeTranslations(dePopup, deCommon, deThankYou, deLanguages),
  ja: mergeTranslations(jaPopup, jaCommon, jaThankYou, jaLanguages),
  ko: mergeTranslations(koPopup, koCommon, koThankYou, koLanguages),
  zh: mergeTranslations(zhPopup, zhCommon, zhThankYou, zhLanguages),
};

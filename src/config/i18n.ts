import i18n from "i18next";
import Backend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";
import {
  AVAILABLE_LANGUAGES,
  DEFAULT_LANGUAGE_CODE,
} from "../constants/availableLanguages";

// Define namespaces
export const NAMESPACES = ["common", "popup", "languages", "thankYou"];

// i18n configuration
i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    lng: DEFAULT_LANGUAGE_CODE,
    fallbackLng: "en",

    // Namespaces configuration
    ns: NAMESPACES,
    defaultNS: "common",

    // Backend configuration
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
      addPath: "/locales/{{lng}}/{{ns}}.missing.json",
    },

    // Interpolation options
    interpolation: {
      escapeValue: false, // React already does escaping
    },

    // React specific options
    react: {
      useSuspense: false, // Better for extension environment
    },

    // Chrome extension specific setup
    load: "currentOnly", // Only load current language to reduce bundle size
    preload: [DEFAULT_LANGUAGE_CODE], // Preload default language

    // Only allow supported languages
    supportedLngs: AVAILABLE_LANGUAGES.map((lang) => lang.code),

    // Fallback configuration
    saveMissing: process.env.NODE_ENV === "development",
    saveMissingTo: "current",
  });

// Custom function to change language and save to Chrome storage
export const changeLanguage = async (languageCode: string) => {
  try {
    await i18n.changeLanguage(languageCode);

    // Save to Chrome storage if available
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.sync.set({ appLangCode: languageCode });
    }
  } catch (error) {
    console.error("Failed to change language:", error);
  }
};

export default i18n;

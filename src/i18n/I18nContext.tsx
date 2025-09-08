import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { APP_LANGUAGES, DEFAULT_APP_LANGUAGE } from "../constants/appLanguage";
import { messages, TranslationMessages } from "./messages";

interface I18nContextType {
  currentLanguage: string;
  messages: TranslationMessages;
  changeLanguage: (languageCode: string) => void;
  availableLanguages: typeof APP_LANGUAGES;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState(DEFAULT_APP_LANGUAGE);

  useEffect(() => {
    // Load saved app language from Chrome storage
    chrome.storage.sync.get(["appLanguage"], (data) => {
      if (data.appLanguage && messages[data.appLanguage]) {
        setCurrentLanguage(data.appLanguage);
      }
    });
  }, []);

  const changeLanguage = (languageCode: string) => {
    if (messages[languageCode]) {
      setCurrentLanguage(languageCode);

      // Save to Chrome storage
      chrome.storage.sync.set({ appLanguage: languageCode });
    }
  };

  const contextValue: I18nContextType = {
    currentLanguage,
    messages: messages[currentLanguage] || messages[DEFAULT_APP_LANGUAGE],
    changeLanguage,
    availableLanguages: APP_LANGUAGES,
  };

  return (
    <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>
  );
}

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
};

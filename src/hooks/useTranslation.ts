import {
  DEFAULT_LANGUAGE_CODE,
  DEFAULT_SOURCE_LANGUAGE_CODE,
} from "@/constants/";
import { saveTranslation, translateWithGemini } from "@/services/";
import { TranslationResult } from "@/types/";
import { parseTranslationContent, updatePopupHeight } from "@/utils/";
import { useEffect, useState } from "react";

/**
 * Custom hook for managing translation state and functionality
 */
export const useTranslation = () => {
  const [result, setResult] = useState<TranslationResult>({
    text: "",
    translation: "",
    loading: false,
  });
  const [translatedLangCode, setTranslatedLangCode] = useState(
    DEFAULT_LANGUAGE_CODE,
  );
  const [sourceLangCode, setSourceLangCode] = useState(
    DEFAULT_SOURCE_LANGUAGE_CODE,
  );

  // Load saved language settings from Chrome storage
  useEffect(() => {
    chrome.storage.sync.get(
      ["translatedLangCode", "sourceLangCode"],
      (data) => {
        if (data.translatedLangCode) {
          setTranslatedLangCode(data.translatedLangCode);
        }
        if (data.sourceLangCode) {
          setSourceLangCode(data.sourceLangCode);
        }
      },
    );
  }, []);

  /**
   * Translates text using the current translated language
   */
  const translateText = async (text: string) => {
    setResult({
      text,
      translation: "",
      loading: true,
      error: undefined,
    });

    try {
      // Get the most current language codes from storage to avoid stale state issues
      const {
        translatedLangCode: currentTranslatedLangCode,
        sourceLangCode: currentSourceLangCode,
      } = await chrome.storage.sync.get([
        "translatedLangCode",
        "sourceLangCode",
      ]);
      const translatedLang = currentTranslatedLangCode || DEFAULT_LANGUAGE_CODE;
      const sourceLang = currentSourceLangCode || DEFAULT_SOURCE_LANGUAGE_CODE;

      const translation = await translateWithGemini(
        text,
        translatedLang,
        sourceLang,
      );

      setResult((prev) => ({
        ...prev,
        translation,
        loading: false,
      }));

      // Parse and save translation to history
      try {
        const parsedTranslation = parseTranslationContent(translation);
        if (parsedTranslation) {
          await saveTranslation(parsedTranslation);
        }
      } catch (historyError) {
        console.error("Failed to save translation to history:", historyError);
        // Don't fail the translation if history saving fails
      }

      // Update popup height after translation is set
      updatePopupHeight();
    } catch (error) {
      setResult((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Translation failed",
      }));

      // Update popup height after error is set
      updatePopupHeight();
    }
  };

  return {
    result,
    translatedLangCode,
    sourceLangCode,
    translateText,
  };
};

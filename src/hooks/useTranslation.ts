import { useEffect, useState } from "react";
import { translateWithGemini } from "../services/translationService";
import { TranslationResult } from "../types/translation";
import { updatePopupHeight } from "../utils/popupHeight";

/**
 * Custom hook for managing translation state and functionality
 */
export const useTranslation = () => {
  const [result, setResult] = useState<TranslationResult>({
    text: "",
    translation: "",
    loading: false,
  });
  const [translatedLanguage, setTranslatedLanguage] = useState("vi");

  // Load saved translated language from Chrome storage
  useEffect(() => {
    chrome.storage.sync.get(["translatedLanguage"], (data) => {
      if (data.translatedLanguage) {
        setTranslatedLanguage(data.translatedLanguage);
      }
    });
  }, []);

  // Update popup height whenever result changes
  useEffect(() => {
    updatePopupHeight();
  }, [result]);

  // Additional height update after DOM changes are complete
  useEffect(() => {
    if (result.translation && !result.loading) {
      // Wait a bit longer for all DOM updates to complete
      const timer = setTimeout(() => {
        updatePopupHeight();
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [result.translation, result.loading]);

  /**
   * Translates text using the current translated language
   */
  const translateText = async (text: string) => {
    // Get the latest translated language and app language from storage to avoid closure issues
    const storageData = await new Promise<{
      translatedLanguage?: string;
      appLanguage?: string;
    }>((resolve) => {
      chrome.storage.sync.get(["translatedLanguage", "appLanguage"], (data) => {
        resolve(data);
      });
    });

    const currentTranslatedLanguage = storageData.translatedLanguage || "vi";
    const currentAppLanguage = storageData.appLanguage || "en";

    // Update state if it's different
    if (currentTranslatedLanguage !== translatedLanguage) {
      setTranslatedLanguage(currentTranslatedLanguage);
    }

    setResult((prev) => ({
      ...prev,
      text,
      translation: "",
      loading: true,
      error: undefined,
    }));

    try {
      const translation = await translateWithGemini(
        text,
        currentTranslatedLanguage,
        currentAppLanguage,
      );

      setResult((prev) => ({
        ...prev,
        translation,
        loading: false,
      }));

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
    translatedLanguage,
    translateText,
    setResult,
  };
};

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
  const [targetLanguage, setTargetLanguage] = useState("vi");

  // Load saved target language from Chrome storage
  useEffect(() => {
    chrome.storage.sync.get(["targetLanguage"], (data) => {
      if (data.targetLanguage) {
        setTargetLanguage(data.targetLanguage);
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
   * Translates text using the current target language
   */
  const translateText = async (text: string) => {
    // Get the latest target language from storage to avoid closure issues
    const storageData = await new Promise<{ targetLanguage?: string }>(
      (resolve) => {
        chrome.storage.sync.get(["targetLanguage"], (data) => {
          resolve(data);
        });
      }
    );

    const currentTargetLanguage = storageData.targetLanguage || "vi";

    // Update state if it's different
    if (currentTargetLanguage !== targetLanguage) {
      setTargetLanguage(currentTargetLanguage);
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
        currentTargetLanguage
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
    targetLanguage,
    translateText,
    setResult,
  };
};

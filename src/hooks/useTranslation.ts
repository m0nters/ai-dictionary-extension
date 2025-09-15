import { DEFAULT_LANGUAGE_CODE } from "@/constants/";
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

  // Load saved translated language from Chrome storage
  useEffect(() => {
    chrome.storage.sync.get(["translatedLangCode"], (data) => {
      if (data.translatedLangCode) {
        setTranslatedLangCode(data.translatedLangCode);
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
      translatedLangCode?: string;
    }>((resolve) => {
      chrome.storage.sync.get(["translatedLangCode"], (data) => {
        resolve(data);
      });
    });

    const currentTranslatedLangCode =
      storageData.translatedLangCode || DEFAULT_LANGUAGE_CODE;

    // Update state if it's different
    if (currentTranslatedLangCode !== translatedLangCode) {
      setTranslatedLangCode(currentTranslatedLangCode);
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
        currentTranslatedLangCode,
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
    translateText,
    setResult,
  };
};

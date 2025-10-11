import { changeLanguage } from "@/config";
import { useTranslation } from "@/hooks";
import "@/index.css";
import { ttsService } from "@/services";
import { parseTranslationJSON, updatePopupHeight } from "@/utils";
import { LoaderCircle, RotateCcw, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { useTranslation as useReactI18next } from "react-i18next";
import { DictionaryRenderer } from "./DictionaryRenderer";

export function DictionaryPopup() {
  const { result, translateText } = useTranslation();
  const { t } = useReactI18next();
  const [showLoadingTip, setShowLoadingTip] = useState(false);
  const [loadingTime, setLoadingTime] = useState(0);
  const [finalLoadingTime, setFinalLoadingTime] = useState<number | null>(null); // final time after loading

  // transfering messages stuff
  useEffect(() => {
    // Listen for messages from content script
    const handleMessage = (event: MessageEvent) => {
      // when this popup is ready (signal below to the parent -- content script),
      // content script fixed the height of the container, then send the signal
      // back again for this popup to translate text
      if (event.data.type === "TRANSLATE_TEXT") {
        changeLanguage(event.data.appLanguage).then(() => {
          translateText(event.data.text);
        });
      }
      // Listen for when the popup is about to be closed from outside
      if (event.data.type === "POPUP_CLOSING") {
        ttsService.stop();
      }
      // Listen for language changes from extension popup
      if (event.data.type === "LANGUAGE_CHANGED") {
        changeLanguage(event.data.language);
      }
    };

    window.addEventListener("message", handleMessage);

    // Signal to parent that the component is ready
    window.parent.postMessage({ type: "POPUP_READY" }, "*");

    return () => {
      window.removeEventListener("message", handleMessage);
      // Stop any playing TTS when popup unmounts
      ttsService.stop();
    };
  }, []);

  // Show tip after 10 seconds of loading
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (result.loading) {
      setShowLoadingTip(false);
      timer = setTimeout(() => {
        setShowLoadingTip(true);
      }, 10000);
    } else {
      setShowLoadingTip(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [result.loading]);

  // Timer to track loading time
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let startTime: number;

    if (result.loading) {
      startTime = Date.now();
      setLoadingTime(0);

      interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        setLoadingTime(elapsed);
      }, 100); // Update every 100ms for smooth display
    } else {
      if (loadingTime > 0) {
        setFinalLoadingTime(loadingTime);
      }
      setLoadingTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [result.loading]);

  // Monitor content height changes and notify parent
  useEffect(() => {
    // Initial height update
    updatePopupHeight();

    // Update height whenever content changes
    const observer = new MutationObserver(() => {
      updatePopupHeight();
    });

    const contentWrapper = document.getElementById(
      "dictionary-content-wrapper",
    );
    if (contentWrapper) {
      observer.observe(contentWrapper, {
        childList: true,
        // subtree: true, // this causes a weird bug of playing a speaker when scrolling will update the scroll position of the popup
        attributes: true,
        characterData: true,
      });
    }

    // Also update on window resize
    const handleResize = () => updatePopupHeight();
    window.addEventListener("resize", handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [result.loading, result.error, result.translation, showLoadingTip]);

  const closePopup = () => {
    window.parent.postMessage({ type: "CLOSE_POPUP" }, "*");
  };

  // Parse the translation content for structured rendering
  const parsedTranslation = result.translation
    ? parseTranslationJSON(result.translation)
    : null;

  return (
    <div className="z-99999 flex h-full w-full flex-col bg-white">
      {/* Close button - properly aligned */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between bg-white/70 px-4 py-2 backdrop-blur-sm"
        id="close-button"
      >
        {/* Show final loading time after translation completes */}
        {!result.loading && finalLoadingTime !== null && (
          <div className="text-xs text-gray-400">
            {t("common:thoughtFor", { time: finalLoadingTime.toFixed(1) })}
          </div>
        )}
        <div className="flex-1"></div>
        <button
          onClick={closePopup}
          className="flex cursor-pointer rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Scrollable content area */}
      <div
        className="flex-1 overflow-y-auto px-4 pb-4"
        id="dictionary-content-wrapper"
      >
        {/* Translation Result - Dictionary Style */}
        <div className="w-full">
          {result.loading && (
            <div
              className="flex flex-col items-center justify-center py-12"
              key="loading"
            >
              <div className="flex items-center">
                <LoaderCircle className="h-6 w-6 animate-spin text-blue-600" />
                <span className="ml-2 text-sm text-gray-500">
                  {t("common:loading")}
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-400">
                {loadingTime.toFixed(1)}s
              </div>
              {showLoadingTip && (
                <p className="animate-fade-in mt-4 max-w-xs text-center text-xs text-gray-400">
                  {t("common:loadingTip")}
                </p>
              )}
            </div>
          )}

          {result.error && (
            <div
              className="flex flex-col items-center justify-center text-center text-sm text-red-500"
              key="error"
            >
              <p>{result.error}</p>
              <button
                onClick={() => {
                  if (result.text) {
                    translateText(result.text);
                  }
                }}
                className="mt-3 cursor-pointer rounded-full p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          )}

          {!result.loading && !result.error && parsedTranslation && (
            <DictionaryRenderer translation={parsedTranslation} />
          )}

          {!result.loading &&
            !result.error &&
            !result.translation &&
            result.text && (
              <p className="py-8 text-center text-sm text-gray-400">
                {t("common:noTranslationAvailable")}
              </p>
            )}

          {!result.text && (
            <p className="py-8 text-center text-sm text-gray-400">
              {t("common:selectTextToTranslate")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Initialize the popup
const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<DictionaryPopup />);
}

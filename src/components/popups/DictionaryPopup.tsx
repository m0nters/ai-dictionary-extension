import { changeLanguage } from "@/config";
import { useTranslation } from "@/hooks/";
import "@/index.css";
import { parseTranslationJSON } from "@/utils/";
import { LoaderCircle, X } from "lucide-react";
import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { useTranslation as useReactI18next } from "react-i18next";
import { DictionaryRenderer } from "./DictionaryRenderer";

export function DictionaryPopup() {
  const { result, translateText } = useTranslation();
  const { t } = useReactI18next();

  useEffect(() => {
    // Listen for messages from content script
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "TRANSLATE_TEXT") {
        changeLanguage(event.data.appLanguage).then(() => {
          translateText(event.data.text);
        });
      }
    };

    window.addEventListener("message", handleMessage);

    // Signal to parent that the component is ready
    window.parent.postMessage({ type: "POPUP_READY" }, "*");

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

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
        className="sticky top-0 z-10 flex justify-end bg-white/70 px-4 py-2 backdrop-blur-sm"
        id="close-button"
      >
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
            <div className="flex items-center justify-center py-12">
              <LoaderCircle className="h-6 w-6 animate-spin text-blue-600" />
              <span className="ml-2 text-sm text-gray-500">
                {t("common:loading")}
              </span>
            </div>
          )}

          {result.error && (
            <div className="p-4 text-center text-sm text-red-500">
              <p>{result.error}</p>
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

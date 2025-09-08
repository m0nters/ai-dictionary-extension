import { X } from "lucide-react";
import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { useTranslation } from "../hooks/useTranslation";
import { I18nProvider, useI18n } from "../i18n/I18nContext";
import "../index.css";
import { parseTranslationContent } from "../utils/textParser";
import { DictionaryRenderer } from "./DictionaryRenderer";

const DictionaryPopup: React.FC = () => {
  const { result, translateText, setResult } = useTranslation();
  const { messages } = useI18n();

  useEffect(() => {
    // Listen for messages from content script
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "TRANSLATE_TEXT") {
        setResult((prev) => ({
          ...prev,
          text: event.data.text,
          translation: "",
          loading: true,
          error: undefined,
        }));
        translateText(event.data.text);
      }
    };

    window.addEventListener("message", handleMessage);

    // Signal to parent that the component is ready
    window.parent.postMessage({ type: "POPUP_READY" }, "*");

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [translateText, setResult]);

  const closePopup = () => {
    window.parent.postMessage({ type: "CLOSE_POPUP" }, "*");
  };

  // Parse the translation content for structured rendering
  const parsedTranslation = result.translation
    ? parseTranslationContent(result.translation)
    : null;

  return (
    <div className="flex h-full w-full flex-col bg-white">
      {/* Close button - properly aligned */}
      <div className="flex justify-end p-4 pb-0">
        <button
          onClick={closePopup}
          className="flex cursor-pointer rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Scrollable content area */}
      <div className="dictionary-content-wrapper flex-1 overflow-y-auto px-4 pb-4">
        {/* Translation Result - Dictionary Style */}
        <div className="w-full">
          {result.loading && (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-500"></div>
              <span className="ml-2 text-sm text-gray-500">
                {messages.loading}
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
                {messages.noTranslationAvailable}
              </p>
            )}

          {!result.text && (
            <p className="py-8 text-center text-sm text-gray-400">
              {messages.selectTextToTranslate}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Initialize the popup
const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <I18nProvider>
      <DictionaryPopup />
    </I18nProvider>,
  );
}

import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { useTranslation } from "../hooks/useTranslation";
import "../index.css";
import { DictionaryRenderer } from "./DictionaryRenderer";

const DictionaryPopup: React.FC = () => {
  const { result, translateText, setResult } = useTranslation();

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

  return (
    <div className="w-full h-full bg-white flex flex-col">
      {/* Close button - properly aligned */}
      <div className="flex justify-end p-4 pb-0">
        <button
          onClick={closePopup}
          className="text-gray-400 hover:text-gray-600 text-xl leading-none w-5 h-5 flex items-center justify-center"
        >
          ×
        </button>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 dictionary-content-wrapper">
        {/* Translation Result - Dictionary Style */}
        <div className="w-full">
          {result.loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-500 text-sm">Loading...</span>
            </div>
          )}

          {result.error && (
            <div className="text-red-500 text-sm p-4 text-center">
              <p>{result.error}</p>
            </div>
          )}

          {!result.loading && !result.error && result.translation && (
            <DictionaryRenderer translation={result.translation} />
          )}

          {!result.loading &&
            !result.error &&
            !result.translation &&
            result.text && (
              <p className="text-gray-400 text-center py-8 text-sm">
                No translation available
              </p>
            )}

          {!result.text && (
            <p className="text-gray-400 text-center py-8 text-sm">
              Select text on the page to translate
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
  root.render(<DictionaryPopup />);
}

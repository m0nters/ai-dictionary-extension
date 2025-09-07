import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

interface TranslationResult {
  text: string;
  translation: string;
  loading: boolean;
  error?: string;
}

const SUPPORTED_LANGUAGES = [
  { code: "vi", name: "Vietnamese" },
  { code: "en", name: "English" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "es", name: "Spanish" },
];

const DictionaryPopup: React.FC = () => {
  const [result, setResult] = useState<TranslationResult>({
    text: "",
    translation: "",
    loading: false,
  });
  const [targetLanguage, setTargetLanguage] = useState("vi");

  // Hardcoded API key for convenience
  const apiKey = "AIzaSyAWVSbmZSU-gR2TqJzifTfQL0AJDACPiFk";

  // Function to set a fixed popup height for scrolling
  const updatePopupHeight = () => {
    setTimeout(() => {
      const fixedHeight = 500; // Fixed height to ensure consistent scrolling

      window.parent.postMessage(
        {
          type: "UPDATE_POPUP_HEIGHT",
          height: fixedHeight,
        },
        "*"
      );
    }, 100);
  };

  useEffect(() => {
    // Load saved target language from Chrome storage
    chrome.storage.sync.get(["targetLanguage"], (data) => {
      if (data.targetLanguage) {
        setTargetLanguage(data.targetLanguage);
      }
    });

    // Listen for messages from content script
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "TRANSLATE_TEXT") {
        console.log(
          "Processing TRANSLATE_TEXT message with text:",
          event.data.text
        );
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
  }, [targetLanguage, apiKey]);

  // Update popup height whenever result changes
  useEffect(() => {
    updatePopupHeight();
  }, [result]);

  const getLanguageName = (code: string) => {
    return SUPPORTED_LANGUAGES.find((lang) => lang.code === code)?.name || code;
  };

  const translateText = async (text: string) => {
    // API key is hardcoded, so we can proceed directly
    try {
      const targetLangName = getLanguageName(targetLanguage);
      // @ts-ignore
      const prompt = `You are a multilingual dictionary and translation tool. Translate the user's text into ${targetLangName} (the target language), following these exact rules and formatting:

- **If the input is a single word:**
    - Detect the source language.
    - Provide the IPA pronunciation.
    - Translate the meaning into target language, specifying its part of speech (e.g., "noun", "verb",... but in target language, for example if the target language is Vietnamese then they are "danh từ", "động từ",...).
    - Include one or two example sentences using the word, with both the original and Vietnamese translations.
    - If the word has multiple meanings or pronunciations, list each one separately using the same format.
- **If the input is a phrase or a sentence (more than two words):**
    - Just provide the Vietnamese translation.
- **Formatting:**
    - Do not add any extra commentary, explanations, or conversational text.
    - Follow this precise format, as shown with the example for the English word 'bow' translated to Vietnamse:

bow /baʊ/
(động từ, danh từ) cúi chào, cúi người
- He bowed to the audience. → Anh ấy cúi chào khán giả.
- She gave a polite bow. → Cô ấy cúi chào một cách lịch sự.

bow /boʊ/
(danh từ) cái nơ, cái ruy băng buộc thành hình nơ
- She wore a red bow in her hair. → Cô ấy cài một chiếc nơ đỏ trên tóc.
- The gift box had a big bow on top. → Hộp quà có một chiếc nơ lớn trên cùng.

bow /boʊ/
(danh từ) cung (dùng để bắn tên hoặc chơi đàn như violin)
- The archer drew his bow. → Người cung thủ kéo cung.
- He tightened the strings of the bow for his violin. → Anh ấy căng dây cây cung đàn violin của mình.

bow /boʊ/
(danh từ) mũi tàu
- The passengers stood at the bow of the ship. → Hành khách đứng ở mũi tàu.

Finally, the text for the translation is "${text}"`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const translation =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No translation available";

      //       const translation = `approach /əˈproʊtʃ/
      // (động từ) tiếp cận, đến gần
      // - The cat slowly approached the bird. → Con mèo từ từ tiếp cận con chim.
      // - We are approaching the city center. → Chúng ta đang đến gần trung tâm thành phố.

      // approach /əˈproʊtʃ/
      // (danh từ) cách tiếp cận, phương pháp
      // - We need a new approach to solve this problem. → Chúng ta cần một cách tiếp cận mới để giải quyết vấn đề này.
      // - His approach to the situation was very effective. → Cách tiếp cận của anh ấy đối với tình huống này rất hiệu quả.

      // approach /əˈproʊtʃ/
      // (động từ) tiếp cận, đến gần
      // - The cat slowly approached the bird. → Con mèo từ từ tiếp cận con chim.
      // - We are approaching the city center. → Chúng ta đang đến gần trung tâm thành phố.

      // approach /əˈproʊtʃ/
      // (danh từ) cách tiếp cận, phương pháp
      // - We need a new approach to solve this problem. → Chúng ta cần một cách tiếp cận mới để giải quyết vấn đề này.
      // - His approach to the situation was very effective. → Cách tiếp cận của anh ấy đối với tình huống này rất hiệu quả.`;

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
            <div className="dictionary-content">
              {result.translation.split("\n\n").map((section, index) => (
                <div key={index} className="mb-4">
                  {section.split("\n").map((line, lineIndex) => {
                    // Main word + pronunciation line
                    if (lineIndex === 0 && line.includes("/")) {
                      const parts = line.split(" /");
                      const word = parts[0];
                      const pronunciation = "/" + parts.slice(1).join(" /");

                      return (
                        <div key={lineIndex} className="mb-2">
                          <h1 className="text-xl font-semibold text-blue-600 inline">
                            {word}
                          </h1>
                          <span className="text-base text-gray-600 ml-2">
                            {pronunciation}
                          </span>
                        </div>
                      );
                    }

                    // Part of speech and meaning line
                    else if (line.startsWith("(") && line.includes(")")) {
                      const parts = line.match(/\(([^)]+)\)\s*(.+)/);
                      if (parts) {
                        const partOfSpeech = parts[1];
                        const meaning = parts[2];

                        return (
                          <div key={lineIndex} className="mb-2">
                            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                              {partOfSpeech}
                            </span>
                            <p className="text-gray-800 font-medium mt-1 text-sm">
                              {meaning}
                            </p>
                          </div>
                        );
                      }
                    }

                    // Example sentences
                    else if (line.startsWith("- ")) {
                      const exampleText = line.substring(2);
                      const parts = exampleText.split(" → ");

                      if (parts.length === 2) {
                        return (
                          <div
                            key={lineIndex}
                            className="ml-3 mb-1 border-l-2 border-blue-100 pl-2"
                          >
                            <p className="text-gray-700 text-xs italic">
                              {parts[0].trim()}
                            </p>
                            <p className="text-blue-700 text-xs font-medium">
                              {parts[1].trim()}
                            </p>
                          </div>
                        );
                      }
                    }

                    // Any other lines (fallback)
                    else if (line.trim()) {
                      return (
                        <p
                          key={lineIndex}
                          className="text-gray-800 mb-1 text-sm"
                        >
                          {line}
                        </p>
                      );
                    }

                    return null;
                  })}
                </div>
              ))}
            </div>
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

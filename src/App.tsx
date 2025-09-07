import { useEffect, useState } from "react";

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

function App() {
  const [apiKey, setApiKey] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("vi");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load saved settings
    chrome.storage.sync.get(["geminiApiKey", "targetLanguage"], (data) => {
      if (data.geminiApiKey) {
        setApiKey(data.geminiApiKey);
      }
      if (data.targetLanguage) {
        setTargetLanguage(data.targetLanguage);
      }
    });
  }, []);

  const handleSave = () => {
    chrome.storage.sync.set(
      {
        geminiApiKey: apiKey,
        targetLanguage: targetLanguage,
      },
      () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    );
  };

  return (
    <div className="p-6 w-80 bg-white">
      <h1 className="text-xl font-bold text-gray-800 mb-4">
        Dictionary Extension Settings
      </h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Default Target Language:
          </label>
          <select
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gemini API Key:
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Gemini API key"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Get your API key from{" "}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Google AI Studio
            </a>
          </p>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Save Settings
        </button>

        {saved && (
          <p className="text-green-600 text-sm text-center">
            Settings saved successfully!
          </p>
        )}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h3 className="font-medium text-gray-800 mb-2">How to use:</h3>
        <ol className="text-sm text-gray-600 space-y-1">
          <li>1. Set your Gemini API key above</li>
          <li>2. Choose your target language</li>
          <li>3. Select any text on any webpage</li>
          <li>4. Click the "tra từ" button that appears</li>
          <li>5. View the translation in the popup</li>
        </ol>
      </div>
    </div>
  );
}

export default App;

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
  const [targetLanguage, setTargetLanguage] = useState("vi");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load saved settings
    chrome.storage.sync.get(["targetLanguage"], (data) => {
      if (data.targetLanguage) {
        setTargetLanguage(data.targetLanguage);
      } else {
      }
    });
  }, []);

  const handleSave = () => {
    chrome.storage.sync.set(
      {
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
    </div>
  );
}

export default App;

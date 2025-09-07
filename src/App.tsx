import { useEffect, useState } from "react";
import { SUPPORTED_LANGUAGES } from "./constants/language";

function App() {
  const [targetLanguage, setTargetLanguage] = useState("vi");

  useEffect(() => {
    // Load saved settings
    chrome.storage.sync.get(["targetLanguage"], (data) => {
      if (data.targetLanguage) {
        setTargetLanguage(data.targetLanguage);
      }
    });
  }, []);

  const handleChangeLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    setTargetLanguage(newLanguage);
    chrome.storage.sync.set({ targetLanguage: newLanguage });
  };

  return (
    <div className="p-6 w-80 bg-white">
      <h1 className="text-xl font-bold text-gray-800 mb-4">
        Từ điển đa ngôn ngữ
      </h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ngôn ngữ mặc định:
          </label>
          <select
            value={targetLanguage}
            onChange={handleChangeLanguage}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default App;

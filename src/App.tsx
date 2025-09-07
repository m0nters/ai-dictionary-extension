import {
  Check,
  ChevronDown,
  Globe,
  Info,
  Languages,
  MousePointer2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { SUPPORTED_LANGUAGES } from "./constants/language";

function App() {
  const [targetLanguage, setTargetLanguage] = useState("vi");
  const [saved, setSaved] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
    setIsDropdownOpen(false); // Close dropdown when selection is made

    chrome.storage.sync.set({ targetLanguage: newLanguage }, () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 500);
    });
  };

  const handleDropdownClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="relative min-h-[400px] w-80 overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 h-32 w-32 translate-x-16 -translate-y-16 rounded-full bg-gradient-to-br from-indigo-300 to-purple-300 opacity-50"></div>
      <div className="absolute bottom-0 left-0 h-24 w-24 -translate-x-12 translate-y-12 rounded-full bg-gradient-to-tr from-purple-300 to-indigo-300 opacity-30"></div>

      {/* Header */}
      <div className="relative z-10 p-6 pb-4">
        <div className="mb-6 flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
            <Languages className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-xl font-bold text-transparent">
              Từ điển AI
            </h1>
            <p className="text-sm text-gray-500">Dịch nhanh với AI</p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 px-6 pb-6">
        <div className="rounded-2xl border border-white/20 bg-white/70 p-5 shadow-xl backdrop-blur-sm">
          <label className="mb-3 flex items-center space-x-2 text-sm font-semibold text-gray-700">
            <Globe className="h-4 w-4 text-indigo-500" />
            <span>Ngôn ngữ dịch</span>
          </label>

          <div className="relative">
            <select
              value={targetLanguage}
              onChange={handleChangeLanguage}
              onMouseDown={handleDropdownClick}
              onBlur={() => setIsDropdownOpen(false)}
              className="w-full cursor-pointer appearance-none rounded-xl border-2 border-gray-200 bg-white p-3 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 transform">
              <ChevronDown
                className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : "rotate-0"
                }`}
              />
            </div>
          </div>

          {/* Save indicator*/}
          <div
            className={`overflow-hidden transition-all duration-300 ease-out ${
              saved ? "mt-3 max-h-20" : "mt-0 max-h-0"
            }`}
          >
            <div className="animate-fade-in flex items-center space-x-2 text-green-600">
              <Check className="h-4 w-4" />
              <span className="text-xs font-medium">Đã lưu!</span>
            </div>
          </div>
        </div>

        {/* Usage instructions */}
        <div className="mt-4 rounded-xl border border-indigo-200/50 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-4">
          <h3 className="mb-2 flex items-center space-x-2 text-sm font-semibold text-indigo-700">
            <Info className="h-4 w-4" />
            <span>Cách sử dụng</span>
          </h3>
          <ul className="space-y-1 text-xs text-gray-600">
            <li className="flex items-start space-x-2">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-400"></span>
              <span>Bôi đen văn bản trên trang web</span>
            </li>
            <li className="flex items-start space-x-2">
              <MousePointer2 className="mt-1 h-3 w-3 flex-shrink-0 text-purple-400" />
              <span>Nhấp vào nút "tra từ điển" xuất hiện</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-400"></span>
              <span>Xem bản dịch chi tiết với phiên âm</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;

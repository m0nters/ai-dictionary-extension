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
      setTimeout(() => setSaved(false), 2000);
    });
  };

  const handleDropdownClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="w-80 min-h-[400px] bg-gradient-to-br from-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-100 to-indigo-100 rounded-full translate-y-12 -translate-x-12 opacity-30"></div>

      {/* Header */}
      <div className="relative z-10 p-6 pb-4">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Languages className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Từ điển AI
            </h1>
            <p className="text-sm text-gray-500">Dịch nhanh với Gemini AI</p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 px-6 pb-6">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 shadow-xl border border-white/20">
          <label className="flex text-sm font-semibold text-gray-700 mb-3 items-center space-x-2">
            <Globe className="w-4 h-4 text-indigo-500" />
            <span>Ngôn ngữ dịch</span>
          </label>

          <div className="relative">
            <select
              value={targetLanguage}
              onChange={handleChangeLanguage}
              onMouseDown={handleDropdownClick}
              onBlur={() => setIsDropdownOpen(false)}
              className="w-full p-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 appearance-none cursor-pointer shadow-sm"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <ChevronDown
                className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : "rotate-0"
                }`}
              />
            </div>
          </div>

          {/* Save indicator*/}
          <div
            className={`overflow-hidden transition-all duration-300 ease-out ${
              saved ? "max-h-20 mt-3" : "max-h-0 mt-0"
            }`}
          >
            <div className="flex items-center space-x-2 text-green-600 animate-fade-in">
              <Check className="w-4 h-4" />
              <span className="text-sm font-medium">Đã lưu!</span>
            </div>
          </div>
        </div>

        {/* Usage instructions */}
        <div className="mt-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl p-4 border border-indigo-200/50">
          <h3 className="text-sm font-semibold text-indigo-700 mb-2 flex items-center space-x-2">
            <Info className="w-4 h-4" />
            <span>Cách sử dụng</span>
          </h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5 flex-shrink-0"></span>
              <span>Bôi đen văn bản trên trang web</span>
            </li>
            <li className="flex items-start space-x-2">
              <MousePointer2 className="w-3 h-3 text-purple-400 mt-1 flex-shrink-0" />
              <span>Nhấp vào nút "tra từ điển" xuất hiện</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5 flex-shrink-0"></span>
              <span>Xem bản dịch chi tiết với phiên âm</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;

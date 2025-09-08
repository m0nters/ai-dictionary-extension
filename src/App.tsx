import {
  Check,
  Globe,
  Info,
  Languages,
  MousePointer2,
  Settings,
} from "lucide-react";
import { useEffect, useState } from "react";
import { DropdownMenu } from "./components/DropdownMenu";
import { TRANSLATED_LANGUAGES } from "./constants/translatedLanguage";
import { I18nProvider, useI18n } from "./i18n/I18nContext";

function AppContent() {
  const { messages, currentLanguage, changeLanguage, availableLanguages } =
    useI18n();
  const [targetLanguage, setTargetLanguage] = useState<string>("vi");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load saved settings
    chrome.storage.sync.get(["targetLanguage"], (data) => {
      if (data.targetLanguage) {
        setTargetLanguage(data.targetLanguage);
      }
    });
  }, []);

  const handleChangeLanguage = (value: string) => {
    setTargetLanguage(value);

    chrome.storage.sync.set({ targetLanguage: value }, () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 5000);
    });
  };

  const handleAppLanguageChange = (value: string) => {
    changeLanguage(value);
    setSaved(true);
    setTimeout(() => setSaved(false), 1000);
  };

  return (
    <div className="relative min-h-[400px] w-80 bg-gradient-to-br from-indigo-50 to-purple-50">
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
              {messages.appTitle}
            </h1>
            <p className="text-sm text-gray-500">{messages.appSubtitle}</p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 px-6 pb-6">
        <div className="rounded-2xl border border-white/20 bg-white/70 p-5 shadow-xl backdrop-blur-sm">
          {/* App Language Selector */}
          <div className="mb-4">
            <label className="mb-3 flex items-center space-x-2 text-sm font-semibold text-gray-700">
              <Settings className="h-4 w-4 text-purple-500" />
              <span>{messages.appLanguage}</span>
            </label>

            <DropdownMenu
              value={currentLanguage}
              options={availableLanguages.map((lang) => ({
                value: lang.code,
                label: lang.nativeName,
              }))}
              onChange={handleAppLanguageChange}
              focusColor="purple"
            />
          </div>

          {/* Translation Language Selector */}
          <div>
            <label className="mb-3 flex items-center space-x-2 text-sm font-semibold text-gray-700">
              <Globe className="h-4 w-4 text-indigo-500" />
              <span>{messages.translateTo}</span>
            </label>

            <DropdownMenu
              value={targetLanguage}
              options={TRANSLATED_LANGUAGES.map((lang) => ({
                value: lang.code,
                label:
                  messages.languages[
                    lang.code as keyof typeof messages.languages
                  ],
              }))}
              onChange={handleChangeLanguage}
              focusColor="indigo"
            />
          </div>

          {/* Save indicator*/}
          <div
            className={`overflow-hidden transition-all duration-300 ease-out ${
              saved ? "mt-3 max-h-20" : "mt-0 max-h-0"
            }`}
          >
            <div className="animate-fade-in flex items-center space-x-2 text-green-600">
              <Check className="h-4 w-4" />
              <span className="text-xs font-medium">{messages.saved}</span>
            </div>
          </div>
        </div>

        {/* Usage instructions */}
        <div className="mt-4 rounded-xl border border-indigo-200/50 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-4">
          <h3 className="mb-2 flex items-center space-x-2 text-sm font-semibold text-indigo-700">
            <Info className="h-4 w-4" />
            <span>{messages.howToUse}</span>
          </h3>
          <ul className="space-y-1 text-xs text-gray-600">
            <li className="flex items-start space-x-2">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-400"></span>
              <span>{messages.step1}</span>
            </li>
            <li className="flex items-start space-x-2">
              <MousePointer2 className="mt-1 h-3 w-3 flex-shrink-0 text-purple-400" />
              <span>{messages.step2}</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-400"></span>
              <span>{messages.step3}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
}

export default App;

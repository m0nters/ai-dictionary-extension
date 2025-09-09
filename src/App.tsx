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
import { ToggleSwitch } from "./components/ToggleSwitch";
import { LANGUAGE_IN_ENGLISH_NAME } from "./constants/languageMapping";
import { I18nProvider, useI18n } from "./i18n/I18nContext";

function AppContent() {
  const { messages, currentLanguage, changeLanguage, availableLanguages } =
    useI18n();
  const [targetLanguage, setTargetLanguage] = useState<string>("vi");
  const [saved, setSaved] = useState(false);
  const [extensionEnabled, setExtensionEnabled] = useState(true);

  useEffect(() => {
    // Load saved settings
    chrome.storage.sync.get(["targetLanguage", "extensionEnabled"], (data) => {
      if (data.targetLanguage) {
        setTargetLanguage(data.targetLanguage);
      }
      // Default to true if not set
      setExtensionEnabled(data.extensionEnabled !== false);
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

  const handleExtensionToggle = (enabled: boolean) => {
    setExtensionEnabled(enabled);

    // Save to chrome storage
    chrome.storage.sync.set({ extensionEnabled: enabled }, () => {
      // Send message to content script to update state
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs
            .sendMessage(tabs[0].id, {
              type: "EXTENSION_TOGGLE",
              enabled: enabled,
            })
            .catch(() => {
              console.error("Content script not loaded");
            });
        }
      });
    });
  };

  return (
    <div className="relative w-100 overflow-x-hidden overflow-y-auto bg-gradient-to-br from-indigo-50 to-purple-50 select-none">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0">
        <div className="animate-blob-slow absolute top-0 right-0 h-32 w-32 translate-x-16 -translate-y-16 rounded-full bg-gradient-to-br from-indigo-300 to-purple-300 opacity-50"></div>
        <div className="animate-blob-slow animation-delay-2000 absolute bottom-0 left-0 h-24 w-24 -translate-x-12 translate-y-12 rounded-full bg-gradient-to-tr from-purple-300 to-indigo-300 opacity-30"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 p-6 pb-4">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
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

          {/* Toggle Switch */}
          <div className="flex flex-col items-end">
            <ToggleSwitch
              initialValue={extensionEnabled}
              onChange={handleExtensionToggle}
              label="Toggle Extension"
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div
        className={`relative z-10 px-6 pb-6 transition-all duration-300 ${
          !extensionEnabled ? "pointer-events-none opacity-50" : ""
        }`}
      >
        <div
          className={`rounded-2xl border border-white/20 bg-white/70 p-5 shadow-xl backdrop-blur-sm transition-all duration-300 ${
            !extensionEnabled ? "border-gray-300/30 bg-gray-100/70" : ""
          }`}
        >
          {/* Extension disabled overlay */}
          {!extensionEnabled && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-gray-900/10 backdrop-blur-xs">
              <div className="text-center">
                <div className="mb-1 text-sm font-semibold text-black">
                  {messages.extensionDisabled}
                </div>
                <div className="text-xs text-gray-900">
                  {messages.toggleToEnable}
                </div>
              </div>
            </div>
          )}

          {/* App Language Selector */}
          <div className="mb-4">
            <label
              className={`mb-3 flex items-center space-x-2 text-sm font-semibold transition-colors duration-300 ${
                !extensionEnabled ? "text-gray-400" : "text-gray-700"
              }`}
            >
              <Settings
                className={`h-4 w-4 transition-colors duration-300 ${
                  !extensionEnabled ? "text-gray-400" : "text-purple-500"
                }`}
              />
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
            <label
              className={`mb-3 flex items-center space-x-2 text-sm font-semibold transition-colors duration-300 ${
                !extensionEnabled ? "text-gray-400" : "text-gray-700"
              }`}
            >
              <Globe
                className={`h-4 w-4 transition-colors duration-300 ${
                  !extensionEnabled ? "text-gray-400" : "text-indigo-500"
                }`}
              />
              <span>{messages.translateTo}</span>
            </label>

            <DropdownMenu
              value={targetLanguage}
              options={LANGUAGE_IN_ENGLISH_NAME.map((lang) => ({
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
        <div
          className={`mt-4 rounded-xl border border-indigo-200/50 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-4 transition-all duration-300 ${
            !extensionEnabled
              ? "border-gray-300/30 bg-gray-500/10 opacity-50"
              : ""
          }`}
        >
          <h3
            className={`mb-2 flex items-center space-x-2 text-sm font-semibold transition-colors duration-300 ${
              !extensionEnabled ? "text-gray-500" : "text-indigo-700"
            }`}
          >
            <Info
              className={`h-4 w-4 transition-colors duration-300 ${
                !extensionEnabled ? "text-gray-400" : ""
              }`}
            />
            <span>{messages.howToUse}</span>
          </h3>
          <ul className="space-y-1 text-xs text-gray-600">
            <li className="flex items-start space-x-2">
              <span
                className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full transition-colors duration-300 ${
                  !extensionEnabled ? "bg-gray-400" : "bg-indigo-400"
                }`}
              ></span>
              <span>{messages.step1}</span>
            </li>
            <li className="flex items-start space-x-2">
              <MousePointer2
                className={`mt-1 h-3 w-3 flex-shrink-0 transition-colors duration-300 ${
                  !extensionEnabled ? "text-gray-400" : "text-purple-400"
                }`}
              />
              <span>{messages.step2}</span>
            </li>
            <li className="flex items-start space-x-2">
              <span
                className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full transition-colors duration-300 ${
                  !extensionEnabled ? "bg-gray-400" : "bg-indigo-400"
                }`}
              ></span>
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

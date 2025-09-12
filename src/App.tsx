import {
  Check,
  ChevronRight,
  Clock,
  Globe,
  Info,
  Languages,
  MousePointer2,
  Settings,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { HistoryDetailScreen } from "./components/popups/HistoryDetailScreen";
import { HistoryScreen } from "./components/popups/HistoryScreen";
import { DropdownMenu } from "./components/ui/DropdownMenu";
import { ToggleSwitch } from "./components/ui/ToggleSwitch";
import { changeLanguage } from "./config/i18n";
import {
  AVAILABLE_LANGUAGES,
  DEFAULT_LANGUAGE_CODE,
} from "./constants/availableLanguages";
import { HistoryEntry } from "./types";

type Screen = "main" | "history" | "historyDetail";

function App() {
  const { t, i18n } = useTranslation();
  const [translatedLangCode, setTranslatedLangCode] = useState<string>(
    DEFAULT_LANGUAGE_CODE,
  );
  const [saved, setSaved] = useState(false);
  const [extensionEnabled, setExtensionEnabled] = useState(true);

  // Screen navigation state
  const [currentScreen, setCurrentScreen] = useState<Screen>("main");
  const [selectedHistoryEntry, setSelectedHistoryEntry] =
    useState<HistoryEntry | null>(null);

  useEffect(() => {
    // Load saved settings
    chrome.storage.sync.get(["translatedLangCode", "appLangCode"], (data) => {
      if (
        data.translatedLangCode &&
        data.translatedLangCode !== DEFAULT_LANGUAGE_CODE
      ) {
        setTranslatedLangCode(data.translatedLangCode);
      }

      if (data.appLangCode && data.appLangCode !== i18n.language) {
        changeLanguage(data.appLangCode);
      }
    });
  }, []);

  const handleChangeTranslatedLanguage = (value: string) => {
    if (value === translatedLangCode) return;
    setTranslatedLangCode(value);

    chrome.storage.sync.set({ translatedLangCode: value }, () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 5000);
    });
  };

  const handleChangeAppLanguage = async (value: string) => {
    if (value === i18n.language) return;
    await changeLanguage(value);
    setSaved(true);
    setTimeout(() => setSaved(false), 5000);
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

  // Navigation handlers
  const handleShowHistory = () => {
    setCurrentScreen("history");
  };

  const handleHistoryBack = () => {
    setCurrentScreen("main");
    setSelectedHistoryEntry(null);
  };

  const handleSelectHistoryEntry = (entry: HistoryEntry) => {
    setSelectedHistoryEntry(entry);
    setCurrentScreen("historyDetail");
  };

  const handleHistoryDetailBack = () => {
    setCurrentScreen("history");
  };

  // Render appropriate screen
  if (currentScreen === "history") {
    return (
      <div className="relative h-[600px] w-100 overflow-hidden">
        <HistoryScreen
          onBack={handleHistoryBack}
          onSelectEntry={handleSelectHistoryEntry}
        />
      </div>
    );
  }

  if (currentScreen === "historyDetail" && selectedHistoryEntry) {
    return (
      <div className="relative h-[600px] w-100 overflow-hidden">
        <HistoryDetailScreen
          entry={selectedHistoryEntry}
          onBack={handleHistoryDetailBack}
        />
      </div>
    );
  }

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
                {t("popup:appTitle")}
              </h1>
              <p className="text-sm text-gray-500">{t("popup:appSubtitle")}</p>
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
        {/* Extension disabled overlay */}
        {!extensionEnabled && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-gray-900/10 backdrop-blur-xs">
            <div className="text-center">
              <div className="mb-1 text-sm font-semibold text-black">
                {t("popup:extensionDisabled")}
              </div>
              <div className="text-xs text-gray-900">
                {t("popup:toggleToEnable")}
              </div>
            </div>
          </div>
        )}

        {/* Languages Setting */}
        <div
          className={`rounded-2xl border-2 p-5 transition-all duration-300 ${
            !extensionEnabled
              ? "border-gray-300/30 bg-gray-100/70"
              : "border-gray-200 bg-gray-50"
          }`}
        >
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
              <span>{t("popup:appLanguage")}</span>
            </label>

            <DropdownMenu
              value={i18n.language}
              options={AVAILABLE_LANGUAGES.map((lang) => ({
                value: lang.code,
                label: lang.nativeName,
              }))}
              onChange={handleChangeAppLanguage}
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
              <span>{t("popup:translateTo")}</span>
            </label>

            <DropdownMenu
              value={translatedLangCode}
              options={AVAILABLE_LANGUAGES.map((lang) => ({
                value: lang.code,
                label: t(`languages:${lang.code}`),
              }))}
              onChange={handleChangeTranslatedLanguage}
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
              <span className="text-xs font-medium">{t("popup:saved")}</span>
            </div>
          </div>
        </div>

        {/* History Button */}
        <div className="mt-4">
          <button
            onClick={handleShowHistory}
            disabled={!extensionEnabled}
            className={`flex w-full items-center justify-between rounded-xl border-2 p-4 transition-all duration-300 ${
              !extensionEnabled
                ? "cursor-not-allowed border-gray-300/30 bg-gray-100/70"
                : "cursor-pointer border-gray-200 bg-gray-50 hover:bg-gray-100 hover:shadow-md"
            }`}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-300 ${
                  !extensionEnabled ? "bg-gray-300/50" : "bg-purple-100"
                }`}
              >
                <Clock
                  className={`h-4 w-4 transition-colors duration-300 ${
                    !extensionEnabled ? "text-gray-400" : "text-purple-600"
                  }`}
                />
              </div>
              <div className="text-left">
                <h3
                  className={`text-sm font-semibold transition-colors duration-300 ${
                    !extensionEnabled ? "text-gray-400" : "text-gray-700"
                  }`}
                >
                  {t("history:title")}
                </h3>
                <p
                  className={`text-xs transition-colors duration-300 ${
                    !extensionEnabled ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {t("history:viewRecentTranslations")}
                </p>
              </div>
            </div>
            <ChevronRight
              className={`h-5 w-5 transition-colors duration-300 ${
                !extensionEnabled ? "text-gray-300" : "text-gray-400"
              }`}
            />
          </button>
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
            <span>{t("common:howToUse")}</span>
          </h3>
          <ul className="space-y-1 text-xs text-gray-600">
            <li className="flex items-start space-x-2">
              <span
                className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full transition-colors duration-300 ${
                  !extensionEnabled ? "bg-gray-400" : "bg-indigo-400"
                }`}
              ></span>
              <span>{t("common:step1")}</span>
            </li>
            <li className="flex items-start space-x-2">
              <MousePointer2
                className={`mt-1 h-3 w-3 flex-shrink-0 transition-colors duration-300 ${
                  !extensionEnabled ? "text-gray-400" : "text-purple-400"
                }`}
              />
              <span>{t("common:step2")}</span>
            </li>
            <li className="flex items-start space-x-2">
              <span
                className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full transition-colors duration-300 ${
                  !extensionEnabled ? "bg-gray-400" : "bg-indigo-400"
                }`}
              ></span>
              <span>{t("common:step3")}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
export default App;

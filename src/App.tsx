import { MainScreen } from "@/components/popups/MainScreen";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { HistoryDetailScreen } from "./components/popups/HistoryDetailScreen";
import { HistoryScreen } from "./components/popups/HistoryScreen";
import { changeLanguage } from "./config/i18n";
import { DEFAULT_LANGUAGE_CODE } from "./constants/availableLanguages";

function App() {
  const { i18n } = useTranslation();
  const [appLangCode, setAppLangCode] = useState<string>(DEFAULT_LANGUAGE_CODE);
  const [translatedLangCode, setTranslatedLangCode] = useState<string>(
    DEFAULT_LANGUAGE_CODE,
  );
  const [extensionEnabled, setExtensionEnabled] = useState(true);
  const [saved, setSaved] = useState(false);

  // Load saved settings once at mount
  useEffect(() => {
    chrome.storage.sync.get(
      ["translatedLangCode", "appLangCode", "extensionEnabled"],
      (data) => {
        if (
          data.translatedLangCode &&
          data.translatedLangCode !== DEFAULT_LANGUAGE_CODE
        ) {
          setTranslatedLangCode(data.translatedLangCode);
        }

        if (data.appLangCode && data.appLangCode !== i18n.language) {
          setAppLangCode(data.appLangCode);
          changeLanguage(data.appLangCode);
        }

        if (typeof data.extensionEnabled === "boolean") {
          setExtensionEnabled(data.extensionEnabled);
        }
      },
    );
  }, []);

  const handleChangeAppLanguage = (value: string) => {
    if (value === appLangCode) return;

    // Update local state immediately for responsive UI
    setAppLangCode(value);

    // Handle async language change without blocking the dropdown
    changeLanguage(value)
      .then(() => {
        setSaved(true);
        setTimeout(() => setSaved(false), 5000);
      })
      .catch((error) => {
        console.error("Failed to change app language:", error);
        // Revert local state on error
        setAppLangCode(i18n.language);
      });
  };

  const handleChangeTranslatedLanguage = (value: string) => {
    if (value === translatedLangCode) return;
    setTranslatedLangCode(value);

    chrome.storage.sync.set({ translatedLangCode: value }, () => {
      if (chrome.runtime.lastError) {
        console.error(
          "Failed to save translated language to storage:",
          chrome.runtime.lastError,
        );
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 5000);
    });
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
    <MemoryRouter>
      <div className="relative h-full w-100 overflow-hidden">
        <Routes>
          <Route
            path="/"
            element={
              <MainScreen
                appLangCode={appLangCode}
                translatedLangCode={translatedLangCode}
                onChangeTranslatedLanguage={handleChangeTranslatedLanguage}
                onChangeAppLanguage={handleChangeAppLanguage}
                extensionEnabled={extensionEnabled}
                onExtensionToggle={handleExtensionToggle}
                saved={saved}
              />
            }
          />
          <Route path="/history" element={<HistoryScreen />} />
          <Route path="/history/:id" element={<HistoryDetailScreen />} />
        </Routes>
      </div>
    </MemoryRouter>
  );
}
export default App;

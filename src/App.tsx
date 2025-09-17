import { HistoryDetailScreen, HistoryScreen, MainScreen } from "@/components/";
import { changeLanguage } from "@/config/";
import { DEFAULT_LANGUAGE_CODE } from "@/constants/";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MemoryRouter, Route, Routes } from "react-router-dom";

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
      if (chrome.runtime.lastError) {
        console.warn(
          "Failed to save extension enabled state:",
          chrome.runtime.lastError,
        );
        return;
      }
      // Send message to content script to update state
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab?.id && activeTab.url) {
          // Skip special Chrome pages where content scripts can't run
          const isSpecialPage =
            activeTab.url.startsWith("chrome://") ||
            activeTab.url.startsWith("chrome-extension://") ||
            activeTab.url.startsWith("moz-extension://") ||
            activeTab.url.startsWith("about:") ||
            activeTab.url.startsWith("file://");

          if (!isSpecialPage) {
            chrome.tabs
              .sendMessage(activeTab.id, {
                type: "EXTENSION_TOGGLE",
                enabled: enabled,
              })
              .catch(() => {
                // Silently handle content script not being available
                // This is normal for pages where content scripts don't run
              });
          }
        }
      });
    });
  };

  return (
    <MemoryRouter>
      <div className="relative h-[574px] w-100 overflow-hidden">
        <Routes>
          <Route
            path="/"
            element={
              <MainScreen
                appLangCode={appLangCode}
                translatedLangCode={translatedLangCode}
                onChangeAppLanguage={handleChangeAppLanguage}
                onChangeTranslatedLanguage={handleChangeTranslatedLanguage}
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

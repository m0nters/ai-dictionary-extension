import { DropdownMenu, ToggleSwitch } from "@/components";
import { AVAILABLE_LANGUAGES } from "@/constants/";
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
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

interface MainScreenProps {
  appLangCode: string;
  translatedLangCode: string;
  onChangeTranslatedLanguage: (value: string) => void;
  onChangeAppLanguage: (value: string) => void;
  extensionEnabled: boolean;
  onExtensionToggle: (enabled: boolean) => void;
  saved: boolean;
}

export function MainScreen({
  appLangCode,
  translatedLangCode,
  onChangeTranslatedLanguage,
  onChangeAppLanguage,
  extensionEnabled,
  onExtensionToggle,
  saved,
}: MainScreenProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="animate-slide-in-right relative h-full w-100 overflow-x-hidden overflow-y-auto bg-gradient-to-br from-indigo-50 to-purple-50 select-none">
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
              onChange={onExtensionToggle}
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
              value={appLangCode}
              options={AVAILABLE_LANGUAGES.map((lang) => ({
                value: lang.code,
                label: lang.nativeName,
              }))}
              onChange={onChangeAppLanguage}
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
              onChange={onChangeTranslatedLanguage}
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
            onClick={() => navigate("/history")}
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

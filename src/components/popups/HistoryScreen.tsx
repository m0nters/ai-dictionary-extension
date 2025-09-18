import { BackButton } from "@/components";
import { ConfirmDialog } from "@/components/ui";
import { SearchOperatorType } from "@/constants";
import { useDebounce } from "@/hooks";
import {
  clearHistory,
  getDisplayText,
  getHistoryStorageUsage,
  removeHistoryEntry,
  searchHistory,
  togglePinEntry,
} from "@/services";
import { HistoryEntry } from "@/types";
import {
  ArrowRight,
  Clock,
  Globe,
  HardDrive,
  Pin,
  Search,
  Trash2,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export function HistoryScreen() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [storageUsage, setStorageUsage] = useState<{
    historyEntryCount: number;
    historySizeKB: string;
    historyUsageKB: string;
    historyUsageBytes: number;
  } | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Load and search history entries
  useEffect(() => {
    displayResultedEntry();
  }, [debouncedSearchQuery]);

  const displayResultedEntry = async () => {
    setLoading(true);
    try {
      const historyEntries = await searchHistory(debouncedSearchQuery);
      setEntries(historyEntries);

      // Update storage usage
      const usage = await getHistoryStorageUsage();
      setStorageUsage(usage);
    } catch (error) {
      console.error("Failed to load history:", error);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmClearHistory = async () => {
    try {
      await clearHistory();
      setEntries([]);
      setStorageUsage(null);
    } catch (error) {
      console.error("Failed to clear history:", error);
    }
  };

  const handleRemoveEntry = async (
    entryId: string,
    event: React.MouseEvent,
  ) => {
    event.stopPropagation(); // Prevent triggering the entry selection
    try {
      await removeHistoryEntry(entryId);
      await displayResultedEntry();
    } catch (error) {
      console.error("Failed to remove history entry:", error);
    }
  };

  const handlePinEntry = async (entryId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the entry selection
    try {
      await togglePinEntry(entryId);
      await displayResultedEntry();
    } catch (error) {
      console.error("Failed to toggle pin status:", error);
    }
  };

  const formatTimestamp = (timestamp: number, locale: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    const timeString = date.toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (diffInHours < 24) {
      return timeString;
    } else if (diffInHours < 24 * 7) {
      const weekday = date.toLocaleDateString(locale, { weekday: "short" });
      return `${weekday} ${timeString}`; // Weekday + time
    } else {
      const dateString = date.toLocaleDateString(locale, {
        month: "short",
        day: "numeric",
      });
      return `${dateString} ${timeString}`; // Month day + time
    }
  };

  const handleLanguageBadgeClick = (
    event: React.MouseEvent,
    operatorType: SearchOperatorType,
    langCode: string,
  ) => {
    event.stopPropagation(); // Prevent triggering the entry click

    const operator = `${operatorType}:${langCode}`;
    const currentQuery = searchQuery.trim();

    // Check if this operator already exists in the search
    const operatorRegex = new RegExp(`\\b${operatorType}:[a-zA-Z-]+\\b`, "gi");

    // Check if the operator already exists
    if (operatorRegex.test(currentQuery)) return;

    // Add new operator
    const newQuery = currentQuery ? `${operator} ${currentQuery}` : operator;
    setSearchQuery(newQuery);
  };

  return (
    <div className="animate-slide-in-right h-full w-full overflow-y-auto bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-indigo-100 bg-white/70 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <BackButton />
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-indigo-600" />
              <h1 className="text-lg font-semibold text-gray-800">
                {t("history:title")}
              </h1>
            </div>
          </div>

          {entries.length > 0 && (
            <button
              onClick={() => setShowConfirmDialog(true)}
              className="flex cursor-pointer items-center space-x-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-500 transition-all duration-200 hover:bg-red-100 hover:shadow-sm"
            >
              <Trash2 className="h-4 w-4" />
              <span className="font-medium">{t("history:clearAll")}</span>
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("history:searchPlaceholder")}
              className="w-full rounded-xl border border-gray-200 bg-white/80 py-2 pr-10 pl-10 text-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer rounded-full p-1 transition-colors hover:bg-gray-100"
                title="Clear search"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Storage Usage Info */}
      {storageUsage && (
        <div className="sticky top-[118px] mx-4 mt-4 rounded-xl border border-gray-300 bg-white p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <HardDrive className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {t("history:storageUsage")}
              </span>
            </div>
            <div className="flex items-center space-x-3 text-xs text-gray-600">
              <span>
                {t("history:entriesCount", {
                  count: storageUsage.historyEntryCount,
                })}
              </span>
              <span className="font-medium">
                {storageUsage.historyUsageKB} KB
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="m-4 flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
              <p className="text-sm text-gray-500">{t("history:loading")}</p>
            </div>
          </div>
        ) : entries.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Clock className="mx-auto mb-3 h-12 w-12 text-gray-300" />
              <p className="text-gray-500">
                {searchQuery
                  ? t("history:noSearchResults")
                  : t("history:emptyHistory")}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => {
              const displayInfo = getDisplayText(entry);
              // Get translated language names using i18n
              const sourceLangCode = entry.translation.source_language_code;
              const translatedLangCode =
                entry.translation.translated_language_code;
              const sourceLangName = t(`languages:${sourceLangCode}`);
              const targetLangName = t(`languages:${translatedLangCode}`);

              const isSourceLanguageUnknown =
                sourceLangName === t("languages:unknown");

              return (
                <div
                  key={entry.id}
                  onClick={() =>
                    navigate(`/history/${entry.id}`, { state: { entry } })
                  }
                  className="group cursor-pointer rounded-2xl border border-gray-200 bg-white/60 p-4 transition-all duration-300 hover:border-indigo-300 hover:bg-white/80 hover:shadow-xl hover:shadow-indigo-100/50 active:scale-95"
                >
                  <div className="flex items-center justify-between">
                    {/* Main info section */}
                    <div className="min-w-0 flex-1">
                      {/* Primary text (word or truncated sentence) */}
                      <div className="mb-2">
                        <h3 className="truncate text-base font-semibold text-gray-800 transition-colors group-hover:text-indigo-800">
                          {displayInfo.primaryText}
                        </h3>
                        {displayInfo.secondaryText && (
                          <p className="font-mono text-sm whitespace-pre-line text-gray-500">
                            {displayInfo.secondaryText}
                          </p>
                        )}
                      </div>

                      {/* Language pair and timestamp */}
                      <div className="mt-3 flex flex-col items-start justify-between space-y-1 text-xs">
                        <div className="flex items-center space-x-2">
                          {/* Source Language Badge */}
                          <div
                            onClick={(e) =>
                              handleLanguageBadgeClick(
                                e,
                                "source",
                                sourceLangCode,
                              )
                            }
                            className={`flex cursor-pointer items-center space-x-1.5 rounded-full border px-2 py-1 transition-all duration-200 ${isSourceLanguageUnknown ? "border-gray-300 bg-gray-100 hover:bg-gray-200 hover:shadow-none" : "border-blue-300 bg-blue-100 hover:bg-blue-200 hover:shadow-sm"}`}
                            title={t("history:searchBySourceLanguage", {
                              language: sourceLangName,
                            })}
                          >
                            <Globe
                              className={`h-3.5 w-3.5 ${isSourceLanguageUnknown ? "text-gray-500" : "text-blue-600"}`}
                            />
                            <span
                              className={`font-semibold ${isSourceLanguageUnknown ? "text-gray-500" : "text-blue-700"}`}
                            >
                              {sourceLangName}
                            </span>
                          </div>

                          {/* Arrow */}
                          <ArrowRight className="h-4 w-4 text-indigo-400" />

                          {/* Target Language Badge */}
                          <div
                            onClick={(e) =>
                              handleLanguageBadgeClick(
                                e,
                                "target",
                                translatedLangCode,
                              )
                            }
                            className="flex cursor-pointer items-center space-x-1.5 rounded-full border border-emerald-300 bg-emerald-100 px-2 py-1 transition-all duration-200 hover:bg-emerald-200 hover:shadow-sm"
                            title={t("history:searchByTargetLanguage", {
                              language: targetLangName,
                            })}
                          >
                            <Globe className="h-3.5 w-3.5 text-emerald-600" />
                            <span className="font-semibold text-emerald-700">
                              {targetLangName}
                            </span>
                          </div>
                        </div>

                        {/* Timestamp Badge */}
                        <div
                          className="flex cursor-help items-center space-x-1.5 rounded-full border border-gray-300 bg-gray-100 px-2 py-1"
                          title={new Date(entry.timestamp).toLocaleString(
                            i18n.language,
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            },
                          )}
                        >
                          <Clock className="h-3.5 w-3.5 text-gray-500" />
                          <span className="font-medium text-gray-600">
                            {formatTimestamp(entry.timestamp, i18n.language)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col space-y-4">
                      {/* Pin button */}
                      <button
                        onClick={(e) => handlePinEntry(entry.id, e)}
                        className={`cursor-pointer rounded-lg border p-3 transition-all duration-200 hover:shadow-sm ${
                          entry.pinned
                            ? "border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100"
                            : "border-gray-300 bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                        title={
                          entry.pinned
                            ? t("history:unpinEntry")
                            : t("history:pinEntry")
                        }
                      >
                        <Pin
                          className={`h-4 w-4 ${entry.pinned ? "fill-current" : ""}`}
                        />
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={(e) => handleRemoveEntry(entry.id, e)}
                        className="cursor-pointer rounded-lg border border-red-200 bg-red-50 p-3 text-red-500 transition-all duration-200 hover:bg-red-100 hover:shadow-sm"
                        title={t("history:removeEntry")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmClearHistory}
        title={t("history:confirmClearAllTitle")}
        message={t("history:confirmClearAllMessage")}
        confirmText={t("history:clearAll")}
        cancelText={t("common:cancel")}
        variant="danger"
      />
    </div>
  );
}

import { BackButton } from "@/components";
import { useDebounce } from "@/hooks";
import { HistoryService } from "@/services";
import { HistoryEntry } from "@/types";
import { Clock, Globe, Search, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface HistoryScreenProps {
  onSelectEntry: (entry: HistoryEntry) => void;
  onBack: () => void;
}

export function HistoryScreen({ onSelectEntry, onBack }: HistoryScreenProps) {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Load and search history entries
  useEffect(() => {
    const loadEntries = async () => {
      setLoading(true);
      try {
        const historyEntries =
          await HistoryService.searchHistory(debouncedSearchQuery);
        setEntries(historyEntries);
      } catch (error) {
        console.error("Failed to load history:", error);
        setEntries([]);
      } finally {
        setLoading(false);
      }
    };

    loadEntries();
  }, [debouncedSearchQuery]);

  const handleClearHistory = async () => {
    if (window.confirm(t("history:confirmClearAll"))) {
      try {
        await HistoryService.clearHistory();
        setEntries([]);
      } catch (error) {
        console.error("Failed to clear history:", error);
      }
    }
  };

  const handleRemoveEntry = async (
    entryId: string,
    event: React.MouseEvent,
  ) => {
    event.stopPropagation(); // Prevent triggering the entry selection
    try {
      await HistoryService.removeHistoryEntry(entryId);
      setEntries((prev) => prev.filter((entry) => entry.id !== entryId));
    } catch (error) {
      console.error("Failed to remove history entry:", error);
    }
  };

  const formatTimestamp = (timestamp: number, locale: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString(locale, { weekday: "short" });
    } else {
      return date.toLocaleDateString(locale, {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <div className="animate-slide-in-right absolute inset-0 overflow-y-auto bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-indigo-100 bg-white/70 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <BackButton onClick={onBack} />
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-indigo-600" />
              <h1 className="text-lg font-semibold text-gray-800">
                {t("history:title")}
              </h1>
            </div>
          </div>

          {entries.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="flex cursor-pointer items-center space-x-1 rounded-lg bg-red-100 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-200"
            >
              <Trash2 className="h-4 w-4" />
              <span>{t("history:clearAll")}</span>
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
              className="w-full rounded-xl border border-gray-200 bg-white/80 py-2 pr-4 pl-10 text-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
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
              const displayInfo = HistoryService.getDisplayText(entry);
              // Get translated language names using i18n
              const sourceLangName = t(
                `languages:${entry.translation.source_language_code}`,
              );
              const targetLangName = t(
                `languages:${entry.translation.translated_language_code}`,
              );
              const translatedLanguagePair = `${sourceLangName} → ${targetLangName}`;

              return (
                <div
                  key={entry.id}
                  onClick={() => onSelectEntry(entry)}
                  className="group cursor-pointer rounded-xl border border-white/50 bg-white/60 p-4 transition-all duration-200 hover:border-indigo-200 hover:bg-white/80 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      {/* Primary text (word or truncated sentence) */}
                      <div className="mb-1 flex-wrap items-end space-x-2">
                        <h3 className="truncate text-base font-medium text-gray-800">
                          {displayInfo.primaryText}
                        </h3>
                        {displayInfo.secondaryText && (
                          <span className="font-mono text-xs text-gray-500">
                            {displayInfo.secondaryText}
                          </span>
                        )}
                      </div>

                      {/* Language pair and timestamp */}
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Globe className="h-3 w-3" />
                          <span className="font-medium">
                            {translatedLanguagePair}
                          </span>
                        </div>
                        <span>•</span>
                        <span>
                          {formatTimestamp(entry.timestamp, i18n.language)}
                        </span>
                      </div>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={(e) => handleRemoveEntry(entry.id, e)}
                      className="cursor-pointer rounded-lg bg-red-100 p-2 text-red-600 transition-colors hover:bg-red-200 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

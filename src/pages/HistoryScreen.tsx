import { BackButton, ConfirmDialog, HistoryEntryCard } from "@/components";
import { SelectionCheckbox } from "@/components/ui";
import { SearchOperatorType } from "@/constants";
import { useDebounce } from "@/hooks";
import {
  clearHistory,
  getHistoryStorageUsage,
  removeHistoryEntries,
  removeHistoryEntry,
  searchHistory,
  togglePinEntry,
} from "@/services";
import { HistoryEntry } from "@/types";
import { Clock, HardDrive, Search, Trash2, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export function HistoryScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(
    new Set(),
  );
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [storageUsage, setStorageUsage] = useState<{
    historyEntryCount: number;
    historyUsageKB: string;
  } | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Load and search history entries
  useEffect(() => {
    displayResultedEntry();
  }, [debouncedSearchQuery]);

  // Restore scroll position when returning from detail screen
  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem(
      "historyScreenScrollPosition",
    );
    if (savedScrollPosition && scrollContainerRef.current) {
      const scrollTop = parseInt(savedScrollPosition, 10);
      // Use setTimeout to ensure the DOM is fully rendered
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollTop;
        }
      }, 100);
      // Clear the saved position after restoring
      sessionStorage.removeItem("historyScreenScrollPosition");
    }
  }, [entries]); // Run when entries are loaded

  const displayResultedEntry = async () => {
    try {
      const historyEntries = await searchHistory(debouncedSearchQuery);
      setEntries(historyEntries);

      // Update storage usage
      const usage = await getHistoryStorageUsage();
      setStorageUsage(usage);
    } catch (error) {
      console.error("Failed to load history:", error);
      setEntries([]);
    }
  };

  const handleConfirmClearHistory = async () => {
    try {
      await clearHistory();
      setEntries([]);
      setSelectedEntries(new Set());
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

  const handleEntryClick = (entry: HistoryEntry) => {
    // If in selection mode, toggle selection instead of navigating
    if (selectedEntries.size > 0) {
      handleToggleSelection(entry.id);
      return;
    }

    // Save current scroll position before navigating
    if (scrollContainerRef.current) {
      sessionStorage.setItem(
        "historyScreenScrollPosition",
        scrollContainerRef.current.scrollTop.toString(),
      );
    }
    navigate(`/history/${entry.id}`, { state: { entry } });
  };

  const handleToggleSelection = (entryId: string) => {
    setSelectedEntries((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(entryId)) {
        newSet.delete(entryId);
      } else {
        newSet.add(entryId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedEntries.size === entries.length) {
      setSelectedEntries(new Set());
    } else {
      setSelectedEntries(new Set(entries.map((e) => e.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedEntries.size === entries.length) {
      // If all entries are selected, treat as clear all
      handleConfirmClearHistory();
      return;
    }
    try {
      // Delete all selected entries in a single operation
      await removeHistoryEntries(Array.from(selectedEntries));
      setSelectedEntries(new Set());
      setShowBulkDeleteConfirm(false);
      await displayResultedEntry();
    } catch (error) {
      console.error("Failed to delete selected entries:", error);
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
    <div
      ref={scrollContainerRef}
      className="animate-slide-in-right h-full w-full overflow-y-auto bg-gradient-to-br from-indigo-50 to-purple-50"
    >
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
      {storageUsage && storageUsage.historyEntryCount !== 0 && (
        <div className="sticky top-[118px] z-10 mx-4 mt-4 rounded-xl border border-gray-300 bg-white p-3 shadow-sm">
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

      {/* Bulk Actions Bar */}
      {selectedEntries.size > 0 && (
        <div className="sticky top-[164px] z-10 mx-4 mt-2 rounded-xl border border-indigo-300 bg-indigo-50 p-3 shadow-sm">
          <div className="flex justify-between">
            <div className="flex flex-col items-start gap-2">
              <span className="text-sm font-medium text-indigo-900">
                {t("history:selectedCount", { count: selectedEntries.size })}
              </span>
              <button
                onClick={handleSelectAll}
                className="flex cursor-pointer items-center gap-2"
              >
                <SelectionCheckbox
                  isSelected={selectedEntries.size === entries.length}
                />
                <span className="text-xs font-medium text-indigo-600">
                  {t("history:selectAll")}
                </span>
              </button>
            </div>
            <button
              onClick={() => setShowBulkDeleteConfirm(true)}
              className="h-fit cursor-pointer rounded-lg border border-red-300 bg-red-100 p-3 text-xs text-red-600 transition-all duration-200 hover:bg-red-200 hover:shadow-sm"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="m-4 flex-1">
        {entries.length === 0 ? (
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
            {entries.map((entry) => (
              <HistoryEntryCard
                key={entry.id}
                entry={entry}
                isSelected={selectedEntries.has(entry.id)}
                onEntryClick={handleEntryClick}
                onToggleSelection={handleToggleSelection}
                onPinEntry={handlePinEntry}
                onRemoveEntry={handleRemoveEntry}
                onLanguageBadgeClick={handleLanguageBadgeClick}
                formatTimestamp={formatTimestamp}
              />
            ))}
          </div>
        )}
      </div>

      {/* Confirm Dialog for Clear All */}
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

      {/* Confirm Dialog for Bulk Delete */}
      <ConfirmDialog
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={handleBulkDelete}
        title={
          selectedEntries.size === entries.length
            ? t("history:confirmClearAllTitle")
            : t("history:confirmBulkDeleteTitle", {
                count: selectedEntries.size,
              })
        }
        message={
          selectedEntries.size === entries.length
            ? t("history:confirmClearAllMessage")
            : t("history:confirmBulkDeleteMessage", {
                count: selectedEntries.size,
              })
        }
        confirmText={
          selectedEntries.size === entries.length
            ? t("history:clearAll")
            : t("history:deleteSelected")
        }
        cancelText={t("common:cancel")}
        variant="danger"
      />
    </div>
  );
}

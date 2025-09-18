import { BackButton } from "@/components";
import { HistoryEntry } from "@/types";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { DictionaryRenderer } from "./DictionaryRenderer";

export function HistoryDetailScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const entry = location.state?.entry as HistoryEntry;
  const { t, i18n } = useTranslation();

  const formatDate = (timestamp: number, locale: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // If no entry is found, navigate back to history
  if (!entry) {
    navigate("/history");
    return null;
  }

  return (
    <div className="animate-slide-in-right h-full w-full overflow-y-auto bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-indigo-100 bg-white/70 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <BackButton />
            <div>
              <h1 className="text-lg font-semibold text-gray-800">
                {t("history:translationDetail")}
              </h1>
              <p className="text-xs text-gray-500">
                {formatDate(entry.timestamp, i18n.language)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        <div className="rounded-2xl border border-white/20 bg-white/70 p-5 shadow-xl backdrop-blur-sm">
          <DictionaryRenderer
            translation={entry.translation}
            isHistoryDetailView={true}
          />
        </div>
      </div>
    </div>
  );
}

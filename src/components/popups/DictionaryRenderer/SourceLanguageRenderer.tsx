import { useTranslation } from "react-i18next";

interface SourceLanguageRendererProps {
  sourceLangCode: string;
  isAutoDetected: boolean;
}

export function SourceLanguageRenderer({
  sourceLangCode,
  isAutoDetected,
}: SourceLanguageRendererProps) {
  const { t } = useTranslation();

  return (
    <div className="mb-4 flex items-center justify-center rounded-lg border border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 p-3 shadow-sm">
      <div className="flex flex-wrap items-center justify-center space-x-2">
        <div className="text-sm font-semibold text-gray-700">
          {`${t("popup:sourceLanguage")}:`}
        </div>
        <div className="text-sm font-medium text-blue-600">
          {isAutoDetected
            ? `${t(`languages:${sourceLangCode}`)} (${t("popup:autoDetect")})`
            : t(`languages:${sourceLangCode}`)}
        </div>
      </div>
    </div>
  );
}

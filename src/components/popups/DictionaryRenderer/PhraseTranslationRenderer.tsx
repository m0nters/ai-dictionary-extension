import { CopyButton, SpeakerButton } from "@/components/";
import { DEFAULT_SOURCE_LANGUAGE_CODE } from "@/constants";
import { PhraseTranslation } from "@/types";
import { renderText } from "@/utils";
import { useState } from "react";
import { SourceLanguageRenderer } from "./SourceLanguageRenderer";

/**
 * Collapsible text section component
 */
function CollapsibleTextSection({
  text,
  isInitiallyExpanded = true,
}: {
  text: string;
  isInitiallyExpanded?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(isInitiallyExpanded);

  return (
    <div className="mt-2 flex items-start">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`cursor-pointer rounded-full bg-blue-400 transition-all duration-300 ease-in-out ${isExpanded ? "mt-1 mr-2 h-6 w-1" : "mt-2 mr-0 h-3 w-3 -translate-x-1"}`}
      />
      <div className="mr-2 flex-1">
        <p
          className={`text-base leading-relaxed font-medium whitespace-pre-wrap text-gray-800 ${
            !isExpanded ? "line-clamp-1" : ""
          }`}
        >
          {renderText(text)}
        </p>
      </div>
      <CopyButton text={text} />
    </div>
  );
}

interface PhraseTranslationRendererProps {
  phraseTranslation: PhraseTranslation;
  sourceLangCodeSetting: string;
  isHistoryDetailView?: boolean;
}

export function PhraseTranslationRenderer({
  phraseTranslation,
  sourceLangCodeSetting,
  isHistoryDetailView = false,
}: PhraseTranslationRendererProps) {
  return (
    <div className="dictionary-content">
      {!isHistoryDetailView && (
        <SourceLanguageRenderer
          sourceLangCode={phraseTranslation.source_language_code}
          isAutoDetected={
            sourceLangCodeSetting === DEFAULT_SOURCE_LANGUAGE_CODE
          }
          mainCountryCode={phraseTranslation.main_country_code}
        />
      )}
      {phraseTranslation.main_tts_language_code && (
        <SpeakerButton
          word={phraseTranslation.text}
          ttsCode={phraseTranslation.main_tts_language_code}
          className="-translate-x-3"
        />
      )}
      <CollapsibleTextSection
        text={phraseTranslation.text}
        isInitiallyExpanded={isHistoryDetailView}
      />
      <CollapsibleTextSection text={phraseTranslation.translation} />
    </div>
  );
}

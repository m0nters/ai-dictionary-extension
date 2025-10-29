import { CopyButton, SpeakerButton } from "@/components";
import { DEFAULT_SOURCE_LANGUAGE_CODE } from "@/constants";
import { PhraseTranslation } from "@/types";
import { renderText } from "@/utils";
import { useEffect, useRef, useState } from "react";
import { SourceLanguageRenderer } from "./SourceLanguageRenderer";

/**
 * Collapsible text section component
 */
function CollapsibleTextSection({
  text,
  isInitiallyExpanded = true,
  className = "",
}: {
  text: string;
  isInitiallyExpanded?: boolean;
  className?: string;
}) {
  const [isExpanded, setIsExpanded] = useState(isInitiallyExpanded);
  const [isSticky, setIsSticky] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Only enable sticky behavior for history detail view (which has scrollable content)
  // Dictionary popup doesn't scroll internally, so skip sticky logic
  useEffect(() => {
    const scrollableParent = containerRef.current?.closest(
      ".overflow-y-auto",
    ) as HTMLElement;

    const handleScroll = () => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      setIsSticky(containerRect.bottom > 200);
    };

    scrollableParent.addEventListener("scroll", handleScroll);

    handleScroll(); // Initial check

    return () => {
      scrollableParent.removeEventListener("scroll", handleScroll);
    };
  }, [isExpanded]);

  return (
    <div
      ref={containerRef}
      className={`relative flex items-start ${className}`}
    >
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
      <CopyButton text={text} className={isSticky ? "sticky top-20" : ""} />
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
          mainCountryCode={phraseTranslation.source_language_main_country_code}
        />
      )}
      {phraseTranslation.source_tts_language_code && (
        <SpeakerButton
          word={phraseTranslation.text}
          ttsCode={phraseTranslation.source_tts_language_code}
          className="-translate-x-3"
        />
      )}
      <CollapsibleTextSection
        text={phraseTranslation.text}
        isInitiallyExpanded={isHistoryDetailView}
      />
      {phraseTranslation.translated_tts_language_code && (
        <SpeakerButton
          word={phraseTranslation.translation}
          ttsCode={phraseTranslation.translated_tts_language_code}
          className="-translate-x-3"
        />
      )}
      <CollapsibleTextSection
        text={phraseTranslation.translation}
        className="mt-2"
      />
    </div>
  );
}

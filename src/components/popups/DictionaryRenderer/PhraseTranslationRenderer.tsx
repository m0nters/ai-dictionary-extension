import { CopyButton, SpeakerButton } from "@/components/";
import { DEFAULT_SOURCE_LANGUAGE_CODE } from "@/constants";
import { PhraseTranslation } from "@/types";
import { renderText } from "@/utils";
import { useEffect, useRef, useState } from "react";
import { SourceLanguageRenderer } from "./SourceLanguageRenderer";

/**
 * Collapsible text section component
 */

// The reason why this component is so complicated is because I want to achieve
// two effects:
// 1. Truncate text with ellipsis when collapsed.
// 2. Smooth height transition when expanding/collapsing.

// For truncation, it's easy with fixed width setting, but for the height
// animation, we have to declare fixed height in pixels, things like "h-fit"
// won't trigger the animation, meaning first, we have to measure the actual
// height of the text content, then set that height explicitly when expanded.
// And because TailwindCSS doesn't support string interpolation in class names,
// we have to use inline style for the height setting.

function CollapsibleTextSection({
  text,
  copyText,
  isInitiallyExpanded = true,
}: {
  text: string;
  copyText: string;
  isInitiallyExpanded?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(isInitiallyExpanded);
  const [exactHeight, setExactHeight] = useState<number>(24);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (textRef.current) {
      // Get the actual available width more accurately
      const parentContainer = textRef.current.parentElement?.parentElement;
      const availableWidth = parentContainer
        ? parentContainer.getBoundingClientRect().width - 16 // the scrolling bar at the right
        : 280;

      // Create a temporary element to measure the full height
      const tempElement = textRef.current.cloneNode(
        true,
      ) as HTMLParagraphElement;
      tempElement.style.cssText = `
        position: absolute;
        visibility: hidden;
        font-size: 1rem;
        line-height: 1.625;
        font-weight: 500;
        width: ${availableWidth}px;
      `;

      document.body.appendChild(tempElement);
      const height = tempElement.scrollHeight;
      document.body.removeChild(tempElement);

      setExactHeight(height);
    }
  }, [text]);

  const containerStyle: React.CSSProperties = {
    overflow: "hidden",
    transition: "all 0.3s ease-in-out",
    height: isExpanded ? `${exactHeight}px` : "24px",
  };

  return (
    <div className="mt-2 flex items-start">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`cursor-pointer rounded-full bg-blue-400 transition-all duration-300 ease-in-out ${isExpanded ? "mt-1 mr-2 h-6 w-1" : "mt-2 mr-0 h-3 w-3 -translate-x-1"}`}
      />
      <div className="mr-2 flex-1">
        <div style={containerStyle}>
          <p
            ref={textRef}
            className={`text-base leading-relaxed font-medium text-gray-800 ${
              !isExpanded ? "w-32 truncate" : ""
            }`}
          >
            {renderText(text)}
          </p>
        </div>
      </div>
      <CopyButton text={copyText} />
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
        copyText={phraseTranslation.text}
        isInitiallyExpanded={isHistoryDetailView}
      />
      <CollapsibleTextSection
        text={phraseTranslation.translation}
        copyText={phraseTranslation.translation}
      />
    </div>
  );
}

import { MeaningEntryRenderer, VerbFormsRenderer } from "@/components";
import { DEFAULT_SOURCE_LANGUAGE_CODE } from "@/constants";
import { SingleWordTranslation } from "@/types";
import { SourceLanguageRenderer } from "./SourceLanguageRenderer";

interface SingleWordTranslationRendererProps {
  singleWordTranslation: SingleWordTranslation;
  sourceLangCodeSetting: string;
  isHistoryDetailView?: boolean;
}

export function SingleWordTranslationRenderer({
  singleWordTranslation,
  sourceLangCodeSetting,
  isHistoryDetailView = false,
}: SingleWordTranslationRendererProps) {
  return (
    <div className="dictionary-content">
      {!isHistoryDetailView && (
        <SourceLanguageRenderer
          sourceLangCode={singleWordTranslation.source_language_code}
          isAutoDetected={
            sourceLangCodeSetting === DEFAULT_SOURCE_LANGUAGE_CODE
          }
          mainCountryCode={
            singleWordTranslation.source_language_main_country_code
          }
        />
      )}
      <div className="mb-4">
        {/* Verb Forms (if present) */}
        {singleWordTranslation.verb_forms &&
          singleWordTranslation.verb_forms.length > 0 && (
            <VerbFormsRenderer verbForms={singleWordTranslation.verb_forms} />
          )}

        {/* Meanings */}
        {singleWordTranslation.meanings.map((meaning, index) => (
          <MeaningEntryRenderer
            key={index}
            entry={meaning}
            word={singleWordTranslation.word}
            sourceTtsLanguageCode={
              singleWordTranslation.source_tts_language_code || ""
            }
            translatedTtsLanguageCode={
              singleWordTranslation.translated_tts_language_code || ""
            }
          />
        ))}
      </div>
    </div>
  );
}

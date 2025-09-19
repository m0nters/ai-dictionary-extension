import { DEFAULT_SOURCE_LANGUAGE_CODE } from "@/constants";
import {
  MeaningEntry,
  ParsedTranslation,
  PhraseTranslation,
  PronunciationVariants,
  SingleWordTranslation,
} from "@/types/";
import {
  hasPronunciationVariants,
  isPhraseTranslation,
  isSingleWordTranslation,
  renderText,
} from "@/utils/";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SpeakerButton } from "../ui";

interface DictionaryRendererProps {
  translation: ParsedTranslation;
  isHistoryDetailView?: boolean;
}

/**
 * Renders the source language information
 */
function SourceLanguageRenderer({
  sourceLangCode,
  isAutoDetected,
}: {
  sourceLangCode: string;
  isAutoDetected: boolean;
}) {
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

/**
 * Renders pronunciation with proper styling for variants (original style)
 */
function PronunciationRenderer({
  pronunciation,
  word,
  mainTtsCode,
}: {
  pronunciation: string | PronunciationVariants;
  word: string;
  mainTtsCode: string;
}) {
  const styleMap = {
    UK: "bg-blue-100 text-blue-700",
    US: "bg-red-100 text-red-700",
  };

  if (hasPronunciationVariants(pronunciation)) {
    return (
      <span className="ml-2 inline-flex flex-wrap items-center gap-2">
        {Object.keys(pronunciation).map((key) => {
          const variant = pronunciation[key as keyof PronunciationVariants];
          if (!variant) return null;

          const ipaText = variant.ipa;
          const ttsCode = variant.tts_code;

          return (
            <span key={key} className="inline-flex items-end gap-1">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  styleMap[key as keyof PronunciationVariants] ||
                  "bg-gray-100 text-gray-700"
                }`}
              >
                {key}
              </span>
              <span className="text-base text-gray-600">{ipaText}</span>
              <SpeakerButton
                word={word}
                ttsCode={ttsCode}
                className="translate-y-1"
              />
            </span>
          );
        })}
      </span>
    );
  }

  return (
    <span className="ml-2 inline-flex items-end gap-1">
      <span className="text-base text-gray-600">{pronunciation as string}</span>
      <SpeakerButton
        word={word}
        ttsCode={mainTtsCode}
        className="translate-y-1"
      />
    </span>
  );
}

/**
 * Renders a single meaning entry (original style)
 */
function MeaningEntryRenderer({
  entry,
  word,
  mainTtsCode,
}: {
  entry: MeaningEntry;
  word: string;
  mainTtsCode: string;
}) {
  return (
    <div className="mb-4">
      {/* Word and Pronunciation Header (original style) */}
      <div className="mb-2">
        <h1 className="inline text-xl font-semibold text-blue-600">{word}</h1>
        <PronunciationRenderer
          pronunciation={entry.pronunciation}
          word={word}
          mainTtsCode={mainTtsCode}
        />
      </div>

      {/* Part of Speech and Translation/Definition (original style) */}
      <div className="mb-2">
        <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-600">
          {entry.part_of_speech}
        </span>
        <p className="mt-1 text-sm font-medium text-gray-800">
          {entry.definition}
        </p>
      </div>

      {/* Examples (consistent object format for all languages) */}
      {entry.examples && entry.examples.length > 0 && (
        <div className="space-y-2">
          {entry.examples.map((example, exampleIndex) => (
            <div
              key={exampleIndex}
              className="mb-3 ml-4 rounded-lg border-l-4 border-blue-200 bg-blue-50 p-3"
            >
              <div className="mb-1 flex items-start gap-1">
                <p className="text-sm font-medium text-gray-800">
                  {renderText(example.text)}
                </p>
                <SpeakerButton
                  word={example.text.replace(/\*\*/g, "")}
                  ttsCode={mainTtsCode}
                  className="-translate-y-1"
                />
              </div>
              {example.pronunciation && (
                <p className="mb-1 text-xs text-gray-600 italic">
                  {renderText(example.pronunciation)}
                </p>
              )}
              {example.translation && (
                <p className="text-sm font-normal text-blue-700">
                  {renderText(example.translation)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Synonyms Section */}
      {entry.synonyms &&
        entry.synonyms.items &&
        entry.synonyms.items.length > 0 && (
          <div className="mb-3">
            <div className="mb-2 flex items-center space-x-2">
              <span className="rounded-full bg-purple-50 px-2 py-1 text-xs font-medium text-purple-600">
                {entry.synonyms.label}
              </span>
            </div>
            <div className="ml-2 flex flex-wrap gap-1">
              {entry.synonyms.items.map((synonym, index) => (
                <span
                  key={index}
                  className="inline-block rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700 transition-colors duration-200 hover:bg-gray-200"
                >
                  {synonym}
                </span>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}

/**
 * Renders verb forms with original gradient styling
 */
function VerbFormsRenderer({ verbForms }: { verbForms: string[] }) {
  return (
    <div className="mb-4">
      <div className="rounded-xl border border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50 p-4 shadow-sm">
        <div className="mb-3 flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-violet-400"></div>
          <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold tracking-wide text-violet-700">
            VERB FORMS
          </span>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {verbForms.map((form, formIndex) => (
            <div
              key={formIndex}
              className="rounded-lg border border-violet-200 bg-white px-4 py-2.5 text-center font-semibold text-violet-800 shadow-sm transition-shadow duration-200 hover:shadow-md"
            >
              <div className="text-sm font-medium">{form}</div>
              {verbForms.length === 3 && (
                <div className="mt-1 text-xs text-violet-500 opacity-75">
                  {formIndex === 0 && "Infinitive"}
                  {formIndex === 1 && "Past tense"}
                  {formIndex === 2 && "Past participle"}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Main dictionary renderer component
 */
export function DictionaryRenderer({
  translation,
  isHistoryDetailView = false,
}: DictionaryRendererProps) {
  const [sourceLangCodeSetting, setSourceLangCodeSetting] = useState<string>(
    DEFAULT_SOURCE_LANGUAGE_CODE,
  );

  // Load source language code from Chrome storage
  useEffect(() => {
    chrome.storage.sync.get("sourceLangCode", (data) => {
      if (data.sourceLangCode) {
        setSourceLangCodeSetting(data.sourceLangCode);
      }
    });
  }, []);

  if (isPhraseTranslation(translation)) {
    const phraseTranslation = translation as PhraseTranslation;
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
          />
        )}
        {isHistoryDetailView && (
          <div className="mt-2 flex items-start space-x-2">
            <div className="mt-1 h-6 w-1 flex-shrink-0 rounded-full bg-blue-400"></div>
            <p className="text-base leading-relaxed font-medium text-gray-800">
              {renderText(phraseTranslation.text)}
            </p>
          </div>
        )}
        <div className="mt-2 flex items-start space-x-2">
          <div className="mt-1 h-6 w-1 flex-shrink-0 rounded-full bg-blue-400"></div>
          <p className="text-base leading-relaxed font-medium text-gray-800">
            {renderText(phraseTranslation.translation)}
          </p>
        </div>
      </div>
    );
  }

  if (isSingleWordTranslation(translation)) {
    const singleWordTranslation = translation as SingleWordTranslation;
    return (
      <div className="dictionary-content">
        {!isHistoryDetailView && (
          <SourceLanguageRenderer
            sourceLangCode={singleWordTranslation.source_language_code}
            isAutoDetected={
              sourceLangCodeSetting === DEFAULT_SOURCE_LANGUAGE_CODE
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
              mainTtsCode={singleWordTranslation.main_tts_language_code!}
            />
          ))}
        </div>
      </div>
    );
  }

  // Fallback for unknown format
  return (
    <div className="dictionary-content">
      <div className="text-gray-600">
        <pre className="whitespace-pre-wrap">
          {JSON.stringify(translation, null, 2)}
        </pre>
      </div>
    </div>
  );
}

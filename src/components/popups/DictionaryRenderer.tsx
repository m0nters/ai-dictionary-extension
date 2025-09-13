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
import { useTranslation } from "react-i18next";

interface DictionaryRendererProps {
  translation: ParsedTranslation;
  translatedLangCode?: string;
  isHistoryDetailView?: boolean;
}

/**
 * Get synonyms label in the translated language
 */

// in case for further questions: Why don't we put in .json files and use i18n?
// ANSWER: this label needs to be matched with the TRANSLATED LANGUAGE, while
// using i18n means it needs to be matched with the APP LANGUAGE

const SYNONYMS: Record<string, string> = {
  en: "Synonyms",
  vi: "Từ đồng nghĩa",
  zh: "同义词",
  fr: "Synonymes",
  es: "Sinónimos",
  de: "Synonyme",
  ja: "類義語",
  ko: "동의어",
};

function getSynonymsLabel(languageCode: string): string {
  return SYNONYMS[languageCode] || SYNONYMS.en;
}

/**
 * Renders the source language information
 */
function SourceLanguageRenderer({
  sourceLangCode,
}: {
  sourceLangCode?: string;
}) {
  const { t } = useTranslation();

  if (!sourceLangCode) return null;

  return (
    <div className="mb-4 flex items-center justify-center rounded-lg border border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 p-3 shadow-sm">
      <div className="flex items-center justify-center space-x-2">
        <div className="text-sm font-semibold text-gray-700">
          {t("popup:detectedLanguage")}
        </div>
        <div className="text-sm font-medium text-blue-600">
          {t(`languages:${sourceLangCode}`)}
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
}: {
  pronunciation: string | PronunciationVariants;
}) {
  const styleMap = {
    UK: "bg-blue-100 text-blue-700",
    US: "bg-red-100 text-red-700",
  };

  if (hasPronunciationVariants(pronunciation)) {
    return (
      <span className="ml-2 inline-flex flex-wrap items-center gap-2">
        {Object.keys(pronunciation).map(
          (key) =>
            pronunciation[key as keyof PronunciationVariants] && (
              <span key={key} className="inline-flex items-center gap-1">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    styleMap[key as keyof PronunciationVariants] ||
                    "bg-gray-100 text-gray-700"
                  }`}
                >
                  {key}
                </span>
                <span className="text-base text-gray-600">
                  {pronunciation[key as keyof PronunciationVariants]}
                </span>
              </span>
            ),
        )}
      </span>
    );
  }

  return (
    <span className="ml-2 text-base text-gray-600">
      {pronunciation as string}
    </span>
  );
}

/**
 * Renders a single meaning entry (original style)
 */
function MeaningEntryRenderer({
  entry,
  word,
  translatedLangCode,
}: {
  entry: MeaningEntry;
  word: string;
  translatedLangCode?: string;
}) {
  return (
    <div className="mb-4">
      {/* Word and Pronunciation Header (original style) */}
      <div className="mb-2">
        <h1 className="inline text-xl font-semibold text-blue-600">{word}</h1>
        <PronunciationRenderer pronunciation={entry.pronunciation} />
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
              <p className="mb-1 text-sm font-medium text-gray-800">
                {renderText(example.text)}
              </p>
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
      {entry.synonyms && entry.synonyms.length > 0 && (
        <div className="mb-3">
          <div className="mb-2 flex items-center space-x-2">
            <span className="rounded-full bg-purple-50 px-2 py-1 text-xs font-medium text-purple-600">
              {translatedLangCode
                ? getSynonymsLabel(translatedLangCode)
                : getSynonymsLabel("en")}
            </span>
          </div>
          <div className="ml-2 flex flex-wrap gap-1">
            {entry.synonyms.map((synonym, index) => (
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
  translatedLangCode,
  isHistoryDetailView = false,
}: DictionaryRendererProps) {
  // Handle phrase translations (original style)
  if (isPhraseTranslation(translation)) {
    const phraseTranslation = translation as PhraseTranslation;
    return (
      <div className="dictionary-content">
        {!isHistoryDetailView && (
          <SourceLanguageRenderer
            sourceLangCode={phraseTranslation.source_language_code}
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

  // Handle single word translations (original style)
  if (isSingleWordTranslation(translation)) {
    const singleWordTranslation = translation as SingleWordTranslation;
    return (
      <div className="dictionary-content">
        {!isHistoryDetailView && (
          <SourceLanguageRenderer
            sourceLangCode={singleWordTranslation.source_language_code}
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
              translatedLangCode={translatedLangCode}
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

import { SpeakerButton } from "@/components/";
import { MeaningEntry } from "@/types";
import { renderText } from "@/utils";
import { PronunciationRenderer } from "./PronunciationRenderer";

interface MeaningEntryRendererProps {
  entry: MeaningEntry;
  word: string;
  mainTtsCode: string;
}

export function MeaningEntryRenderer({
  entry,
  word,
  mainTtsCode,
}: MeaningEntryRendererProps) {
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

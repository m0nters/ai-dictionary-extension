import React from "react";
import {
  getLineType,
  parseExampleSentence,
  parsePartOfSpeechAndMeaning,
  parseWordAndPronunciation,
  renderTextWithBold,
} from "../utils/textParser";

interface DictionaryRendererProps {
  translation: string;
}

/**
 * Component responsible for rendering dictionary-style translation content
 */
export const DictionaryRenderer: React.FC<DictionaryRendererProps> = ({
  translation,
}) => {
  return (
    <div className="dictionary-content">
      {translation.split("\n\n").map((section, index) => {
        return (
          <div key={index} className="mb-4">
            {section.split("\n").map((line, lineIndex) => {
              const lineType = getLineType(line);

              switch (lineType) {
                case "word-pronunciation": {
                  const { word, pronunciation } =
                    parseWordAndPronunciation(line);
                  return (
                    <div key={lineIndex} className="mb-2">
                      <h1 className="text-xl font-semibold text-blue-600 inline">
                        {word}
                      </h1>
                      <span className="text-base text-gray-600 ml-2">
                        {pronunciation}
                      </span>
                    </div>
                  );
                }

                case "part-of-speech": {
                  const parsed = parsePartOfSpeechAndMeaning(line);
                  if (parsed) {
                    const { partOfSpeech, meaning } = parsed;
                    return (
                      <div key={lineIndex} className="mb-2">
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          {partOfSpeech}
                        </span>
                        <p className="text-gray-800 font-medium mt-1 text-sm">
                          {meaning}
                        </p>
                      </div>
                    );
                  }
                  break;
                }

                case "example": {
                  const { original, translation: exampleTranslation } =
                    parseExampleSentence(line);

                  if (exampleTranslation) {
                    // Format with translation: "- English example → Vietnamese translation"
                    return (
                      <div
                        key={lineIndex}
                        className="ml-4 mb-3 bg-blue-50 rounded-lg p-3 border-l-4 border-blue-200"
                      >
                        <p className="text-gray-800 text-sm mb-1 font-medium">
                          {renderTextWithBold(original)}
                        </p>
                        <p className="text-blue-700 text-sm font-normal">
                          {renderTextWithBold(exampleTranslation)}
                        </p>
                      </div>
                    );
                  } else {
                    // Simple format: "- Example sentence only"
                    return (
                      <div
                        key={lineIndex}
                        className="ml-4 mb-2 bg-gray-50 rounded-lg p-3 border-l-4 border-gray-200"
                      >
                        <p className="text-gray-700 text-sm">
                          {renderTextWithBold(original)}
                        </p>
                      </div>
                    );
                  }
                }

                case "other":
                default: {
                  // Phrase/sentence translation - deserves better styling
                  if (line.trim()) {
                    return (
                      <div
                        className="flex items-start space-x-2"
                        key={lineIndex}
                      >
                        <div className="flex-shrink-0 w-1 h-6 bg-blue-400 rounded-full mt-1"></div>
                        <p className="text-gray-800 font-medium text-base leading-relaxed">
                          {renderTextWithBold(line)}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }
              }

              return null;
            })}
          </div>
        );
      })}
    </div>
  );
};

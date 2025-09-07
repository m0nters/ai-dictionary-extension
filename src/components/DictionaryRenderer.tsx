import React from "react";
import {
  getLineType,
  parseExampleSentence,
  parsePartOfSpeechAndMeaning,
  parseVerbConjugation,
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
                case "verb-conjugation": {
                  const conjugations = parseVerbConjugation(line);
                  if (conjugations.length > 0) {
                    return (
                      <div key={lineIndex} className="mb-4">
                        <div className="rounded-xl border border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50 p-4 shadow-sm">
                          <div className="mb-3 flex items-center space-x-2">
                            <div className="h-2 w-2 rounded-full bg-violet-400"></div>
                            <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold tracking-wide text-violet-700">
                              VERB FORMS
                            </span>
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            {conjugations.map((form, formIndex) => (
                              <div
                                key={formIndex}
                                className="rounded-lg border border-violet-200 bg-white px-4 py-2.5 text-center font-semibold text-violet-800 shadow-sm transition-shadow duration-200 hover:shadow-md"
                              >
                                <div className="text-sm font-medium">
                                  {form}
                                </div>
                                {conjugations.length === 3 && (
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
                  break;
                }

                case "word-pronunciation": {
                  const { word, singlePronunciation, pronunciationVariants } =
                    parseWordAndPronunciation(line);
                  return (
                    <div key={lineIndex} className="mb-2">
                      <h1 className="inline text-xl font-semibold text-blue-600">
                        {word}
                      </h1>
                      {pronunciationVariants ? (
                        <span className="ml-2 inline-flex items-center gap-2">
                          {pronunciationVariants.map((variant, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1"
                            >
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                  variant.region === "UK"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {variant.region}
                              </span>
                              <span className="text-base text-gray-600">
                                {variant.ipa}
                              </span>
                            </span>
                          ))}
                        </span>
                      ) : (
                        <span className="ml-2 text-base text-gray-600">
                          {singlePronunciation}
                        </span>
                      )}
                    </div>
                  );
                }

                case "part-of-speech": {
                  const parsed = parsePartOfSpeechAndMeaning(line);
                  if (parsed) {
                    const { partOfSpeech, meaning } = parsed;
                    return (
                      <div key={lineIndex} className="mb-2">
                        <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-600">
                          {partOfSpeech}
                        </span>
                        <p className="mt-1 text-sm font-medium text-gray-800">
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
                        className="mb-3 ml-4 rounded-lg border-l-4 border-blue-200 bg-blue-50 p-3"
                      >
                        <p className="mb-1 text-sm font-medium text-gray-800">
                          {renderTextWithBold(original)}
                        </p>
                        <p className="text-sm font-normal text-blue-700">
                          {renderTextWithBold(exampleTranslation)}
                        </p>
                      </div>
                    );
                  } else {
                    // Simple format: "- Example sentence only"
                    return (
                      <div
                        key={lineIndex}
                        className="mb-2 ml-4 rounded-lg border-l-4 border-gray-200 bg-gray-50 p-3"
                      >
                        <p className="text-sm text-gray-700">
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
                        <div className="mt-1 h-6 w-1 flex-shrink-0 rounded-full bg-blue-400"></div>
                        <p className="text-base leading-relaxed font-medium text-gray-800">
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

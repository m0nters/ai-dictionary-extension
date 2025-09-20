import { SpeakerButton } from "@/components/";
import { PronunciationVariants } from "@/types";
import { hasPronunciationVariants } from "@/utils/textParser";

interface PronunciationRendererProps {
  pronunciation: string | PronunciationVariants;
  word: string;
  mainTtsCode: string;
}

export function PronunciationRenderer({
  pronunciation,
  word,
  mainTtsCode,
}: PronunciationRendererProps) {
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

import { ttsService } from "@/services";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RxSpeakerLoud } from "react-icons/rx";

export function SpeakerButton({
  word,
  ttsCode,
  className = "",
}: {
  word: string;
  ttsCode: string;
  className?: string;
}) {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => ttsService.stop();
  }, []);

  const handleSpeak = async () => {
    if (isPlaying) {
      // If currently playing, stop the speech
      ttsService.stop();
      setIsPlaying(false);
    } else {
      // If not playing, start speech
      await ttsService.speak(
        word,
        ttsCode,
        () => setIsPlaying(true),
        () => setIsPlaying(false),
        (error) => {
          console.error("TTS error:", error);
          setIsPlaying(false);
        },
      );
    }
  };

  return (
    <button
      onClick={handleSpeak}
      className={`ml-1 cursor-pointer rounded-full p-2 transition-colors ${
        isPlaying
          ? "bg-blue-100 text-blue-600"
          : "text-gray-500 hover:bg-gray-200 hover:text-gray-700"
      } ${className}`}
      title={isPlaying ? t("common:stop") : t("common:speak")}
    >
      <RxSpeakerLoud size={12} />
    </button>
  );
}

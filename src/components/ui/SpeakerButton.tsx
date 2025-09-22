import { ttsService } from "@/services";
import { LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
  const [isLoading, setIsLoading] = useState(false);
  const speakSlow = useRef(false);

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
      setIsLoading(true);
      try {
        await ttsService.speak(
          word,
          ttsCode,
          speakSlow.current,
          () => setIsPlaying(true),
          () => setIsPlaying(false),
          (error) => {
            console.error("TTS error:", error);
            setIsPlaying(false);
          },
        );
      } catch (error) {
        console.error("TTS error:", error);
        setIsPlaying(false);
      } finally {
        setIsLoading(false);
        speakSlow.current = !speakSlow.current;
      }
    }
  };

  return (
    <button
      onClick={handleSpeak}
      disabled={isLoading}
      className={`rounded-full p-2 transition-colors ${
        isLoading
          ? "cursor-wait bg-gray-100 text-gray-400"
          : isPlaying
            ? "cursor-pointer bg-blue-100 text-blue-600"
            : "cursor-pointer text-gray-500 hover:bg-gray-200 hover:text-gray-700"
      } ${className}`}
      title={
        isLoading
          ? t("common:loading")
          : isPlaying
            ? t("common:stop")
            : t("common:speak")
      }
    >
      {isLoading ? (
        <LoaderCircle size={12} className="animate-spin" />
      ) : (
        <RxSpeakerLoud size={12} />
      )}
    </button>
  );
}

/**
 * Text-to-Speech service using Web Speech API
 */
export class TTSService {
  private static instance: TTSService;

  static getInstance(): TTSService {
    if (!TTSService.instance) {
      TTSService.instance = new TTSService();
    }
    return TTSService.instance;
  }

  /**
   * Speaks the given text using the specified TTS language code
   */
  async speak(
    text: string,
    ttsCode: string,
    isSlow: boolean = false,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (error: SpeechSynthesisErrorEvent) => void,
  ): Promise<void> {
    try {
      // Try Web Speech API
      if (!("speechSynthesis" in window)) {
        console.error("Speech synthesis not supported");
        onError?.(new Error("Speech synthesis not supported") as any);
        return;
      }

      window.speechSynthesis.cancel(); // Stop any current speech

      // Check available voices (may need to wait for them to load)
      let voices = await this.getVoices();

      const utterance = new SpeechSynthesisUtterance(text);

      // Find the first voice matched the requested language
      const availableVoice = voices.find(
        (voice) => voice.lang.toLowerCase() === ttsCode.toLowerCase(),
      );

      if (availableVoice) {
        utterance.voice = availableVoice;
        utterance.lang = availableVoice.lang;
        console.log(
          `Using TTS voice: ${availableVoice.lang}, ${availableVoice.name}`,
        );
      } else {
        console.warn(
          `No voice found for ${ttsCode}\nAvailable languages:`,
          voices,
        );
        // Keep the requested language anyway, browser might handle it
        utterance.lang = ttsCode;
      }

      // Set speech parameters
      utterance.rate = isSlow ? 0.5 : 0.8;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Set up event handlers
      utterance.onstart = () => {
        console.log("TTS started");
        onStart?.();
      };

      utterance.onend = () => {
        console.log("TTS ended");
        onEnd?.();
      };

      utterance.onerror = (e) => {
        console.error("TTS error:", e);
        onError?.(e);
      };

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("TTS failed:", error);
      onError?.(error as SpeechSynthesisErrorEvent);
    }
  }

  /**
   * Get available voices, waiting for them to load if necessary
   */
  private async getVoices(): Promise<SpeechSynthesisVoice[]> {
    let voices = window.speechSynthesis.getVoices();

    // If no voices are available, they might not be loaded yet
    if (voices.length === 0) {
      // Wait a bit for voices to load
      await new Promise<void>((resolve) => {
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = () => {
            voices = window.speechSynthesis.getVoices();
            resolve();
          };
        } else {
          // Fallback timeout
          setTimeout(() => {
            voices = window.speechSynthesis.getVoices();
            resolve();
          }, 100);
        }
      });
    }

    return voices;
  }

  /**
   * Stop any current speech
   */
  stop(): void {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }
}

// Export a singleton instance
export const ttsService = TTSService.getInstance();

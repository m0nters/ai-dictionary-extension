/**
 * Text-to-Speech service using Web Speech API
 */
export class TTSService {
  private static instance: TTSService;
  private isPlaying = false;

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
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (error: SpeechSynthesisErrorEvent) => void,
  ): Promise<void> {
    try {
      this.isPlaying = true;

      // Try Web Speech API
      if (!("speechSynthesis" in window)) {
        console.error("Speech synthesis not supported");
        this.isPlaying = false;
        onError?.(new Error("Speech synthesis not supported") as any);
        return;
      }

      window.speechSynthesis.cancel(); // Stop any current speech

      // Check available voices (may need to wait for them to load)
      let voices = await this.getVoices();

      const utterance = new SpeechSynthesisUtterance(text);

      // Find the best voice for the requested language
      const availableVoice = this.findFirstMatchedVoice(voices, ttsCode);

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
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Set up event handlers
      utterance.onstart = () => {
        console.log("TTS started");
        onStart?.();
      };

      utterance.onend = () => {
        console.log("TTS ended");
        this.isPlaying = false;
        onEnd?.();
      };

      utterance.onerror = (e) => {
        console.error("TTS error:", e);
        this.isPlaying = false;
        onError?.(e);
      };

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("TTS failed:", error);
      this.isPlaying = false;
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
   * Find the best voice for the given language code
   * First tries exact match, then falls back to base language
   */
  private findFirstMatchedVoice(
    voices: SpeechSynthesisVoice[],
    ttsCode: string,
  ): SpeechSynthesisVoice | null {
    let availableVoice = voices.find(
      (voice) => voice.lang.toLowerCase() === ttsCode.toLowerCase(),
    );

    return availableVoice || null;
  }

  /**
   * Stop any current speech
   */
  stop(): void {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    this.isPlaying = false;
  }

  /**
   * Check if TTS is currently playing
   */
  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Get available voices and languages
   */
  async getAvailableLanguages(): Promise<string[]> {
    const voices = await this.getVoices();
    return [...new Set(voices.map((v) => v.lang))];
  }
}

// Export a singleton instance
export const ttsService = TTSService.getInstance();

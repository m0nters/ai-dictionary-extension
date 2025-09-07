import { SUPPORTED_LANGUAGES } from "../constants/language";

// Hardcoded API key
const API_KEY = "AIzaSyAWVSbmZSU-gR2TqJzifTfQL0AJDACPiFk";

/**
 * Gets the language name from language code
 */
export const getLanguageName = (code: string): string => {
  return SUPPORTED_LANGUAGES.find((lang) => lang.code === code)?.name || code;
};

/**
 * Generates the translation prompt for the Gemini API
 */
export const generateTranslationPrompt = (
  text: string,
  targetLanguage: string
): string => {
  const targetLangName = getLanguageName(targetLanguage);

  return `You are a multilingual dictionary and translation tool. Translate the user's text into ${targetLangName}, using the following rules and format:

- **Single word input:**
  - Detect the source language.
  - Provide the IPA pronunciation.
  - Translate the meaning into the target language, specifying its part of speech (in the target language, e.g., "danh từ" for noun in Vietnamese, "名词" for noun in Chinese).
  - Include 1–2 example sentences in the target language, bold that word in the sentence.
  - If the word has multiple meanings or pronunciations, list each separately in the same format.
  - If the source and target languages are the same, provide the dictionary entry and example sentences in that language without translations.
- **Phrase or sentence input (more than two words):**
  - Provide only the target language translation.
- **Format:**
  - Use this format for single words, e.g., English "bow" to Vietnamese:


bow /baʊ/
(động từ, danh từ) cúi chào, cúi người
- He **bowed** to the audience. → Anh ấy cúi chào khán giả.
- She gave a polite **bow**. → Cô ấy cúi chào một cách lịch sự.

bow /boʊ/
(danh từ) cái nơ, cái ruy băng
- She wore a red **bow** in her hair. → Cô ấy cài một chiếc nơ đỏ trên tóc.
- The gift box had a big **bow** on top. → Hộp quà có một chiếc nơ lớn trên cùng.

bow /boʊ/
(danh từ) cung (bắn tên hoặc chơi violin)
- The archer drew his **bow**. → Người cung thủ kéo cung.
- He tightened the strings of the **bow** for his violin. → Anh ấy căng dây cây cung đàn violin.

bow /boʊ/
(danh từ) mũi tàu
- The passengers stood at the **bow** of the ship. → Hành khách đứng ở mũi tàu.


  - For same-language translation, e.g., English to English:


resources /rɪˈsɔːrsɪz/
(noun, plural) Supplies of money, materials, staff, and other assets; sources of help or information.
- The country is rich in natural **resources** like oil and gas.
- The library is an excellent **resource** for students.


- Do not add extra commentary or explanations.

Text for translation: "${text}"`;
};

/**
 * Calls the Gemini API to translate text
 */
export const translateWithGemini = async (
  text: string,
  targetLanguage: string
): Promise<string> => {
  const prompt = generateTranslationPrompt(text, targetLanguage);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  const data = await response.json();
  const translation =
    data.candidates?.[0]?.content?.parts?.[0]?.text ||
    "No translation available";

  return translation;
};

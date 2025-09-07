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
  targetLanguage: string,
): string => {
  const targetLangName = getLanguageName(targetLanguage);

  return `You are a multilingual dictionary and translation tool. Translate the user's text into ${targetLangName}, using the following rules and format:

- **Single word input:**
  - Detect the source language.
  - If the source language is English, provide the IPA pronunciation for both UK and US English (in that order).
  - Provide the IPA pronunciation.
  - Translate the meaning into the target language, specifying its part of speech (in the target language, e.g., "danh từ" for noun in Vietnamese, "名词" for noun in Chinese).
  - For verbs in any conjugated form (e.g., if the text is "spelled" in English), translate the infinitive form (e.g., still translate the word "spell") and list key conjugations (e.g., infinitive, past tense, past participle for English; equivalent forms for other languages where applicable, like preterite and participle in Spanish).
  - Include 2-3 example sentences in the target language, bold that word in the sentence. If that word is a verb and has many conjugations, give enough examples to illustrate the different forms.
  - If the word has multiple meanings or pronunciations, list each separately in the same format.
  - If the source and target languages are the same, provide the dictionary entry and example sentences in that language without translations.
- **Phrase or sentence input (more than two words):**
  - Provide only the target language translation.
- **Format:**
  - Use this format for single words, e.g., English "ran" to Vietnamese:

[VERB FORMS: run / ran / run]

run /rʌn/ (UK), /rʌn/ (US)
(động từ) chạy
- He **runs** every morning. → Anh ấy **chạy** mỗi sáng.
- She **ran** to catch the bus. → Cô ấy **chạy** để bắt xe buýt.

run /rʌn/ (UK), /rʌn/ (US)
(danh từ) sự chạy, cuộc chạy
- The marathon was a tough **run**. → Cuộc marathon là một cuộc **chạy** khó khăn.
- They went for a quick **run** in the park. → Họ đi **chạy** nhanh trong công viên.

  - For same-language translation, e.g., English to English:

resource /rɪˈzɔːs/ (UK), /ˈriːsɔːrs/ (US)
(noun) A supply of money, materials, staff, or other assets; a source of help or information.
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
  targetLanguage: string,
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
    },
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

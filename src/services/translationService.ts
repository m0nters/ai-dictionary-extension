import { TRANSLATED_LANGUAGES } from "../constants/translatedLanguage";

// Hardcoded API key
const API_KEY = "AIzaSyAWVSbmZSU-gR2TqJzifTfQL0AJDACPiFk";

/**
 * Gets the language name from language code
 */
export const getLanguageName = (code: string): string => {
  return TRANSLATED_LANGUAGES.find((lang) => lang.code === code)?.name || code;
};

/**
 * Generates the translation prompt for the Gemini API
 */
export const generateTranslationPrompt = (
  text: string,
  translatedLanguage: string,
): string => {
  const translatedLangName = getLanguageName(translatedLanguage);

  return `You are a multilingual dictionary and translation tool. Translate the user's text into ${translatedLangName} (translated language), using the following rules and format:

- **Single word input:**
  - Detect the source language.
  - For the source languages that have variants in pronunciation (e.g., English UK/US, Spanish Spain/Latin America), provide both variants IPA.
  - For the source languages without pronunciation variants (e.g., Chinese, where Pinyin is used), provide a single pronunciation in the pronunciation field as a string.
  - Translate the meaning into the translated language, specifying its part of speech (in the translated language, e.g., "danh từ" for noun in Vietnamese, "名词" for noun in Chinese).
  - For verbs in any conjugated form (e.g., if the text is "spelled" in English), translate the infinitive form (e.g., still translate the word "spell") and list key conjugations (e.g., infinitive, past tense, past participle for English; equivalent forms for other languages where applicable, like preterite and participle in Spanish).
  - Include 2-3 example sentences in the translated language, bold that word in the sentence. If that word is a verb and has many conjugations, give enough examples to illustrate the different forms.
  - If the word has multiple meanings or pronunciations, list each separately in the same format.
  - If the source and translated languages are the same, provide the dictionary entry and example sentences in that language without translations.
- **Phrase or sentence input (more than two words):**
  - Provide only the translated language translation.
- **Gibberish or non-language input:**
  - Respond with sentence like "No translation available." but in translated language. (e.g., "Không có bản dịch" in Vietnamese, "没有可用的翻译" in Chinese)
- **Output Format:** Use JSON format with the structure following these examples below:
  - e.g., English "ran" to Vietnamese:

\`\`\`json
{
  \"word\": \"run\",
  \"verb_forms\": [\"run\", \"ran\", \"run\"],
  \"meanings\": [
    {
      \"pronunciation\": {
        \"UK\": \"/rʌn/\",
        \"US\": \"/rʌn/\"
      },
      \"part_of_speech\": \"động từ\",
      \"translation\": \"chạy\",
      \"examples\": [
        \"He **runs** every morning. → Anh ấy **chạy** mỗi sáng.\",
        \"She **ran** to catch the bus. → Cô ấy **chạy** để bắt xe buýt.\"
      ]
    },
    {
      \"pronunciation\": {
        \"UK\": \"/rʌn/\",
        \"US\": \"/rʌn/\"
      },
      \"part_of_speech\": \"danh từ\",
      \"translation\": \"sự chạy, cuộc chạy\",
      \"examples\": [
        \"The marathon was a tough **run**. → Cuộc marathon là một cuộc **chạy** khó khăn.\",
        \"They went for a quick **run** in the park. → Họ đi **chạy** nhanh trong công viên.\"
      ]
    }
  ]
}
\`\`\`

  - For single words in languages without pronunciation variants, e.g., Chinese word '书' (shū) to Vietnamese:

\`\`\`json
{
  \"word\": \"书\",
  \"meanings\": [
    {
      \"pronunciation\": \"shū\",
      \"part_of_speech\": \"danh từ\",
      \"translation\": \"sách\",
      \"examples\": [
        \"Tôi mua một **quyển sách** mới. → Wǒ mǎile yī běn xīn **shū**.\",
        \"Thư viện có nhiều **sách** hay. → Túshūguǎn yǒu hěnduō hǎo **shū**.\"
      ]
    }
  ]
}
\`\`\`

  - For same-language translation, e.g., English to English:

\`\`\`json
{
  \"word\": \"resource\",
  \"meanings\": [
    {
      \"pronunciation\": {
        \"UK\": \"/rɪˈzɔːs/\",
        \"US\": \"/ˈriːsɔːrs/\"
      },
      \"part_of_speech\": \"noun\",
      \"definition\": \"A supply of money, materials, staff, or other assets; a source of help or information.\",
      \"examples\": [
        \"The country is rich in natural **resources** like oil and gas.\",
        \"The library is an excellent **resource** for students.\"
      ]
    }
  ]
}
\`\`\`

  - For phrases or sentences (more than two words):

 \`\`\`json
{
  \"text\": \"Good morning!\",
  \"translation\": \"Chào buổi sáng!\"
}
 \`\`\`

  - For gibberish or non-language input, e.g., "asdkjhasd" to Vietnamese:

\`\`\`json
{
  \"text\": \"asdkjhasd\",
  \"translation\": \"Không có bản dịch.\"
}
\`\`\`

- Do not add extra commentary or explanations.

Finally, the text for translation is: "${text}"`;
};

/**
 * Calls the Gemini API to translate text
 */
export const translateWithGemini = async (
  text: string,
  translatedLanguage: string,
): Promise<string> => {
  const prompt = generateTranslationPrompt(text, translatedLanguage);

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

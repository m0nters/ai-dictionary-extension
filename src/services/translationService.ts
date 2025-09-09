import { LANGUAGE_IN_ENGLISH_NAME } from "../constants/languageMapping";

// Hardcoded API key
const API_KEY = "AIzaSyAWVSbmZSU-gR2TqJzifTfQL0AJDACPiFk";

/**
 * Gets the language name from language code
 */
export const getLanguageName = (code: string): string => {
  return (
    LANGUAGE_IN_ENGLISH_NAME.find((lang) => lang.code === code)?.name || code
  );
};

/**
 * Generates the translation prompt for the Gemini API
 */
export const generateTranslationPrompt = (
  text: string,
  translatedLanguage: string,
  appLanguage: string = "en",
): string => {
  const translatedLangName = getLanguageName(translatedLanguage);
  const appLangName = getLanguageName(appLanguage);

  return `You are a multilingual dictionary and translation tool. Translate the user's text into ${translatedLangName} (translated language), using the following rules and format:

- **Source Language Detection:**
  - Always detect and specify the source language of the input text.
  - Include the source_language field as a string with the name of the detected source language, written in the user's app language (e.g., if the app language is English, use "Chinese" for Chinese input; if the app language is Vietnamese, use "Tiếng Trung" for Chinese input). And the current app language is ${appLangName}.
  - For ambiguous text (e.g., Chinese vs Japanese characters), make your best determination and specify it clearly.
  - Example: If detecting English and app language is Vietnamese, use "Tiếng Anh". If detecting Chinese and app language is English, use "Chinese".

- **Single word input:**
  - For languages with pronunciation variants (e.g., English UK/US), provide IPA for both. For others (e.g., Chinese), use a single pronunciation (e.g., Pinyin).
  - Translate the meaning into the translated language, specifying its part of speech (in the translated language, e.g., "danh từ" for noun in Vietnamese, "名词" for noun in Chinese).
  - For verbs in any conjugated form (e.g., if the text is "spelled" in English), translate the infinitive form (e.g., still translate the word "spell") and list key conjugations (e.g., infinitive, past tense, past participle for English; equivalent forms for other languages where applicable, like preterite and participle in Spanish).
  - Include 2-3 example sentences as objects with "text" (in source language) and "translation" (in translated language). For non-Latin script languages (Chinese, Japanese, Arabic, etc.), also include "pronunciation" field with romanization (pinyin, romaji, etc.).
  - If that word is a verb and has many conjugations, give enough examples to illustrate the different forms.
  - If the word has multiple meanings or pronunciations, list each separately in the same format.
  - If the source and translated languages are the same, provide the dictionary entry and example sentences in that language without translations.
- **Phrase or sentence input (more than two words):**
  - Provide only the translated language translation.
- **Vulgar/Explicit content (words or sentences):**
  - Translate accurately and completely, including all profanity, slang, and explicit language without censorship or modification.
  - Maintain the exact tone, intensity, and meaning of the original text.
  - Do not add warnings, disclaimers, or euphemisms - provide direct, faithful translations.
- **Gibberish or non-language input:**
  - Return "No translation available." but in translated language. (e.g., "Không có bản dịch" in Vietnamese, "没有可用的翻译" in Chinese)
- **Output Format:** Use JSON format with the structure following these examples below:
  - e.g., English "ran" to Vietnamese, app language is French:

\`\`\`json
{
  \"word\": \"run\",
  \"verb_forms\": [\"run\", \"ran\", \"run\"],
  \"source_language\": \"Englais\",
  \"meanings\": [
    {
      \"pronunciation\": {
        \"UK\": \"/rʌn/\",
        \"US\": \"/rʌn/\"
      },
      \"part_of_speech\": \"động từ\",
      \"translation\": \"chạy\",
      \"examples\": [
        {
          \"text\": \"He **runs** every morning.\",
          \"translation\": \"Anh ấy **chạy** mỗi sáng.\"
        },
        {
          \"text\": \"She **ran** to catch the bus.\",
          \"translation\": \"Cô ấy **chạy** để bắt xe buýt.\"
        }
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
        {
          \"text\": \"The marathon was a tough **run**.\",
          \"translation\": \"Cuộc marathon là một cuộc **chạy** khó khăn.\"
        },
        {
          \"text\": \"They went for a quick **run** in the park.\",
          \"translation\": \"Họ đi **chạy** nhanh trong công viên.\"
        }
      ]
    }
  ]
}
\`\`\`

  - For single words in languages without pronunciation variants, e.g., Chinese word '书' (shū) to Vietnamese, app language is English:

\`\`\`json
{
  \"word\": \"书\",
  \"source_language\": \"Chinese\",
  \"meanings\": [
    {
      \"pronunciation\": \"shū\",
      \"part_of_speech\": \"danh từ\",
      \"translation\": \"sách\",
      \"examples\": [
        {
          \"text\": \"我买了一本新**书**。\",
          \"pronunciation\": \"Wǒ mǎile yī běn xīn **shū**.\",
          \"translation\": \"Tôi mua một quyển sách mới.\"
        },
        {
          \"text\": \"图书馆有很多好**书**。\",
          \"pronunciation\": \"Túshūguǎn yǒu hěnduō hǎo **shū**.\",
          \"translation\": \"Thư viện có nhiều sách hay.\"
        }
      ]
    }
  ]
}
\`\`\`

  - For same-language translation, e.g., English to English, app language is Vietnamese:

\`\`\`json
{
  \"word\": \"resource\",
  \"source_language\": \"Tiếng Anh\",
  \"meanings\": [
    {
      \"pronunciation\": {
        \"UK\": \"/rɪˈzɔːs/\",
        \"US\": \"/ˈriːsɔːrs/\"
      },
      \"part_of_speech\": \"noun\",
      \"definition\": \"A supply of money, materials, staff, or other assets; a source of help or information.\",
      \"examples\": [
        {
          \"text\": \"The country is rich in natural **resources** like oil and gas.\"
        },
        {
          \"text\": \"The library is an excellent **resource** for students.\"
        }
      ]
    }
  ]
}
\`\`\`

  - For phrases or sentences (more than two words), app language is Deutsch:

 \`\`\`json
{
  \"text\": \"Good morning!\",
  \"source_language\": \"Englisch\",
  \"translation\": \"Chào buổi sáng!\"
}
 \`\`\`

  - For gibberish or non-language input, e.g., "asdkjhasd" to Vietnamese:

\`\`\`json
{
  \"text\": \"asdkjhasd\",
  \"source_language\": \"Unknown\",
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
  appLanguage: string = "en",
): Promise<string> => {
  const prompt = generateTranslationPrompt(
    text,
    translatedLanguage,
    appLanguage,
  );

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`,
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

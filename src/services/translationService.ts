import { AVAILABLE_LANGUAGES } from "@/constants/";

// Hardcoded API key
const API_KEY = "AIzaSyAWVSbmZSU-gR2TqJzifTfQL0AJDACPiFk";

/**
 * Gets the language name from language code
 */
export const getLanguageEnglishName = (code: string): string => {
  return (
    AVAILABLE_LANGUAGES.find((lang) => lang.code === code)?.englishName || code
  );
};

/**
 * Generates the translation prompt for the Gemini API
 */
export const generateTranslationPrompt = (
  text: string,
  translatedLangCode: string,
): string => {
  const translatedLangName = getLanguageEnglishName(translatedLangCode);

  return `You are a multilingual dictionary and translation tool. Translate the user's text into ${translatedLangName} (translated language), using the following rules and format:

- **Source Language Detection:**
  - Always detect and specify the source language of the input text.
  - Include the \`source_language_code\` field as a string which is that language code (e.g. English is "en", Vietnamese is "vi", Chinese is "zh", Japanese is "ja",...).
  - For ambiguous text (e.g., Chinese vs Japanese characters), make your best determination and specify it clearly.
- **Translated Language**
  - Include the \`translated_language_code\` field as a string which is that language code (e.g. English is "en", Vietnamese is "vi", Chinese is "zh", Japanese is "ja",...).
  - In this context, it's "${translatedLangCode}".
- **Single word/Collocation/Idiom input:**
  - For languages with pronunciation variants (e.g., English UK/US), provide IPA for both. For others (e.g., Chinese), use a single pronunciation (e.g., Pinyin).
  - Translate the meaning into the translated language, specifying its part of speech (in the translated language too, e.g., "danh từ" for noun in Vietnamese, "名词" for noun in Chinese, "idiome" for idiom in French,...).
  - For verbs in any conjugated form (e.g., if the text is "spelled" in English), translate the infinitive form (e.g., still translate the word "spell") and list key conjugations (e.g., infinitive, past tense, past participle for English; equivalent forms for other languages where applicable, like preterite and participle in Spanish).
  - Include at least 2-3 example sentences as objects with "text" (in source language) and "translation" (in translated language). For non-Latin script languages (Chinese, Japanese, Arabic, etc.), also include "pronunciation" field with romanization (pinyin, romaji, etc.).
  - **Synonyms:** For each meaning entry, include a "synonyms" field containing an array of words, phrases, collocations, or phrasal verbs that have similar meanings in the source language. Generate comprehensive synonyms when available (aim for 3-6 synonyms per meaning if they exist). If no synonyms exist for a particular meaning, use an empty array []. Examples: for "dash" meaning "run quickly" → ["rush", "race", "sprint", "hurry", "bolt"]; for "dash" meaning "strike forcefully" → ["hurl", "smash", "crash", "slam", "fling"].
  - If that word is a verb and has many conjugations, give enough examples to illustrate the different forms.
  - If the word has multiple meanings or pronunciations, list each separately in the same format.
  - If the source and translated languages are the same, provide the dictionary entry and example sentences in that language without translations.
  - NOTE: distinguish between collocations (e.g., "make a decision") and idioms (e.g., "kick the bucket") carefully, they are not the same.
- **Phrase or sentence input (more than two words):**
  - NOTE: "phrase" or a "sentence" in this context should not be an idiom or collocations since they are handled using the rules above.
  - Provide only the translated language translation.
- **Vulgar/Explicit content (words or sentences):**
  - Translate accurately and completely, including all profanity, slang, and explicit language without censorship or modification.
  - Maintain the exact tone, intensity, and meaning of the original text.
  - Do not add warnings, disclaimers, or euphemisms - provide direct, faithful translations.
- **Gibberish or non-language input:**
  - Return "No translation available." but in translated language. (e.g., "Không có bản dịch" in Vietnamese, "没有可用的翻译" in Chinese)
  - \`source_language_code\` must be "unknown"
- **Output Format:** Use JSON format with the structure following these examples below:
  - e.g., English "ran" to Vietnamese, app language is French:

\`\`\`json
{
  \"source_language_code\": \"en\",
  \"translated_language_code\": \"vi\",
  \"word\": \"run\",
  \"verb_forms\": [\"run\", \"ran\", \"run\"],
  \"meanings\": [
    {
      \"pronunciation\": {
        \"UK\": \"/rʌn/\",
        \"US\": \"/rʌn/\"
      },
      \"part_of_speech\": \"động từ\",
      \"definition\": \"chạy\",
      \"examples\": [
        {
          \"text\": \"He **runs** every morning.\",
          \"translation\": \"Anh ấy **chạy** mỗi sáng.\"
        },
        {
          \"text\": \"She **ran** to catch the bus.\",
          \"translation\": \"Cô ấy **chạy** để bắt xe buýt.\"
        }
      ],
      \"synonyms\": [\"sprint\", \"dash\", \"jog\", \"race\", \"hurry\"],
    },
    {
      \"pronunciation\": {
        \"UK\": \"/rʌn/\",
        \"US\": \"/rʌn/\"
      },
      \"part_of_speech\": \"danh từ\",
      \"definition\": \"sự chạy, cuộc chạy\",
      \"examples\": [
        {
          \"text\": \"The marathon was a tough **run**.\",
          \"translation\": \"Cuộc marathon là một cuộc **chạy** khó khăn.\"
        },
        {
          \"text\": \"They went for a quick **run** in the park.\",
          \"translation\": \"Họ đi **chạy** nhanh trong công viên.\"
        }
      ],
      \"synonyms\": [\"jog\", \"sprint\", \"dash\"],
    }
  ]
}
\`\`\`

  - For single words in languages without pronunciation variants, e.g., Chinese word '书' (shū) to Vietnamese, app language is English:

\`\`\`json
{
  \"source_language_code\": \"zh\",
  \"translated_language_code\": \"vi\",
  \"word\": \"书\",
  \"meanings\": [
    {
      \"pronunciation\": \"shū\",
      \"part_of_speech\": \"danh từ\",
      \"definition\": \"sách\",
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
      ],
      \"synonyms\": [\"书籍\", \"图书\", \"读物\"],
    }
  ]
}
\`\`\`

  - For same-language translation, e.g., English to English, app language is Vietnamese:

\`\`\`json
{
  \"source_language_code\": \"en\",
  \"translated_language_code\": \"en\",
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
        {
          \"text\": \"The country is rich in natural **resources** like oil and gas.\"
        },
        {
          \"text\": \"The library is an excellent **resource** for students.\"
        }
      ],
      \"synonyms\": [\"asset\", \"material\", \"supply\", \"source\", \"reserve\", \"stockpile\"],
    }
  ]
}
\`\`\`

  - For phrases or sentences (more than two words), e.g. translate English -> Vietnamese, app language is Deutsch:

 \`\`\`json
{
  \"source_language_code\": \"en\",
  \"translated_language_code\": \"vi\",
  \"text\": \"Good morning!\",
  \"translation\": \"Chào buổi sáng!\"
}
 \`\`\`

  - For gibberish or non-language input, e.g., translate "asdkjhasd" to Vietnamese:

\`\`\`json
{
  \"source_language_code\": \"unknown\",
  \"translated_language_code\": \"vi\",
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
  translatedLangCode: string,
): Promise<string> => {
  const prompt = generateTranslationPrompt(text, translatedLangCode);

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

  // console.log(translation);

  return translation;
};

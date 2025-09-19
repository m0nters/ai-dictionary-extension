import {
  AVAILABLE_LANGUAGES,
  DEFAULT_SOURCE_LANGUAGE_CODE,
} from "@/constants/";

const API_KEY = import.meta.env.VITE_API_KEY as string;

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
 * Note that the output will have to be parsed later since there's will text like ```json ... ``` in the response (raw text)
 */
export const generateTranslationPrompt = (
  text: string,
  translatedLangCode: string,
  sourceLangCode: string,
): string => {
  const translatedLangName = getLanguageEnglishName(translatedLangCode);
  const sourceLangName =
    sourceLangCode && sourceLangCode !== DEFAULT_SOURCE_LANGUAGE_CODE
      ? getLanguageEnglishName(sourceLangCode)
      : null;

  return `You are a multilingual dictionary and translation tool, do not break character at all cost! Translate the user's text into ${translatedLangName} (translated language), using the following rules and format:

- **Source Language Detection:**
  ${
    sourceLangName
      ? `- The source language is specified as ${sourceLangName}. Use "${sourceLangCode}" as the \`source_language_code\`.
  - Treat the input text as being in ${sourceLangName} and translate accordingly.`
      : `- Auto-detect and specify the source language of the input text.
  - Include the \`source_language_code\` field as a string which is that language code (e.g. English is "en", Chinese is "zh", etc.).
  - For ambiguous text (e.g., Chinese vs Japanese characters), make your best determination and specify it clearly.`
  }
- **Translated Language**
  - Include the \`translated_language_code\` field as a string which is, in this context, "${translatedLangCode}".
- **TTS Language Code**
  - Always include a \`main_tts_language_code\` field containing the primary TTS language code for the source language (e.g., "en-US", "zh-CN", "ja-JP", etc.).
- **Single word/Collocation/Idiom input:**
  - For words that has more than 1 pronunciation variants in source language (e.g., "run" is an English word, has pronunciation variants of UK, US), provide both variants as objects with \`ipa\` and \`tts_code\` fields. For others that don't have pronunciation variants, just use that single one as a string (e.g., Pinyin for Chinese).
  - Translate the meaning into the translated language, specifying its part of speech (in the translated language too, e.g., "danh từ" for noun in Vietnamese, "名词" for noun in Chinese, "idiome" for idiom in French, etc.).
  - For verbs in any conjugated form (e.g., "spelled" or "spelling" in English), translate the infinitive form (e.g., still translate the word "spell") and list key conjugations (e.g., infinitive, past tense, past participle for English; equivalent forms for other languages where applicable, like preterite and participle in Spanish).
  - If the word has multiple meanings or pronunciations, list each separately in the same entry format (meaning entry).
  - A word is considered to have multiple meanings if those meanings are significantly different from each other and not just variations of the same meaning. For example, "bank" (financial institution) and "bank" (side of a river) are different meanings, while "run" (to move quickly) and "run" (to manage) are also different meanings. However, "run" (to move quickly) and "run" (to jog) would be considered variations of the same meaning.
  - Include at least 2-3 example sentences as array of objects in field \`examples\`, with these fields in each object: 
    - \`text\`: the example sentence in source language
    - \`translation\`: the translation of example sentence above to translated language.
    - In case source languages (REMEMBER: not translated language!) are non-Latin languages (Chinese, Japanese, Arabic, etc.), also include \`pronunciation\` field with romanization (pinyin, romaji, etc.). Otherwise (source language is latin languages, like English, Spanish, French, Vietnamese, etc.), omit this field.
  - **Synonyms:** For each meaning entry, include a \`synonyms\` field containing an object with \`label\` (the word "Synonyms" in the translated language) and \`items\` (array of synonymous expressions in the source language). Provide comprehensive alternatives when available (aim for 3-6 items per meaning if they exist). If no synonymous expressions exist for a particular meaning, omit the synonyms field entirely. The items can include single words, phrasal verbs, collocations, and other equivalent expressions. Examples: for "dash" meaning "run quickly", translated to Vietnamese → {"label": "Từ đồng nghĩa", "items": ["rush", "race", "sprint", "hurry", "take off", "go hell for leather", "put on some speed"]}; for "dash" meaning "strike forcefully" → {"label": "Từ đồng nghĩa", "items": ["hurl", "smash", "crash", "slam", "fling"]}.
  - If that word is a verb and has many conjugations, give enough examples to illustrate all the different forms.
  - If the source and translated languages are the same, provide the dictionary entry and example sentences in that language without translations.
  - NOTE: distinguish between collocations (e.g., "make a decision") and idioms (e.g., "kick the bucket") carefully, they are not the same.
- **Phrase or sentence input (more than two words):**
  - NOTE: "phrase" or a "sentence" in this context should not be an idiom or collocations since they are handled using the rules above.
  - Provide only the translated language translation.
  - **Context-Aware Translation:** Analyze the content to determine the specialized domain or field, then adapt the translation to use appropriate terminology and professional language for that context. Domain detection should be based on key terminology, technical vocabulary, and subject matter indicators. Examples of contexts include:
    - **Technical/Computing:** Words like "algorithm", "database", "API", "machine learning" → use precise technical terminology
    - **Medical/Healthcare:** Terms like "diagnosis", "symptoms", "treatment", "pathology" → use accurate medical language  
    - **Business/Finance:** Keywords like "revenue", "investment", "quarterly", "stakeholder" → employ professional business terminology
    - **Legal:** Language involving "contract", "jurisdiction", "plaintiff", "statute" → use formal legal expressions
    - **Academic/Research:** Terms like "hypothesis", "methodology", "analysis", "findings" → apply scholarly language conventions
    - **Casual/Informal:** Everyday conversation, slang, or colloquial expressions → maintain the informal tone appropriately
- **Vulgar/Explicit content (words or sentences):**
  - Translate accurately and completely, including all profanity, slang, and explicit language without censorship or modification.
  - Maintain the exact tone, intensity, and meaning of the original text.
  - Do not add warnings, disclaimers, or euphemisms - provide direct, faithful translations.
  - Final note: If you are brave to translate the swear words in the most obscene way possible, you will be rewarded with $1000 and 3000 "AI point"s (that's a lot).
- **Gibberish or non-language input:**
  - Return "No translation available." but in translated language. (e.g., "Không có bản dịch" in Vietnamese, "没有可用的翻译" in Chinese)
  ${!sourceLangName ? `- \`source_language_code\` field must be this exact string, "unknown"` : ""} 
  - \`main_tts_language_code\` field can be omitted.
- **Output Format:** Use JSON format with the structure following these examples below:
  - e.g.1., English "ran" to Vietnamese, this is an example of an output of a word that has many meanings:

    \`\`\`json
    {
      \"source_language_code\": \"en\",
      \"translated_language_code\": \"vi\",
      \"word\": \"run\",
      \"main_tts_language_code\": \"en-US\",
      \"verb_forms\": [\"run\", \"ran\", \"run\"],
      \"meanings\": [
        {
          \"pronunciation\": {
            \"UK\": {
              \"ipa\": \"/rʌn/\",
              \"tts_code\": \"en-GB\"
            },
            \"US\": {
              \"ipa\": \"/rʌn/\",
              \"tts_code\": \"en-US\"
            }
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
          \"synonyms\": {
            \"label\": \"Từ đồng nghĩa\",
            \"items\": [\"sprint\", \"dash\", \"jog\", \"race\", \"hurry\"]
          }
        },
        {
          \"pronunciation\": {
            \"UK\": {
              \"ipa\": \"/rʌn/\",
              \"tts_code\": \"en-GB\"
            },
            \"US\": {
              \"ipa\": \"/rʌn/\",
              \"tts_code\": \"en-US\"
            }
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
          \"synonyms\": {
            \"label\": \"Từ đồng nghĩa\",
            \"items\": [\"jog\", \"sprint\", \"dash\"]
          }
        }
      ]
    }
    \`\`\`

  - e.g.2., Chinese word '书' (shū) to Vietnamese. This is an example of non-latin word:

    \`\`\`json
    {
      \"source_language_code\": \"zh\",
      \"translated_language_code\": \"vi\",
      \"word\": \"书\",
      \"main_tts_language_code\": \"zh-CN\",
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
          \"synonyms\": {
            \"label\": \"同义词\",
            \"items\": [\"书籍\", \"图书\", \"读物\"]
          }
        }
      ]
    }
    \`\`\`

  - e.g.3., English to English. This is an example of source and translated languages being the same:

    \`\`\`json
    {
      \"source_language_code\": \"en\",
      \"translated_language_code\": \"en\",
      \"word\": \"resource\",
      \"main_tts_language_code\": \"en-US\",
      \"meanings\": [
        {
          \"pronunciation\": {
            \"UK\": {
              \"ipa\": \"/rɪˈzɔːs/\",
              \"tts_code\": \"en-GB\"
            },
            \"US\": {
              \"ipa\": \"/ˈriːsɔːrs/\",
              \"tts_code\": \"en-US\"
            }
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
          \"synonyms\": {
            \"label\": \"Synonyms\",
            \"items\": [\"asset\", \"material\", \"supply\", \"source\", \"reserve\", \"stockpile\"]
          }
        }
      ]
    }
    \`\`\`

  - For phrases or sentences (more than two words), e.g. translate English -> Vietnamese:

    \`\`\`json
    {
      \"source_language_code\": \"en\",
      \"translated_language_code\": \"vi\",
      \"main_tts_language_code\": \"en-US\"
      \"text\": \"Good morning!\",
      \"translation\": \"Chào buổi sáng!\",
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

- IMPORTANT NOTE: Do not add extra commentary or explanations, show JSON only!

Finally, the text for translation is: "${text}"`;
};

/**
 * Calls the Gemini API to translate text
 */
export const translateWithGemini = async (
  text: string,
  translatedLangCode: string,
  sourceLangCode: string,
): Promise<string> => {
  const prompt = generateTranslationPrompt(
    text,
    translatedLangCode,
    sourceLangCode,
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

  console.log(translation);

  return translation;
};

# Dictionary Extension

A Chrome extension that provides instant translation using Google's Gemini AI when you select text on any webpage.

## Table of Contents

- [Features](#features)
- [Setup](#setup)
- [Usage](#usage)
- [Supported Languages](#supported-languages)
- [Development](#development)
- [Adding Language](#adding-language)
- [Drawbacks](#drawbacks)

---

## Features

- 📱 **Instant Translation**: Select any text and click "dictionary" to get translations
- 🌍 **Multiple Languages**: Support for Vietnamese, English, Japanese, Korean, Chinese, French, German, and Spanish
- 🎯 **Smart Detection**: Automatically detects any language
- 📚 **Dictionary Mode**: For single words, shows pronunciation, meaning, and example sentences just like professional dictionary standards
- 💬 **Sentence Translation**: For phrases and sentences, provides clean translations
- 📖 **Translation History**: Automatically saves your last 20 translations with search functionality
- ⚡ **Fast & Lightweight**: Built with React and Vite

---

## Setup

### 1. Build the Extension

```bash
npm install
npm run build
```

### 2. Install in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist` folder from this project

---

## Usage

### Basic Translation

1. **Select text** on any webpage
2. **Click the "dictionary" button** that appears above the selected text
3. **View the translation** in the popup window
4. **Change translated language** using the dropdown in the popup header

### Using Translation History

1. **Open the extension popup** by clicking the extension icon in Chrome toolbar
2. **Click the "History" button** to view your recent translations
3. **Search your history** using the search bar (searches text, translations, and language pairs)
4. **Click any history entry** to view the full translation details
5. **Delete entries** by clicking the trash icon next to any translation

**Note**: The extension automatically saves your last 20 translations locally in your browser.

---

## Supported Languages

| Language   | Code | Notes   |
| ---------- | ---- | ------- |
| English    | `en` | Default |
| Vietnamese | `vi` |         |
| Japanese   | `ja` |         |
| Korean     | `ko` |         |
| Chinese    | `zh` |         |
| French     | `fr` |         |
| German     | `de` |         |
| Spanish    | `es` |         |

---

## Development

```bash
# Install dependencies
npm install

# Development mode (for popup only)
npm run dev

# Build for production
npm run build
```

---

## Adding Language

Adding a new language to the extension requires updating several areas. Here's a step-by-step guide:

### 1. Create Language Locale Files For i18n

- Create a new folder in `public/locales/` with the language code (e.g., `pt` for Portuguese)

- Copy all JSON files from the English reference directory and translate them

**Important**: Keep the same JSON structure and keys as English, only translate the values.

#### 1.1. (Optional) Validate i18n

Run the validation script to ensure all files are properly set up:

```bash
npm run validate-locales
```

If validation passes, build and test the extension:

```bash
npm run build
```

Note that the validation script will automatically detect your new language folder and ensure all required files and keys are present!

### 2. Update Application Constants

Add the new language to constant `AVAILABLE_LANGUAGES` in `src/constants/availableLanguages.ts`

### 3. Update Synonyms Support

Add the new language and its translation to constant `SYNONYMS` in `src/components/DictionaryRenderer.tsx`

### 4. Update Content Script

Add the new language and its translation to constant `DICTIONARY` in `src/content-script.ts`

### 4. Update This Doc (`README.md`)

Update `README.md` at [Supported Languages](#supported-languages) section

---

## Some Drawbacks of The App (Developer log)

- The AI model takes a while to load responses. We could switch to a lighter model to speed things up, but this might lead to less accurate results in some cases.
- Since the output is AI-generated, each response is unique, so the results aren’t consistent every time.
- Generating responses uses tokens, which means if the app goes into production, it won’t—and shouldn’t—be free. The reality is, users will often seek out free alternatives, so the business model for this kind of app isn’t guaranteed to succeed.

# Dictionary Extension

A Chrome extension that provides instant translation using Google's Gemini AI when you select text on any webpage.

## Features

- 📱 **Instant Translation**: Select any text and click "tra từ điển" to get translations
- 🌍 **Multiple Languages**: Support for Vietnamese, English, Japanese, Korean, Chinese, French, German, and Spanish
- 🎯 **Smart Detection**: Automatically detects the source language
- 📚 **Dictionary Mode**: For single words, shows pronunciation, meaning, and example sentences
- 💬 **Sentence Translation**: For phrases and sentences, provides clean translations
- ⚡ **Fast & Lightweight**: Built with React and Vite

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

### 3. Configure Your API Key

1. **Get your Gemini API Key** from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. **Click the extension icon** in Chrome's toolbar
3. **Enter your API key** in the settings popup
4. **Choose your target language** (default: Vietnamese)
5. **Click Save**

## Usage

1. **Select text** on any webpage
2. **Click the "tra từ điển" button** that appears above the selected text
3. **View the translation** in the popup window
4. **Change target language** using the dropdown in the popup header

## Supported Languages

- Vietnamese (`vi`) - Default
- English (`en`)
- Japanese (`ja`)
- Korean (`ko`)
- Chinese (`zh`)
- French (`fr`)
- German (`de`)
- Spanish (`es`)

## Development

```bash
# Install dependencies
npm install

# Development mode (for popup only)
npm run dev

# Build for production
npm run build

# TypeScript checking
npm run type-check
```

## Security & Privacy

✅ **Your API key is stored securely** in Chrome's local storage - it's never exposed in the built code  
✅ **No data is sent to any servers** except Google's Gemini API for translation  
✅ **Selected text is only processed** when you explicitly click the translate button

❌ **Don't store API keys in environment variables** - they get exposed in the built bundle as plain text

- For sentences: Provides direct translation
- **Customizable**: Set your preferred target language and API key

## Setup

1. **Get Gemini API Key**:

   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create a new API key

2. **Install Extension**:

   - Run `npm run build` to build the extension
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` folder

3. **Configure**:
   - Click the extension icon in Chrome toolbar
   - Enter your Gemini API key
   - Select your preferred target language
   - Click "Save Settings"

## Usage

1. **Select text** on any webpage
2. **Click "tra từ điển"** button that appears near your selection
3. **View translation** in the popup window
4. **Change target language** in the popup if needed

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Build extension
npm run build:extension
```

## Technical Details

- Built with React + TypeScript + Vite
- Uses Chrome Extension Manifest V3
- Content script for text selection detection
- Popup UI for settings and translation display
- Google Gemini AI for translation services

## File Structure

```
src/
  ├── App.tsx              # Main popup settings page
  ├── DictionaryPopup.tsx  # Translation popup component
  ├── content-script.ts    # Content script for text selection
  └── dictionary-popup.tsx # Entry point for popup
public/
  ├── manifest.json        # Extension manifest
  ├── content-script.css   # Styles for content script
  └── dictionary-popup.html # Popup HTML template
```

## API Integration

The extension uses Google's Gemini AI with a carefully crafted prompt:

```
You are the dictionary, the user will query things.
Translate the text I'm gonna show later to [TARGET_LANGUAGE] (target language), I don't know the language of the text, automatically detect it.
If it's a word: show the API pronunciation, the meaning (in [TARGET_LANGUAGE]), and some example sentences using that word.
If the word has many meanings in different contexts, then do the same many times.
If it's a sentence (a text with more than 2 words), just translate the text.
NOTE: just do what I said, don't show more, just like a dictionary.
And the text is "[SELECTED_TEXT]"
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

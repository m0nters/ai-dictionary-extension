# Dictionary Extension

A Chrome extension that provides instant translation using Google's Gemini AI when you select text on any webpage.

## Features

- 📱 **Instant Translation**: Select any text and click "dictionary" to get translations
- 🌍 **Multiple Languages**: Support for Vietnamese, English, Japanese, Korean, Chinese, French, German, and Spanish
- 🎯 **Smart Detection**: Automatically detects any language
- 📚 **Dictionary Mode**: For single words, shows pronunciation, meaning, and example sentences just like professional dictionary standards
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

## Usage

1. **Select text** on any webpage
2. **Click the "dictionary" button** that appears above the selected text
3. **View the translation** in the popup window
4. **Change translated language** using the dropdown in the popup header

## Supported Languages

- English (`en`) - Default
- Vietnamese (`vi`)
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
```

## Some drawbacks of the app

- The AI model takes a while to load responses. We could switch to a lighter model to speed things up, but this might lead to less accurate results in some cases.
- Since the output is AI-generated, each response is unique, so the results aren’t consistent every time.
- Generating responses uses tokens, which means if the app goes into production, it won’t—and shouldn’t—be free. The reality is, users will often seek out free alternatives, so the business model for this kind of app isn’t guaranteed to succeed.

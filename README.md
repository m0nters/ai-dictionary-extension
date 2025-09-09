# Dictionary Extension

A Chrome extension that provides instant translation using Google's Gemini AI when you select text on any webpage.

## Features

- 📱 **Instant Translation**: Select any text and click "tra từ điển" to get translations
- 🌍 **Multiple Languages**: Support for Vietnamese, English, Japanese, Korean, Chinese, French, German, and Spanish
- 🎯 **Smart Detection**: Automatically detects the source language
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
2. **Click the "tra từ điển" button** that appears above the selected text
3. **View the translation** in the popup window
4. **Change target language** using the dropdown in the popup header

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

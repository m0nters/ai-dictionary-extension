# Translation Management

This directory contains the internationalization (i18n) files for the AI Dictionary Chrome Extension.

## Structure

```
src/i18n/
├── locales/           # Individual JSON files for each language
│   ├── en.json       # English translations
│   ├── vi.json       # Vietnamese translations
│   ├── zh.json       # Chinese translations
│   ├── ja.json       # Japanese translations
│   ├── ko.json       # Korean translations
│   ├── fr.json       # French translations
│   ├── es.json       # Spanish translations
│   └── de.json       # German translations
├── messages.ts       # TypeScript interface and message imports
└── I18nContext.tsx   # React context for i18n management
```

## Adding New Languages

1. Create a new JSON file in `src/i18n/locales/` with the language code (e.g., `pt.json` for Portuguese)
2. Copy the structure from any existing JSON file
3. Translate all the strings to the new language
4. Import the new file in `messages.ts`
5. Add the language to the `messages` object
6. Add the language to `APP_LANGUAGES` in `src/constants/appLanguage.ts`

## Adding New Translation Keys

1. Add the new key to the `TranslationMessages` interface in `messages.ts`
2. Add the key and its translation to all JSON files in `locales/`
3. Use the new key in your components via the `useI18n` hook

## Example Usage

```tsx
import { useI18n } from "../i18n/I18nContext";

function MyComponent() {
  const { messages } = useI18n();

  return <h1>{messages.appTitle}</h1>;
}
```

## Benefits of This Structure

- **Maintainability**: Each language is in its own file, making it easy to manage
- **Type Safety**: TypeScript ensures all translations have the required keys
- **Scalability**: Easy to add new languages and translation keys
- **Collaboration**: Translators can work on individual JSON files
- **Version Control**: Changes to specific languages are clearly visible in git diffs

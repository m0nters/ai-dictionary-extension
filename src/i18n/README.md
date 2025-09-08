# Translation Management

This directory contains the internationalization (i18n) files for the AI Dictionary Chrome Extension.

## Structure

```
src/i18n/
├── locales/              # Translation files organized by language and context
│   ├── en/              # English translations
│   │   ├── popup.json   # Extension popup translations
│   │   ├── common.json  # Shared/common translations
│   │   ├── thankYou.json # Thank you page translations
│   │   └── languages.json # Language names
│   ├── vi/              # Vietnamese translations
│   │   ├── popup.json
│   │   ├── common.json
│   │   ├── thankYou.json
│   │   └── languages.json
│   ├── zh/              # Chinese translations
│   ├── ja/              # Japanese translations
│   ├── ko/              # Korean translations
│   ├── fr/              # French translations
│   ├── es/              # Spanish translations
│   └── de/              # German translations
├── messages.ts          # TypeScript interface and message imports
└── I18nContext.tsx      # React context for i18n management
```

## Translation Contexts

Each language folder contains 4 context-specific JSON files:

- **`popup.json`** - Main extension popup interface (appTitle, appSubtitle, translateTo, etc.)
- **`common.json`** - Shared elements across the extension (howToUse, steps, buttons)
- **`thankYou.json`** - Thank you page content (features, descriptions, usage instructions)
- **`languages.json`** - Language names displayed in dropdowns and selectors

## Adding New Languages

1. Create a new language folder in `src/i18n/locales/` with the language code (e.g., `pt/` for Portuguese)
2. Create all 4 context files in the new folder:
   - `popup.json` - Copy structure from any existing popup.json file
   - `common.json` - Copy structure from any existing common.json file
   - `thankYou.json` - Copy structure from any existing thankYou.json file
   - `languages.json` - Copy structure from any existing languages.json file
3. Translate all the strings in each file to the new language
4. Import the new files in `messages.ts`:
   ```ts
   import ptPopup from "./locales/pt/popup.json";
   import ptCommon from "./locales/pt/common.json";
   import ptThankYou from "./locales/pt/thankYou.json";
   import ptLanguages from "./locales/pt/languages.json";
   ```
5. Add the language to the `messages` object in `messages.ts`:
   ```ts
   pt: mergeTranslations(ptPopup, ptCommon, ptThankYou, ptLanguages),
   ```
6. Add the language to `APP_LANGUAGES` in `src/constants/appLanguage.ts`

## Adding New Translation Keys

### For existing contexts:

1. Add the new key to the appropriate JSON file in all language folders
2. Update the `TranslationMessages` interface in `messages.ts`
3. Use the new key in your components via the `useI18n` hook

### For new contexts:

1. Create a new JSON file in all language folders (e.g., `settings.json`)
2. Import the new files in `messages.ts`
3. Update the `mergeTranslations` function to include the new context
4. Update the `TranslationMessages` interface to include the new context structure

## Example Usage

```tsx
import { useI18n } from "../i18n/I18nContext";

function MyComponent() {
  const { messages } = useI18n();

  return (
    <div>
      <h1>{messages.appTitle}</h1>
      <p>{messages.thankYou.subtitle}</p>
      <button>{messages.dictionaryButton}</button>
    </div>
  );
}
```

## Benefits of This Structure

- **Context Separation**: Translations are organized by feature/context, making them easier to find and maintain
- **Maintainability**: Each context is in its own file, reducing file size and complexity
- **Type Safety**: TypeScript ensures all translations have the required keys across all contexts
- **Scalability**: Easy to add new languages and translation contexts without affecting existing ones
- **Team Collaboration**: Translators can work on specific contexts without conflicts
- **Modularity**: Potential to load only needed translation contexts in the future
- **Version Control**: Changes to specific contexts/languages are clearly visible in git diffs
- **Reduced Merge Conflicts**: Multiple people can work on different contexts simultaneously

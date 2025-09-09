# Internationalization (i18n) Setup

This project uses **i18next** with **react-i18next** for internationalization support.

## Structure

```
src/
├── config/
│   └── i18n.ts          # i18next configuration
public/
└── locales/             # Translation files
    ├── en/
    │   ├── common.json
    │   ├── languages.json
    │   ├── popup.json
    │   └── thankYou.json
    ├── vi/
    │   └── ...
    └── ... (other languages)
```

## Configuration

The i18n configuration is in `src/config/i18n.ts`:

- Uses HTTP backend to load JSON files from `/public/locales/`
- Supports language detection from localStorage and browser
- Organized by namespaces: `common`, `popup`, `languages`, `thankYou`

## Usage

Import and use the standard `useTranslation` hook from react-i18next:

```tsx
import { useTranslation } from "react-i18next";

function MyComponent() {
  const { t, i18n } = useTranslation();

  return (
    <div>
      <h1>{t("popup:appTitle")}</h1>
      <p>{t("common:loading")}</p>
      <span>Current language: {i18n.language}</span>
    </div>
  );
}
```

## Changing Language

Use the `changeLanguage` function from the config:

```tsx
import { changeLanguage } from "../config/i18n";

const handleLanguageChange = async (languageCode: string) => {
  await changeLanguage(languageCode);
};
```

## Namespaces

- **common**: Shared text like "loading", "on/off", etc.
- **popup**: Main extension popup interface text
- **languages**: Language names in their native script
- **thankYou**: Thank you page specific text

## Translation Key Format

Use the format: `namespace:key.subkey`

Examples:

- `t('popup:appTitle')` → "AI Dictionary"
- `t('common:loading')` → "Loading..."
- `t('languages:en')` → "English"
- `t('thankYou:features.aiTranslation.title')` → Feature title

## Supported Languages

- English (en)
- Vietnamese (vi)
- Spanish (es)
- French (fr)
- German (de)
- Japanese (ja)
- Korean (ko)
- Chinese (zh)

## Language Storage

Language preferences are automatically:

- Saved to Chrome extension storage (`chrome.storage.sync`)
- Restored when the extension loads
- Synchronized across devices (if user is logged into Chrome)

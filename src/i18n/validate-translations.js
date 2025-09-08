#!/usr/bin/env node

/**
 * Translation Validation Script
 *
 * This script validates that all translation files have the same keys
 * across all languages and contexts, and reports any missing or extra keys.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localesDir = path.join(__dirname, "locales");

// Expected context files
const CONTEXTS = [
  "popup.json",
  "common.json",
  "thankYou.json",
  "languages.json",
];

console.log("🌍 Validating translation files...\n");

// Check if locales directory exists
if (!fs.existsSync(localesDir)) {
  console.error("❌ Locales directory not found");
  process.exit(1);
}

// Get all language directories
const langDirs = fs.readdirSync(localesDir).filter((item) => {
  const itemPath = path.join(localesDir, item);
  return fs.statSync(itemPath).isDirectory();
});

if (langDirs.length === 0) {
  console.error("❌ No language directories found in locales directory");
  process.exit(1);
}

// Read all translation files by context
const translations = {};
const contextKeys = {};

// Initialize structure
for (const context of CONTEXTS) {
  translations[context] = {};
  contextKeys[context] = null;
}

let hasErrors = false;

// Read translations for each language and context
for (const lang of langDirs) {
  const langPath = path.join(localesDir, lang);

  for (const context of CONTEXTS) {
    const filePath = path.join(langPath, context);

    if (!fs.existsSync(filePath)) {
      console.error(`❌ Missing file: ${lang}/${context}`);
      hasErrors = true;
      continue;
    }

    try {
      const content = fs.readFileSync(filePath, "utf8");
      const parsed = JSON.parse(content);
      translations[context][lang] = parsed;

      // Set reference keys from first language
      if (!contextKeys[context]) {
        contextKeys[context] = flattenKeys(parsed).sort();
      }
    } catch (error) {
      console.error(`❌ Error reading ${lang}/${context}: ${error.message}`);
      hasErrors = true;
    }
  }
}

// Helper function to flatten nested object keys
function flattenKeys(obj, prefix = "") {
  let keys = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (
      typeof obj[key] === "object" &&
      obj[key] !== null &&
      !Array.isArray(obj[key])
    ) {
      keys = keys.concat(flattenKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

console.log(`📋 Found ${langDirs.length} languages: ${langDirs.join(", ")}`);
console.log(
  `📁 Validating ${CONTEXTS.length} contexts: ${CONTEXTS.map((c) => c.replace(".json", "")).join(", ")}\n`,
);

// Validate each context
for (const context of CONTEXTS) {
  const contextName = context.replace(".json", "");
  console.log(`🔍 Validating ${contextName} context:`);

  if (!contextKeys[context]) {
    console.log(`❌ No reference keys found for ${context}`);
    hasErrors = true;
    continue;
  }

  const referenceKeys = contextKeys[context];
  console.log(
    `   � Expected keys (${referenceKeys.length}): ${referenceKeys.slice(0, 5).join(", ")}${referenceKeys.length > 5 ? "..." : ""}`,
  );

  // Validate each language for this context
  for (const lang of langDirs) {
    if (!translations[context][lang]) {
      console.log(`   ❌ ${lang} - Missing context file`);
      hasErrors = true;
      continue;
    }

    const langKeys = flattenKeys(translations[context][lang]).sort();
    const missingKeys = referenceKeys.filter((key) => !langKeys.includes(key));
    const extraKeys = langKeys.filter((key) => !referenceKeys.includes(key));

    if (missingKeys.length === 0 && extraKeys.length === 0) {
      console.log(`   ✅ ${lang} - All keys present`);
    } else {
      hasErrors = true;
      console.log(`   ❌ ${lang} - Issues found:`);

      if (missingKeys.length > 0) {
        console.log(`      Missing keys: ${missingKeys.join(", ")}`);
      }

      if (extraKeys.length > 0) {
        console.log(`      Extra keys: ${extraKeys.join(", ")}`);
      }
    }
  }
  console.log("");
}

console.log("=".repeat(60));

if (hasErrors) {
  console.log("❌ Translation validation failed!");
  console.log("Please fix the issues above before proceeding.");
  process.exit(1);
} else {
  console.log("✅ All translation files are valid!");
  console.log(
    `📊 ${langDirs.length} languages validated across ${CONTEXTS.length} contexts.`,
  );

  // Calculate total keys across all contexts
  const totalKeys = CONTEXTS.reduce((sum, context) => {
    return sum + (contextKeys[context] ? contextKeys[context].length : 0);
  }, 0);

  console.log(`🔑 Total translation keys: ${totalKeys}`);
}

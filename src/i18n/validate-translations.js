#!/usr/bin/env node

/**
 * Translation Validation Script
 *
 * This script validates that all translation files have the same keys
 * and reports any missing or extra keys.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localesDir = path.join(__dirname, "locales");
const files = fs
  .readdirSync(localesDir)
  .filter((file) => file.endsWith(".json"));

console.log("🌍 Validating translation files...\n");

if (files.length === 0) {
  console.error("❌ No translation files found in locales directory");
  process.exit(1);
}

// Read all translation files
const translations = {};
for (const file of files) {
  const lang = path.basename(file, ".json");
  const filePath = path.join(localesDir, file);
  try {
    const content = fs.readFileSync(filePath, "utf8");
    translations[lang] = JSON.parse(content);
  } catch (error) {
    console.error(`❌ Error reading ${file}: ${error.message}`);
    process.exit(1);
  }
}

// Get reference keys from the first file
const referenceLang = Object.keys(translations)[0];
const referenceKeys = Object.keys(translations[referenceLang]).sort();

console.log(`📋 Reference language: ${referenceLang}`);
console.log(
  `🔑 Expected keys (${referenceKeys.length}): ${referenceKeys.join(", ")}\n`,
);

let hasErrors = false;

// Validate each language
for (const [lang, content] of Object.entries(translations)) {
  const keys = Object.keys(content).sort();
  const missingKeys = referenceKeys.filter((key) => !keys.includes(key));
  const extraKeys = keys.filter((key) => !referenceKeys.includes(key));

  if (missingKeys.length === 0 && extraKeys.length === 0) {
    console.log(`✅ ${lang}.json - All keys present`);
  } else {
    hasErrors = true;
    console.log(`❌ ${lang}.json - Issues found:`);

    if (missingKeys.length > 0) {
      console.log(`   Missing keys: ${missingKeys.join(", ")}`);
    }

    if (extraKeys.length > 0) {
      console.log(`   Extra keys: ${extraKeys.join(", ")}`);
    }
  }
}

console.log("\n" + "=".repeat(50));

if (hasErrors) {
  console.log("❌ Translation validation failed!");
  console.log("Please fix the issues above before proceeding.");
  process.exit(1);
} else {
  console.log("✅ All translation files are valid!");
  console.log(
    `📊 ${files.length} languages validated with ${referenceKeys.length} keys each.`,
  );
}

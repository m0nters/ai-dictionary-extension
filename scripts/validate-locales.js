#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCALES_DIR = path.join(__dirname, "../public/locales");
const REFERENCE_LANG = "en";
const REQUIRED_FILES = [
  "common.json",
  "languages.json",
  "popup.json",
  "thankYou.json",
];

/**
 * Recursively get all keys from an object, including nested keys
 * @param {object} obj - The object to extract keys from
 * @param {string} prefix - The current key prefix for nested objects
 * @returns {string[]} - Array of all keys (with dot notation for nested)
 */
function getAllKeys(obj, prefix = "") {
  let keys = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    keys.push(fullKey);

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      keys = keys.concat(getAllKeys(value, fullKey));
    }
  }

  return keys.sort();
}

/**
 * Load and parse a JSON file
 * @param {string} filePath - Path to the JSON file
 * @returns {object|null} - Parsed JSON object or null if error
 */
function loadJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

/**
 * Get all available language codes from the locales directory
 * @returns {string[]} - Array of language codes
 */
function getAvailableLanguages() {
  try {
    return fs
      .readdirSync(LOCALES_DIR)
      .filter((item) => {
        const itemPath = path.join(LOCALES_DIR, item);
        return fs.statSync(itemPath).isDirectory();
      })
      .sort();
  } catch (error) {
    console.error("Error reading locales directory:", error.message);
    return [];
  }
}

/**
 * Validate a single language against the reference
 * @param {string} langCode - Language code to validate
 * @param {object} referenceStructure - Reference structure from English
 * @returns {object} - Validation results
 */
function validateLanguage(langCode, referenceStructure) {
  const results = {
    language: langCode,
    valid: true,
    missingFiles: [],
    missingKeys: {},
    extraKeys: {},
    errors: [],
  };

  const langDir = path.join(LOCALES_DIR, langCode);

  // Check if language directory exists
  if (!fs.existsSync(langDir)) {
    results.valid = false;
    results.errors.push(`Language directory does not exist: ${langDir}`);
    return results;
  }

  // Check each required file
  for (const fileName of REQUIRED_FILES) {
    const filePath = path.join(langDir, fileName);

    if (!fs.existsSync(filePath)) {
      results.valid = false;
      results.missingFiles.push(fileName);
      continue;
    }

    // Load and validate file content
    const fileContent = loadJsonFile(filePath);
    if (!fileContent) {
      results.valid = false;
      results.errors.push(`Failed to parse JSON file: ${fileName}`);
      continue;
    }

    // Get reference keys for this file
    const referenceKeys = referenceStructure[fileName] || [];
    const currentKeys = getAllKeys(fileContent);

    // Find missing keys
    const missingKeys = referenceKeys.filter(
      (key) => !currentKeys.includes(key),
    );
    if (missingKeys.length > 0) {
      results.valid = false;
      results.missingKeys[fileName] = missingKeys;
    }

    // Find extra keys (optional check - not necessarily an error)
    const extraKeys = currentKeys.filter((key) => !referenceKeys.includes(key));
    if (extraKeys.length > 0) {
      results.extraKeys[fileName] = extraKeys;
    }
  }

  return results;
}

/**
 * Main validation function
 */
function validateLocales() {
  console.log("🌍 Validating locale files...\n");

  // Load reference structure (English)
  const referenceDir = path.join(LOCALES_DIR, REFERENCE_LANG);
  const referenceStructure = {};

  console.log(`📚 Loading reference language: ${REFERENCE_LANG}`);

  for (const fileName of REQUIRED_FILES) {
    const filePath = path.join(referenceDir, fileName);
    const content = loadJsonFile(filePath);

    if (!content) {
      console.error(`❌ Failed to load reference file: ${fileName}`);
      process.exit(1);
    }

    referenceStructure[fileName] = getAllKeys(content);
    console.log(
      `   ✅ ${fileName}: ${referenceStructure[fileName].length} keys`,
    );
  }

  console.log("\n🔍 Validating other languages...\n");

  // Get all languages except reference
  const languages = getAvailableLanguages().filter(
    (lang) => lang !== REFERENCE_LANG,
  );

  if (languages.length === 0) {
    console.log("No additional languages found to validate.");
    return;
  }

  let allValid = true;
  const validationResults = [];

  // Validate each language
  for (const langCode of languages) {
    const result = validateLanguage(langCode, referenceStructure);
    validationResults.push(result);

    if (!result.valid) {
      allValid = false;
    }

    // Print results for this language
    console.log(`📝 ${langCode.toUpperCase()} (${langCode}):`);

    if (result.valid) {
      console.log("   ✅ All validations passed");
    } else {
      if (result.missingFiles.length > 0) {
        console.log(`   ❌ Missing files: ${result.missingFiles.join(", ")}`);
      }

      if (Object.keys(result.missingKeys).length > 0) {
        console.log("   ❌ Missing keys:");
        for (const [file, keys] of Object.entries(result.missingKeys)) {
          console.log(`      ${file}: ${keys.join(", ")}`);
        }
      }

      if (result.errors.length > 0) {
        console.log(`   ❌ Errors: ${result.errors.join(", ")}`);
      }
    }

    if (Object.keys(result.extraKeys).length > 0) {
      console.log("   ⚠️  Extra keys (not in reference):");
      for (const [file, keys] of Object.entries(result.extraKeys)) {
        console.log(`      ${file}: ${keys.join(", ")}`);
      }
    }

    console.log("");
  }

  // Summary
  console.log("📊 Validation Summary:");
  console.log(`   Total languages: ${languages.length}`);
  console.log(`   Valid: ${validationResults.filter((r) => r.valid).length}`);
  console.log(
    `   Invalid: ${validationResults.filter((r) => !r.valid).length}`,
  );

  if (allValid) {
    console.log("\n🎉 All locale files are valid!");
    process.exit(0);
  } else {
    console.log(
      "\n❌ Some locale files have issues. Please fix them before continuing.",
    );
    process.exit(1);
  }
}

// Run validation if this script is executed directly
validateLocales();

export { getAllKeys, loadJsonFile, validateLocales };

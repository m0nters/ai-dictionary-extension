#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { AVAILABLE_LANGUAGES } from "../src/constants/availableLanguages.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCALES_DIR = path.join(__dirname, "../public/locales");
const REFERENCE_LANG = "en";
const referenceDir = path.join(LOCALES_DIR, REFERENCE_LANG);

interface ValidationResult {
  language: string;
  valid: boolean;
  missingFiles: string[];
  missingKeys: Record<string, string[]>;
  extraKeys: Record<string, string[]>;
  errors: string[];
}

/**
 * Get the English name for a language code
 */
function getLanguageName(langCode: string): string {
  const language = AVAILABLE_LANGUAGES.find((lang) => lang.code === langCode);
  return language ? language.englishName : langCode.toUpperCase();
}

/**
 * Get all JSON files from the reference language directory (recursively)
 */
function getRequiredFiles(): string[] {
  /**
   * Recursively scan directory for JSON files
   */
  function scanDirectory(dir: string, relativePath: string = ""): string[] {
    let files: string[] = [];

    try {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const relativeFilePath = relativePath
          ? path.join(relativePath, item)
          : item;
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          // Recursively scan subdirectory
          files = files.concat(scanDirectory(fullPath, relativeFilePath));
        } else if (
          stat.isFile() &&
          path.extname(item).toLowerCase() === ".json"
        ) {
          // Add JSON file to the list
          files.push(relativeFilePath);
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dir}:`, error.message);
    }

    return files;
  }

  try {
    return scanDirectory(referenceDir).sort();
  } catch (error) {
    console.error(
      `Error reading reference directory (${REFERENCE_LANG}):`,
      error.message,
    );
    return [];
  }
}

/**
 * Recursively get all keys from an object, including nested keys
 */
function getAllKeys(obj: any, prefix: string = ""): string[] {
  let keys: string[] = [];

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
 */
function loadJsonFile(filePath: string): any | null {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

/**
 * Get all available language codes from the locales directory
 */
function getAvailableLanguages(): string[] {
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
 */
function validateLanguage(
  langCode: string,
  referenceStructure: Record<string, string[]>,
  requiredFiles: string[],
): ValidationResult {
  const results: ValidationResult = {
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
  for (const fileName of requiredFiles) {
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

  // Get required files dynamically from reference language
  const requiredFiles = getRequiredFiles();

  if (requiredFiles.length === 0) {
    console.error(
      `❌ No JSON files found in reference language directory: ${REFERENCE_LANG}`,
    );
    process.exit(1);
  }

  console.log(
    `📂 Auto-detected ${requiredFiles.length} JSON files: ${requiredFiles.join(", ")}\n`,
  );

  // Load reference structure (English)
  const referenceStructure = {};

  console.log(`📚 Loading reference language: ${REFERENCE_LANG}`);

  for (const fileName of requiredFiles) {
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
  const validationResults: ValidationResult[] = [];

  // Validate each language
  for (const langCode of languages) {
    const result = validateLanguage(
      langCode,
      referenceStructure,
      requiredFiles,
    );
    validationResults.push(result);

    if (!result.valid) {
      allValid = false;
    }

    // Print results for this language
    const languageName = getLanguageName(langCode);
    console.log(`📝 ${languageName} (${langCode}):`);

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
  console.log(`   Files per language: ${requiredFiles.length}`);
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

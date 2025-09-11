import {
  copyFileSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "fs";

console.log("Running post-processing build...");

// Copy CSS file
copyFileSync("public/content-script.css", "dist/content-script.css");

// Move dictionary-popup.html to root
if (readFileSync("dist/public/dictionary-popup.html")) {
  copyFileSync(
    "dist/public/dictionary-popup.html",
    "dist/dictionary-popup.html",
  );
}

// Move thank-you.html to root
if (readFileSync("dist/public/thank-you.html")) {
  copyFileSync("dist/public/thank-you.html", "dist/thank-you.html");
}

// Get the actual content-script and background script hashes
const assetFiles = readdirSync("dist/assets/");
const contentScriptFile = assetFiles.find(
  (f) => f.startsWith("content-script-") && f.endsWith(".js"),
);
const backgroundScriptFile = assetFiles.find(
  (f) => f.startsWith("background-") && f.endsWith(".js"),
);

// Update manifest with correct content script and background script paths
const manifest = JSON.parse(readFileSync("public/manifest.json", "utf-8"));
if (contentScriptFile) {
  manifest.content_scripts[0].js = [`assets/${contentScriptFile}`];
}
if (backgroundScriptFile) {
  manifest.background.service_worker = `assets/${backgroundScriptFile}`;
}
writeFileSync("dist/manifest.json", JSON.stringify(manifest, null, 2));

// Clean up
rmSync("dist/public", { recursive: true, force: true });

console.log("Post-processing complete.");

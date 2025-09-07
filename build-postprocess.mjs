import {
  copyFileSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "fs";

// Copy CSS file
copyFileSync("public/content-script.css", "dist/content-script.css");

// Move dictionary-popup.html to root
if (readFileSync("dist/public/dictionary-popup.html")) {
  copyFileSync(
    "dist/public/dictionary-popup.html",
    "dist/dictionary-popup.html"
  );
}

// Get the actual content-script hash
const assetFiles = readdirSync("dist/assets/");
const contentScriptFile = assetFiles.find(
  (f) => f.startsWith("content-script-") && f.endsWith(".js")
);

// Update manifest with correct content script path
const manifest = JSON.parse(readFileSync("public/manifest.json", "utf-8"));
if (contentScriptFile) {
  manifest.content_scripts[0].js = [`assets/${contentScriptFile}`];
}
writeFileSync("dist/manifest.json", JSON.stringify(manifest, null, 2));

// Fix paths in HTML files to use relative paths
const indexHtml = readFileSync("dist/index.html", "utf-8");
const fixedIndexHtml = indexHtml
  .replace(/src="\/assets\//g, 'src="./assets/')
  .replace(/href="\/assets\//g, 'href="./assets/')
  .replace(/<title>.*<\/title>/, "<title>Dictionary Extension</title>");
writeFileSync("dist/index.html", fixedIndexHtml);

const popupHtml = readFileSync("dist/dictionary-popup.html", "utf-8");
const fixedPopupHtml = popupHtml
  .replace(/src="\/assets\//g, 'src="./assets/')
  .replace(/href="\/assets\//g, 'href="./assets/');
writeFileSync("dist/dictionary-popup.html", fixedPopupHtml);

// Clean up
rmSync("dist/public", { recursive: true, force: true });

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    sourcemap: true, // Enable source maps for better debugging
    rollupOptions: {
      input: {
        popup: "./index.html",
        "dictionary-popup": "./public/dictionary-popup.html",
        "thank-you": "./public/thank-you.html",
        "content-script": "./src/content-script.ts",
        background: "./src/background.ts",
      },
      output: {
        manualChunks: (id) => {
          // Only manually chunk the most problematic/important pieces
          if (id.includes("src/components/ui/")) {
            return "ui-components";
          }
          if (id.includes("src/services/")) {
            return "services";
          }
          if (id.includes("node_modules/react")) {
            return "react-vendor";
          }
          // Let Vite handle the rest automatically
          return undefined;
        },
      },
    },
  },
});

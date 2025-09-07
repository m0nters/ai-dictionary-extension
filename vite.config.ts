import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        popup: "./index.html",
        "dictionary-popup": "./public/dictionary-popup.html",
        "content-script": "./src/content-script.ts",
      },
    },
  },
});

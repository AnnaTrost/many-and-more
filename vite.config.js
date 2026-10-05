import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Relative asset paths, so the built site works at any address:
  // https://<user>.github.io/many-and-more/, a custom domain, or a local folder.
  base: "./",
  // Unit tests only. The browser smoke test in tests/e2e runs under Playwright (playwright.config.js).
  test: { include: ["tests/unit/**/*.test.js"] },
});

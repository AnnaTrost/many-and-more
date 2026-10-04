import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Relative asset paths, so the built site works at any address:
  // https://<user>.github.io/many-and-more/, a custom domain, or a local folder.
  base: "./",
});

import { defineConfig } from "vite";
import { sourceDir } from "./scripts/build";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": sourceDir,
    },
  },
});

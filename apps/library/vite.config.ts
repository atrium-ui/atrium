/// <reference types="histoire" />

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import markdown from "vite-plugin-markdown";

export default defineConfig({
  plugins: [vue(), markdown()],
  server: {
    fs: {
      allow: ["../../"],
    },
  },
});

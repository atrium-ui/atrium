import { defineConfig } from "vite";
import hmr from "@atrium-ui/custom-element-hmr";

export default defineConfig({
  resolve: {
    alias: {
      "package:": "/src",
      "@components": "@sv/components",
    },
  },
  server: {
    fs: {
      allow: [".."],
    },
  },
  plugins: [hmr()],
});

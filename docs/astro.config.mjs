import react from "@astrojs/react";
import solid from "@astrojs/solid-js";
import tailwindcss from "@tailwindcss/vite";
import vue from "@astrojs/vue";
import { defineConfig } from "astro/config";
import rehypeShiftHeading from "rehype-shift-heading";
import mdx from "@astrojs/mdx";
import { atriumDocsIntegration } from "./src/components/docs/integration";

export default defineConfig({
  publicDir: "assets",
  devToolbar: {
    enabled: false,
  },
  vite: {
    resolve: {
      alias: {
        "package:": "/src",
        "@components": "@sv/components",
        "@docs": "/src/components/docs",
      },
    },
    server: {
      fs: {
        allow: [".."],
      },
    },
    plugins: [tailwindcss()],
  },
  experimental: {
    contentIntellisense: true,
  },
  markdown: {
    rehypePlugins: [[rehypeShiftHeading, { shift: 1 }]],
  },
  integrations: [
    atriumDocsIntegration(),
    mdx(),
    react({
      include: ["**/react/*.{tsx}"],
    }),
    vue({
      include: ["**/vue/*.{tsx}"],
      jsx: true,
      template: {
        compilerOptions: {
          isCustomElement: tag => tag.includes("-"),
        },
      },
    }),
    solid({
      include: [
        //
        "**/solid/*.{tsx}",
        "**/docs/Preview.tsx",
        "**/docs/Stories.tsx",
        "**/docs/Docs.tsx",
        "**/docs/Playground.tsx",
      ],
    }),
  ],
});

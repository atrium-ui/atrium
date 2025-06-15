import react from "@astrojs/react";
import solid from "@astrojs/solid-js";
import tailwindcss from "@tailwindcss/vite";
import vue from "@astrojs/vue";
import { defineConfig, fontProviders } from "astro/config";
import rehypeShiftHeading from "rehype-shift-heading";
import mdx from "@astrojs/mdx";
import { atriumDocsIntegration } from "./src/components/docs/integration";
import pagefind from "astro-pagefind";
import svgSprite from "@sv/svg-sprites/vite";
import { resolve } from "node:path";

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
    plugins: [
      tailwindcss(),
      svgSprite({
        dir: [
          //
          "src/assets/icons/**/*.svg",
          `${resolve("../node_modules/@sv/icons/assets")}/*.svg`,
        ],
        transform(code) {
          return code
            .replace(/#000091/g, "currentColor")
            .replace(/#000000/g, "currentColor");
        },
      }),
    ],
  },
  experimental: {
    contentIntellisense: true,
    fonts: [
      {
        provider: fontProviders.google(),
        name: "Geist",
        weights: [300, 400, 500, 600, 700],
        cssVariable: "--font-geist",
      },
    ],
  },
  markdown: {
    rehypePlugins: [[rehypeShiftHeading, { shift: 1 }]],
  },
  integrations: [
    pagefind(),
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
          isCustomElement: (tag) => tag.includes("-"),
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

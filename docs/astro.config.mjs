import react from "@astrojs/react";
import solid from "@astrojs/solid-js";
import starlight from "@astrojs/starlight";
import tailwindcss from "@tailwindcss/vite";
import vue from "@astrojs/vue";
import { defineConfig } from "astro/config";
import rehypeShiftHeading from "rehype-shift-heading";
import { atriumDocsIntegration } from "./src/components/docs/integration";

export default defineConfig({
  base: "/atrium/",
  site: "https://sv.pages.s-v.de",
  publicDir: "assets",
  devToolbar: {
    enabled: false,
  },
  vite: {
    resolve: {
      alias: {
        "package:": "/src",
        "@components": "@atrium-ui/components",
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
    atriumDocsIntegration({
      favicon: "favicon.png",
      title: "Atrium",
      routeMiddleware: "./src/routeData.ts",
      customCss: ["./src/custom.css"],
      logo: {
        dark: "./assets/logo-dark.svg",
        light: "./assets/logo-light.svg",
        replacesTitle: true,
        alt: "Atrium Logo",
      },
      social: {
        gitlab: "https://gitlab.s-v.de/svp/atrium",
      },
      components: {
        Header: "./src/components/starlight/Header.astro",
        ThemeProvider: "./src/components/starlight/ThemeProvider.astro",
      },
    }),
  ],
});

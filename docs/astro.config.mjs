import react from "@astrojs/react";
import solid from "@astrojs/solid-js";
import starlight from "@astrojs/starlight";
import tailwind from "@astrojs/tailwind";
import vue from "@astrojs/vue";
import { defineConfig } from "astro/config";
import starlightConfig from "./starlight.config";

export default defineConfig({
  base: "/atrium/",
  site: "https://sv.pages.s-v.de",
  publicDir: "assets",
  vite: {
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
    plugins: [],
  },
  experimental: {
    contentIntellisense: true,
  },
  integrations: [
    tailwind({
      configFile: "./tailwind.config.js",
    }),
    starlight(starlightConfig),
    solid({
      include: ["**/solid/*.{tsx}"],
    }),
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
  ],
});

import react from "@astrojs/react";
import solid from "@astrojs/solid-js";
import starlight from "@astrojs/starlight";
import tailwind from "@astrojs/tailwind";
import vue from "@astrojs/vue";
import { defineConfig } from "astro/config";

export default defineConfig({
  base: "/atrium/",
  site: "https://sv.pages.s-v.de",
  publicDir: "assets",
  vite: {
    resolve: {
      alias: {
        "package:": "/src",
        "@components": "@atrium-ui/components",
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
    starlight({
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
      tableOfContents: false,
      components: {
        Header: "./src/components/starlight/Header.astro",
      },
    }),
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
          isCustomElement: tag => tag.includes("-"),
        },
      },
    }),
  ],
});

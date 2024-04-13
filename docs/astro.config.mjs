import react from "@astrojs/react";
import solid from "@astrojs/solid-js";
import starlight from "@astrojs/starlight";
import tailwind from "@astrojs/tailwind";
import vue from "@astrojs/vue";
import { defineConfig } from "astro/config";

export default defineConfig({
  base: "/sv-frontend-library/mono/",
  site: "https://sv.pages.s-v.de",
  publicDir: "assets",
  vite: {
    resolve: {
      alias: {
        "package:": "/src",
      },
    },
    server: {
      fs: {
        allow: [".."],
      },
    },
  },
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    vue({
      jsx: true,
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.includes("-"),
        },
      },
    }),
    // solid(),
    // react(),
    starlight({
      components: {
        ContentPanel: "./src/components/ContentPanel.astro",
      },
      favicon: "favicon.png",
      title: "Atrium",
      customCss: ["./styles/custom.css"],
      logo: {
        dark: "./assets/atrium-dark.png",
        light: "./assets/atrium-light.png",
        replacesTitle: true,
        alt: "Atrium Logo",
      },
      social: {
        gitlab: "https://gitlab.s-v.de/sv/sv-frontend-library/mono",
      },
      sidebar: [
        {
          label: "Concept",
          link: "/concept",
        },
        {
          label: "Setup",
          link: "/setup",
        },
        {
          label: "Usage",
          link: "/usage",
        },
        {
          label: "Component Templates",
          collapsed: false,
          autogenerate: { directory: "components" },
        },
        {
          label: "Elements",
          collapsed: true,
          autogenerate: { directory: "elements" },
        },
        {
          label: "Packages",
          collapsed: false,
          autogenerate: { directory: "packages" },
        },
        {
          label: "Experimental",
          collapsed: true,
          autogenerate: { directory: "experimental" },
        },
      ],
    }),
  ],
});

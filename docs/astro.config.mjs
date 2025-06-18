import react from "@astrojs/react";
import solid from "@astrojs/solid-js";
import tailwindcss from "@tailwindcss/vite";
import vue from "@astrojs/vue";
import { defineConfig, fontProviders } from "astro/config";
import rehypeShiftHeading from "rehype-shift-heading";
import mdx from "@astrojs/mdx";
import pagefind from "astro-pagefind";
import svgSprite from "@sv/svg-sprites/vite";
import { basename, resolve } from "node:path";
import sitemap from "@astrojs/sitemap";
import remarkDirective from "remark-directive";
import { visit } from "unist-util-visit";

export default defineConfig({
  publicDir: "assets",
  devToolbar: {
    enabled: false,
  },
  site: process.env.SITE,
  vite: {
    resolve: {
      alias: {
        "package:": "/src",
        "@components": "@sv/components",
        "@docs": "/src/components/stories",
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
    smartypants: false,
    remarkPlugins: [
      [remarkDirective, {}],
      function remarkCustomInfobox() {
        return (tree) => {
          visit(tree, (node) => {
            if (node.type === "containerDirective") {
              const data = node.data || (node.data = {});
              data.hName = "blockquote";
              data.hProperties = {
                className: [`directive-${node.name}`],
              };
            }
          });
        };
      },
    ],
    rehypePlugins: [[rehypeShiftHeading, { shift: 1 }]],
  },
  integrations: [
    {
      name: "astro-atrium-docs",
      hooks: {
        "astro:config:setup": ({ injectRoute, updateConfig }) => {
          updateConfig({
            vite: {
              plugins: [
                {
                  name: "atrium-docs",
                  transform(code, id) {
                    if (id.match(".stories.")) {
                      const storyId = basename(id, ".stories.ts").toLowerCase();
                      return `export const _id = "${storyId}";\n${code}`;
                    }
                    return code;
                  },
                },
              ],
            },
          });
          injectRoute({
            pattern: "/story",
            entrypoint: "./src/components/stories/story.astro",
          });
        },
      },
    },
    pagefind(),
    mdx(),
    react({
      include: ["**/react/*.{tsx}"],
    }),
    vue({
      include: ["**/vue/*.{tsx}"],
      jsx: true,
      template: {
        compilerOptions: {
          isCustomElement(tag) {
            return tag.includes("-");
          },
        },
      },
    }),
    solid({
      include: [
        //
        "**/solid/*.{tsx}",
        "**/stories/Preview.tsx",
        "**/stories/Stories.tsx",
        "**/stories/Docs.tsx",
        "**/playground/Playground.tsx",
      ],
    }),
    sitemap(),
  ],
});

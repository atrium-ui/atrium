import react from "@astrojs/react";
import solid from "@astrojs/solid-js";
import tailwindcss from "@tailwindcss/vite";
import vue from "@astrojs/vue";
import { astroStories } from "@sv/astro-stories";
import { defineConfig, fontProviders } from "astro/config";
import rehypeShiftHeading from "rehype-shift-heading";
import mdx from "@astrojs/mdx";
import pagefind from "astro-pagefind";
import svgSprite from "@sv/svg-sprites/vite";
import { resolve } from "node:path";
import sitemap from "@astrojs/sitemap";
import remarkDirective from "remark-directive";
import { visit } from "unist-util-visit";
import { readFileSync, writeFileSync } from "node:fs";

const storyStyles = `
  :root {
    --color-black: #121a26;
    --color-white: #ffffff;
    --color-primary-50: #d6cfe3;
    --color-primary-100: #c0b5d6;
    --color-primary-200: #a99ac9;
    --color-primary-300: #927dbd;
    --color-primary-400: #7b61b2;
    --color-primary-500: #664aa1;
    --color-primary-600: #533b86;
    --color-primary-700: #412d69;
    --color-primary-800: #2e204c;
    --color-primary-900: #1c132f;
    --color-primary-950: #0a0711;
    --color-gray-50: #f2f2f2;
    --color-gray-100: #e6e6e6;
    --color-gray-200: #cfcfcf;
    --color-gray-300: #b5b5b5;
    --color-gray-400: #9a9a9d;
    --color-gray-500: #808189;
    --color-gray-600: #666770;
    --color-gray-700: #4c4d57;
    --color-gray-800: #34353e;
    --color-gray-900: #1a1b1e;
    --color-gray-950: #0f0f10;
  }

  svg-icon {
    color: inherit;
    display: inline-block;
    height: 1em;
    vertical-align: top;
    width: 1em;
  }

  svg-icon img,
  svg-icon svg {
    display: block;
    height: inherit;
    width: inherit;
  }
`;

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
      },
    },
    server: {
      fs: {
        allow: ["../../"],
      },
    },
    optimizeDeps: {
      exclude: ["@sv/elements"],
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
            .replace(/#000000/g, "currentColor")
            .replace(/#000/g, "currentColor");
        },
      }),
    ],
  },
  experimental: {
    contentIntellisense: true,
  },
  markdown: {
    smartypants: false,
    remarkPlugins: [
      [remarkDirective, {}],
      function remarkCustomInfobox() {
        return (tree) => {
          visit(tree, (node) => {
            if (node.type === "containerDirective") {
              const data = node.data || {};
              node.data = data;
              data.hName = "blockquote";
              data.hProperties = {
                className: [`directive-${node.name}`],
              };
            }
          });
        };
      },
    ],
    // rehypePlugins: [[rehypeShiftHeading, { shift: 1 }]],
  },
  integrations: [
    astroStories({
      imports: ["@tailwindcss/browser", "@sv/elements"],
      inlineStyles: storyStyles,
    }),
    {
      name: "astro-atrium-docs",
      hooks: {
        "astro:config:setup": ({ updateConfig }) => {
          updateConfig({
            vite: {
              plugins: [
                svgSprite({
                  dir: ["src/assets/icons/**/*.svg", "../packages/icons/assets/*.svg"],
                }),
                {
                  name: "atrium-docs-editor",
                  configureServer(server) {
                    let timeout;

                    server.middlewares.use("/content", async (req, res) => {
                      const origin = server.resolvedUrls?.local[0];
                      const baseHeaders = {
                        "Access-Control-Allow-Origin": "*",
                      };

                      if (!origin) {
                        res.writeHead(500, baseHeaders);
                        res.end();
                        return;
                      }

                      if (req.method !== "POST") {
                        res.writeHead(405, baseHeaders);
                        res.end();
                        return;
                      }

                      const reqUrlParams = new URL(req.url, origin).searchParams;
                      const filePath = reqUrlParams.get("filepath");

                      const buffer = [];

                      req.on("data", (chunk) => {
                        buffer.push(chunk);
                      });

                      req.on("end", () => {
                        const decder = new TextDecoder();
                        const text = buffer.map((curr) => decder.decode(curr)).join("");

                        console.info(filePath, text);

                        if (filePath) {
                          const rawFile = readFileSync(filePath, "utf-8");
                          const rawLines = rawFile.split("\n");
                          const updateLines = text.split("\n");
                          updateLines.unshift(" ");

                          let meta = false;
                          let html = false;
                          let imprt = false;
                          let index = 0;

                          const ignore = ["import"];

                          const newLines = [];

                          // TODO: AST merge

                          for (const line of rawLines) {
                            let take = false;

                            if (line.startsWith("---")) {
                              meta = !meta;
                              take = true;
                            }
                            if (line.startsWith("<")) {
                              html = true;
                              take = true;
                            }
                            if (line.startsWith("</")) {
                              html = false;
                              take = true;
                            }
                            if (line.startsWith("import")) {
                              imprt = true;
                              take = true;
                            } else {
                              if (imprt === true) {
                                imprt = false;
                                newLines.push("");
                              }
                            }

                            if (meta === true) {
                              take = true;
                            }
                            if (html === true) {
                              take = true;
                            }

                            if (ignore.find((curr) => line.startsWith(curr))) {
                              take = true;
                            }

                            if (take) {
                              newLines.push(line);
                              continue;
                            }

                            const updateLine = updateLines[index];
                            if (!updateLine?.startsWith("[")) {
                              newLines.push(updateLines[index]);
                            }

                            index++;
                          }

                          // console.info(newLines.join("\n"));

                          const newContent = newLines.join("\n");

                          if (newContent !== rawFile) {
                            clearTimeout(timeout);
                            timeout = setTimeout(() => {
                              writeFileSync(filePath, newLines.join("\n"));
                            }, 1000);
                          }
                        }

                        res.writeHead(200, {
                          ...baseHeaders,
                        });
                        res.end();
                      });
                    });
                  },
                },
              ],
            },
          });
        },
      },
    },
    pagefind(),
    mdx(),
    vue({
      template: {
        compilerOptions: {
          isCustomElement(tag) {
            return tag.includes("-");
          },
        },
      },
    }),
    react({
      include: [
        //
        "**/react/*.{tsx}",
        "**/playground/Playground.tsx",
        "../packages/playground/src/**/*.tsx",
        "./src/pages/components/docs-editor.tsx",
        "**/stories/Controls.tsx",
        "**/stories/Frame.tsx",
      ],
    }),
    // solid({
    //   exclude: ["**/*"],
    //   include: [
    //     //
    //     "**/solid/*.{tsx}",
    //   ],
    // }),
    sitemap(),
  ],
});

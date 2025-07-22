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
import { readFileSync, writeFileSync } from "node:fs";

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
        return tree => {
          visit(tree, node => {
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

                      req.on("data", chunk => {
                        buffer.push(chunk);
                      });

                      req.on("end", () => {
                        const decder = new TextDecoder();
                        const text = buffer.map(curr => decder.decode(curr)).join("");

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

                            if (ignore.find(curr => line.startsWith(curr))) {
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
          injectRoute({
            pattern: "/story",
            entrypoint: "./src/components/stories/Story.astro",
          });
        },
      },
    },
    pagefind(),
    mdx(),
    vue({
      exclude: ["**/*"],
      include: ["**/vue/*.{tsx|vue}"],
      // jsx: true,
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
        "./src/pages/components/docs-editor.tsx",
        "**/stories/Preview.tsx",
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

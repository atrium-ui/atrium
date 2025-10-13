import svgSprite from "@sv/svg-sprites/vite";
import { basename } from "node:path";
import { readFileSync, writeFileSync } from "node:fs";

export default function () {
  return {
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
                configureServer(server: any) {
                  let timeout: any;

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
        injectRoute({
          pattern: "/story",
          entrypoint: "@sv/atrium-docs/components/stories/Story.astro",
        });
      },
    },
  };
}

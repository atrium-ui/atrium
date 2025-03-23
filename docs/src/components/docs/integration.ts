import starlight from "@astrojs/starlight";
import { basename } from "node:path";

export function atriumDocsIntegration(starlightConfig) {
  return [
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
            entrypoint: "./src/components/docs/story.astro",
          });
        },
      },
    },
    starlight({
      ...starlightConfig,
      pagination: false,
      components: {
        ...(starlightConfig.components || {}),
        Head: "@docs/Head.astro",
        // Hero: "@docs/Hero.astro",
        PageFrame: "@docs/PageFrame.astro",
        Sidebar: "@docs/Sidebar.astro",
      },
    }),
  ];
}

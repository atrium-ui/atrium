import { fileURLToPath } from "node:url";
import { astroStoriesPlugin } from "./plugin";

export type AstroStoriesOptions = {
  route?: `/${string}`;
  stories?: string[];
  imports?: string[];
  inlineStyles?: string;
};

function resolveOptions(options: AstroStoriesOptions = {}) {
  return {
    route: options.route ?? "/story",
    stories: options.stories ?? ["/src/**/*.stories.*"],
    imports: options.imports ?? [],
    inlineStyles: options.inlineStyles ?? "",
  };
}

export function astroStories(options: AstroStoriesOptions = {}) {
  const resolved = resolveOptions(options);

  return {
    name: "astro-stories",
    hooks: {
      "astro:config:setup": ({ injectRoute, updateConfig }) => {
        updateConfig({
          vite: {
            plugins: [astroStoriesPlugin(resolved)],
          },
        });

        injectRoute({
          pattern: resolved.route,
          entrypoint: fileURLToPath(
            new URL("../src/runtime/StoryPage.astro", import.meta.url),
          ),
        });
      },
    },
  };
}

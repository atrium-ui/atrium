import type { AstroStoriesOptions } from "./integration";

const CONFIG_MODULE = "virtual:astro-stories/config";
const LAZY_MODULE = "virtual:astro-stories/lazy";
const SETUP_MODULE = "virtual:astro-stories/setup";

const RESOLVED_CONFIG_MODULE = `\0${CONFIG_MODULE}`;
const RESOLVED_LAZY_MODULE = `\0${LAZY_MODULE}`;
const RESOLVED_SETUP_MODULE = `\0${SETUP_MODULE}`;

function createStoryId(filePath: string) {
  return filePath
    .split("/")
    .pop()
    ?.replace(".stories.tsx", "")
    .replace(".stories.ts", "")
    .replace(".stories.jsx", "")
    .replace(".stories.js", "")
    .toLowerCase();
}

function createLazyModuleCode(patterns: string[]) {
  return `
const storyImports = import.meta.glob(${JSON.stringify(patterns)});

const stories = new Map();

for (const filePath in storyImports) {
  const storyId = ${createStoryId.toString()}(filePath);
  if (!storyId) {
    throw new Error(\`Unable to derive a story id from "\${filePath}"\`);
  }
  stories.set(storyId, storyImports[filePath]);
}

export { stories };
`;
}

export function astroStoriesPlugin(options: Required<AstroStoriesOptions>) {
  return {
    name: "astro-stories",
    resolveId(id: string) {
      if (id === CONFIG_MODULE) {
        return RESOLVED_CONFIG_MODULE;
      }
      if (id === LAZY_MODULE) {
        return RESOLVED_LAZY_MODULE;
      }
      if (id === SETUP_MODULE) {
        return RESOLVED_SETUP_MODULE;
      }
      return null;
    },
    load(id: string) {
      if (id === RESOLVED_CONFIG_MODULE) {
        return `
export const route = ${JSON.stringify(options.route)};
export const imports = ${JSON.stringify(options.imports)};
export const inlineStyles = ${JSON.stringify(options.inlineStyles)};
`;
      }

      if (id === RESOLVED_LAZY_MODULE) {
        return createLazyModuleCode(options.stories);
      }

      if (id === RESOLVED_SETUP_MODULE) {
        return options.imports.map((specifier) => `import ${JSON.stringify(specifier)};`).join("\n");
      }

      return null;
    },
  };
}

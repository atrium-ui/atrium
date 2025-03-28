import {
  getSheet,
  type SVGSpriteOptions,
  replacePlaceholder,
  createSheetCode,
} from "../sheet.js";
import chokidar from "chokidar";

function isComponentImport(id: string) {
  return id.match("svg-sprites_svg-icon") || id.match("@sv/svg-sprites/svg-icon");
}

function isSheetImport(id: string) {
  return (
    id.match("svg-sprites_sheet") ||
    id.match("@sv/svg-sprites/sheet") ||
    id === "svg-sprites:sheet"
  );
}

// biome-ignore lint/style/noDefaultExport: <explanation>
export default function svgSprite(
  options: SVGSpriteOptions = { dir: ["assets/icons/**/*.svg"] },
) {
  let svg: Promise<string>;

  let componentImportId: string | null;

  const sheetModules = new Set<string>();

  return {
    name: "svg-sprites",
    enforce: "pre",

    async buildStart() {
      svg = getSheet(options);
    },

    configureServer(server) {
      if (server.config.mode === "test") {
        return;
      }

      chokidar.watch(options.dir).on("all", async (event, path) => {
        if (event !== "add") {
          svg = getSheet(options, true);
        }

        for (const id of sheetModules) {
          const module = server.moduleGraph.idToModuleMap.get(id);
          if (module) server.reloadModule(module);
        }
      });
    },

    async resolveId(source, importer, options) {
      if (isComponentImport(source)) {
        // @ts-ignore
        const resolved = await this.resolve(source, importer, {
          skipSelf: true,
          ...options,
        });
        if (resolved && !resolved.external) {
          componentImportId = resolved ? resolved.id : null;
          return componentImportId;
        }
      }

      if (isSheetImport(source)) {
        return "svg-sprites:sheet";
      }
    },

    async load(id) {
      if (isSheetImport(id)) {
        return createSheetCode(await svg);
      }
    },

    async transform(source, id) {
      if (id === componentImportId) {
        sheetModules.add(id);
        const code = replacePlaceholder(source, await svg);
        return { code: `${code}` };
      }

      if (isSheetImport(id)) {
        sheetModules.add(id);
        const code = replacePlaceholder(source, await svg);
        return { code: `${code}` };
      }

      return null;
    },
  } as const;
}

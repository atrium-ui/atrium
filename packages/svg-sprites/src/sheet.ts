import fs from "node:fs";
import fastGlob from "fast-glob";
import SVGSpriter from "svg-sprite";
import path from "node:path";

function writeFile(location: string, contents: string) {
  fs.mkdirSync(path.dirname(location), { recursive: true });
  fs.writeFileSync(location, contents);
}

export function replacePlaceholder(code: string, svg: string) {
  return code.replace(/"_svgSheetString_"/g, `\`${svg}\``);
}

export function createSheetCode(svg: string) {
  return `
    const Blob = globalThis.Blob || class {};
    const sheetSource = \`${svg}\`;

    export function blob() {
      return new Blob([sheetSource], { type: "image/svg+xml" });
    }
    export function svg() {
      return sheetSource;
    }
  `;
}

export interface SVGSpriteOptions {
  dir: string[];
  svg?: SVGSpriter.Config;
  transform?: (code: string, file: string) => string;
}

export async function buildSheet(options: SVGSpriteOptions): Promise<string> {
  const entries = await fastGlob(options.dir);
  const spriter = new SVGSpriter({
    mode: {
      symbol: true,
    },
    shape: {
      id: {
        generator(id) {
          return id.replace(/\.(.+)/g, "");
        },
      },
      transform: ["svgo"],
    },
    ...options.svg,
  });

  const rootDirs = options.dir.map((p) => p.replace(/(\/(\*+))+\.(.+)/g, ""));

  const types: string[] = [];

  for (const entry of entries) {
    const rootDir = rootDirs.find((dir) => entry.match(`${dir}/`));
    const name = entry.replace(`${rootDir}/`, "");

    types.push(name.replace(path.extname(name), ""));

    const svgCode = fs.readFileSync(entry, { encoding: "utf-8" });
    spriter.add(
      entry,
      name,
      options.transform ? options.transform(svgCode, entry) : svgCode,
    );
  }

  // generate types
  try {
    const typesCode = `type SvgIconName = ${types.map((t) => `"${t}"`).join(" | ")};`;

    writeFile("./node_modules/.svg-sprites/types.d.ts", typesCode);
  } catch (e) {
    console.error("Could not generate types", e);
  }

  const { result } = await spriter.compileAsync();

  if (process.env.EXPORT_SVG_SPRITE) {
    writeFile("./sprite.svg", result.defs.sprite.contents.toString("utf8"));
  }

  return result.symbol.sprite.contents.toString("utf8");
}

export async function getIconNames(options: SVGSpriteOptions) {
  const entries = await fastGlob(options.dir);
  const rootDirs = options.dir.map((p) => p.replace(/(\/(\*+))+\.(.+)/g, ""));
  const types: string[] = [];

  for (const entry of entries) {
    const rootDir = rootDirs.find((dir) => entry.match(`${dir}/`));
    const name = entry.replace(`${rootDir}/`, "");

    types.push(name.replace(path.extname(name), ""));
  }

  return types;
}

let sheetData: string | undefined;

export async function getSheet(options: SVGSpriteOptions, force = false) {
  if (!sheetData || force) {
    sheetData = await buildSheet(options);
  }
  return sheetData;
}

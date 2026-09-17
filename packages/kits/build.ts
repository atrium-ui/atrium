/// <reference types="bun" />
/**
 * Build each kit in src/<kit>/ into dist/<kit>.zip
 * and copy the zips to docs/assets/kits/ for static download.
 *
 * Also compiles each kit's theme.css + section HTML into one pre-built,
 * minified Tailwind stylesheet (global.css) via the Tailwind CLI — a drop-in
 * `<link>`-able alternative for consumers without their own Tailwind v4
 * build step. It ships inside the zip alongside theme.css.
 *
 * Uses the system `zip` binary (available on macOS/Linux CI).
 * No extra npm dependencies required beyond the Tailwind CLI (devDependency).
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { $ } from "bun";

const root = resolve(import.meta.dir);
const srcDir = join(root, "src");
const distDir = join(root, "dist");
const docsKitsDir = resolve(root, "../../docs/assets/kits");

mkdirSync(distDir, { recursive: true });
mkdirSync(docsKitsDir, { recursive: true });

const kits = readdirSync(srcDir).filter((entry) => {
  try {
    return statSync(join(srcDir, entry)).isDirectory();
  } catch {
    return false;
  }
});

if (kits.length === 0) {
  console.error("No kits found in src/");
  process.exit(1);
}

/**
 * Resolve the Tailwind CLI entry script. `bun install --linker=hoisted`
 * (used in CI via `task setup`) hoists binaries to the workspace root, so
 * `packages/kits/node_modules/.bin/tailwindcss` may not exist. We check the
 * package-local bin, then the hoisted root bin, and fall back to
 * `bun x tailwindcss` which resolves the declared devDependency.
 *
 * The entry is always executed via `bun` explicitly so we don't depend on
 * the exec bit / shebang handling of the `.bin` symlink on CI runners.
 */
function resolveTailwindArgs(): string[] {
  const candidates = [
    join(root, "node_modules", ".bin", "tailwindcss"),
    resolve(root, "../../node_modules/.bin/tailwindcss"),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) return ["bun", candidate];
  }
  const onPath = Bun.which("tailwindcss");
  if (onPath) return [onPath];
  return ["bun", "x", "tailwindcss"];
}

async function runTailwind(entryPath: string, outCss: string): Promise<void> {
  const bin = resolveTailwindArgs();
  if (bin.length === 2) {
    await $`bun ${bin[1]} -i ${entryPath} -o ${outCss} --minify`.quiet();
  } else if (bin.length === 3) {
    await $`bun x tailwindcss -i ${entryPath} -o ${outCss} --minify`.quiet();
  } else {
    await $`${bin[0]} -i ${entryPath} -o ${outCss} --minify`.quiet();
  }
}
/**
 * Compile `<kitDir>/theme.css` + every section/index HTML into one
 * standalone, minified stylesheet at `outCss` — base reset, only the
 * utilities the kit's HTML actually uses, plus the kit's `@theme` tokens
 * and element-theming rules. Written via a throwaway entry file (must live
 * under packages/kits/ so `@import "tailwindcss"` resolves through this
 * package's node_modules).
 */
async function compileGlobalCss(kitDir: string, outCss: string): Promise<void> {
  const themeCss = join(kitDir, "theme.css");
  if (!existsSync(themeCss)) return;

  const entryPath = join(root, `.tailwind-entry.${Date.now()}.css`);
  const entry = [
    '@import "tailwindcss";',
    `@source "${join(kitDir, "index.html")}";`,
    `@source "${join(kitDir, "sections", "**/*.html")}";`,
    `@import "${themeCss}";`,
  ].join("\n");
  writeFileSync(entryPath, entry);
  try {
    await runTailwind(entryPath, outCss);
  } finally {
    rmSync(entryPath, { force: true });
  }
}

/**
 * Build `<kitDir>/icons/*.svg` into one pasteable inline sprite at `outHtml`:
 * a hidden `<svg>` of `<symbol id="kit-icon-<name>">` defs. Consumers drop it
 * into a layout once and reference icons natively — no icon runtime:
 *   <svg class="h-4 w-4" aria-hidden="true"><use href="#kit-icon-search"></use></svg>
 * External `<use href="sprite.svg#id">` is deliberately not offered: WebKit
 * does not resolve cross-document references, so the sprite has to be inline.
 */
function compileIconSprite(kitDir: string, kitName: string, outHtml: string): void {
  const iconsDir = join(kitDir, "icons");
  if (!existsSync(iconsDir)) return;

  const files = readdirSync(iconsDir)
    .filter((file) => file.endsWith(".svg"))
    .sort();
  if (files.length === 0) return;

  const symbols = files.map((file) => {
    const name = file.replace(/\.svg$/, "");
    const source = readFileSync(join(iconsDir, file), "utf8");
    const viewBox = source.match(/viewBox="([^"]+)"/)?.[1] ?? "0 0 24 24";
    const body = source
      .replace(/^[\s\S]*?<svg[^>]*>/, "")
      .replace(/<\/svg>\s*$/, "")
      .replace(/<title>[\s\S]*?<\/title>/g, "")
      // Icons exported from design tools carry hardcoded brand fills; the kit
      // colors icons through `currentColor` only.
      .replace(/(fill|stroke)="#[0-9a-fA-F]{3,8}"/g, '$1="currentColor"')
      .trim()
      .split("\n")
      .map((line) => `    ${line.trim()}`)
      .join("\n");

    return `  <symbol id="kit-icon-${name}" viewBox="${viewBox}">\n${body}\n  </symbol>`;
  });

  const html = [
    `<!-- ${kitName} kit icon sprite — generated from icons/*.svg, do not edit by hand.`,
    "     Paste once near the top of <body>, then reference any icon with:",
    '     <svg class="h-4 w-4" aria-hidden="true"><use href="#kit-icon-search"></use></svg>',
    "     Size it with width/height utilities, color it with `color` — every symbol",
    "     paints in currentColor. -->",
    '<svg aria-hidden="true" style="display: none">',
    ...symbols,
    "</svg>",
    "",
  ].join("\n");

  writeFileSync(outHtml, html);
}

for (const kit of kits) {
  const kitDir = join(srcDir, kit);
  const outZip = join(distDir, `${kit}.zip`);
  // Stage a copy of the kit dir + the generated global.css so the zip
  // ships it without writing build output into the tracked src/ tree.
  const stageDir = join(distDir, `.stage-${kit}`);

  rmSync(stageDir, { recursive: true, force: true });
  cpSync(kitDir, stageDir, { recursive: true });
  await compileGlobalCss(kitDir, join(stageDir, "global.css"));
  compileIconSprite(kitDir, kit, join(stageDir, "icons", "sprite.html"));

  // Recreate zip from scratch. Prefer the system `zip` binary,
  // fall back to python3 (available on most CI images).
  await $`rm -f ${outZip}`.quiet();
  try {
    // Run zip from inside the staged dir so paths in the archive are relative
    await $`zip -r -X ${outZip} . -x "*.DS_Store"`.cwd(stageDir).quiet();
  } catch {
    // biome-ignore lint/suspicious/noConsole: build progress output
    console.log(`system "zip" not found, falling back to python3 for "${kit}"`);
    const script = `import os, zipfile
out = os.environ["KIT_OUT"]
src = os.environ["KIT_SRC"]
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
    for base, _, files in os.walk(src):
        for f in files:
            if f == ".DS_Store":
                continue
            full = os.path.join(base, f)
            z.write(full, os.path.relpath(full, src))`;
    await $`python3 -c ${script}`.env({ KIT_OUT: outZip, KIT_SRC: stageDir }).quiet();
  }

  const target = join(docsKitsDir, `${kit}.zip`);
  await Bun.write(target, Bun.file(outZip));
  rmSync(stageDir, { recursive: true, force: true });
  // biome-ignore lint/suspicious/noConsole: build progress output
  console.log(
    `√ kit "${kit}" → ${outZip} (includes global.css + icons/sprite.html) + docs/assets/kits/${kit}.zip`,
  );
}

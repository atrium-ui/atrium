/// <reference types="@types/bun" />
const LICENSE = `/**
* @license
* Copyright (c) 2024 Atrium Contributors
* SPDX-License-Identifier: MIT
*/`;

async function buildLib(root: string, target: "node" | "browser") {
  await Bun.build({
    entrypoints: [`${root}`],
    external: [
      //
      "lit",
      "@sv/svg-sprites/sheet",
      "chokidar",
      "fast-glob",
      "svg-sprite",
    ],
    target: target,
    footer: LICENSE,
    outdir: `dist`,
    format: "esm",
    sourcemap: "linked" as const,
    naming: "[dir]/[name].js",
  });
}

await Promise.all([
  // "build:main": "tsup src/sprite-sheet.ts -d dist --format esm,cjs --dts",
  // "build:component": "tsup src/component/Icon.ts -d dist --format esm,cjs --dts --external @sv/svg-sprites/sheet",
  // "build:vite": "tsup src/plugin/vite-plugin.ts -d dist --format esm,cjs --dts --external chokidar",
  // "build:webpack": "tsup src/loader/webpack-loader.ts -d dist --format esm,cjs --dts"

  //
  buildLib("./src/sprite-sheet.ts", "node"),
  buildLib("./src/component/Icon.ts", "browser"),
  buildLib("./src/plugin/vite-plugin.ts", "node"),
  buildLib("./src/loader/webpack-loader.ts", "node"),
]);

export {};

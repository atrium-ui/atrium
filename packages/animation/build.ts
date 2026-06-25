/// <reference types="@types/bun" />
const LICENSE = `/**
* @license
* Copyright (c) 2024 Atrium Contributors
* SPDX-License-Identifier: MIT
*/`;

async function buildLib(root: string) {
  await Bun.build({
    entrypoints: [`${root}/src/index.ts`],
    external: [
      "lit",
      "@rive-app/canvas-advanced-lite",
      "@atrium-ui/elements",
      "@atrium-ui/scroll-lock",
      "@floating-ui/dom",
      "chart.js",
    ],
    footer: LICENSE,
    outdir: `${root}/dist`,
    format: "esm",
    sourcemap: "linked" as const,
    naming: "[dir]/[name].js",
  });
}

await buildLib(".");

export {};

/// <reference types="@types/bun" />

const LICENSE = `/**
* @license
* Copyright (c) 2026 Atrium Contributors
* SPDX-License-Identifier: MIT
*/`;

await Bun.build({
  entrypoints: ["./src/index.ts"],
  external: ["node:url"],
  footer: LICENSE,
  outdir: "./dist",
  format: "esm",
  sourcemap: "linked",
  target: "node",
  naming: "[dir]/[name].js",
});

export {};

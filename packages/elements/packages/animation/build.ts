/// <reference types="@types/bun" />
const LICENSE = `/**
* @license
* Copyright (c) 2024 Atrium Contributors
* SPDX-License-Identifier: MIT
*/`;

await Bun.build({
  entrypoints: ["./src/index.ts"],
  external: ["lit", "@sv/elements", "@rive-app/canvas-advanced"],
  footer: LICENSE,
  outdir: "./dist",
  format: "esm",
  sourcemap: "linked" as const,
  naming: "[dir]/[name].js",
});

export {};

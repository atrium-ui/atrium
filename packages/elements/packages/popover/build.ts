/// <reference types="@types/bun" />
const LICENSE = `/**
* @license
* Copyright (c) 2024 Atrium Contributors
* SPDX-License-Identifier: MIT
*/`;

await Bun.build({
  entrypoints: ["./src/index.ts"],
  external: ["lit", "@floating-ui/dom", "@sv/elements", "@rive-app/canvas-advanced"],
  footer: LICENSE,
  outdir: "./dist",
  format: "esm",
  sourcemap: "linked" as const,
  naming: "[dir]/[name].js",
});

// reference for watch build
// import("./src/index.js");

console.info("🚀 Build complete");

export {};

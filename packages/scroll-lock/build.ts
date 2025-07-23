/// <reference types="@types/bun" />
const LICENSE = `/**
* @license
* Copyright (c) 2024 Atrium Contributors
* SPDX-License-Identifier: MIT
*/`;

function options() {
  return {
    entrypoints: ["./src/index.ts"],
    footer: LICENSE,
    outdir: "./dist",
    format: "esm",
    sourcemap: "linked" as const,
    naming: "[dir]/[name].js",
  };
}

for (const format of ["esm"] as const) {
  await Bun.build(options(format));
}

export {};

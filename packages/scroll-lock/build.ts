const LICENSE = `/**
* @license
* Copyright (c) 2024 Atrium Contributors
* SPDX-License-Identifier: MIT
*/`;

function options(format: "esm" | "cjs" | undefined) {
  return {
    entrypoints: ["./src/index.ts"],
    footer: LICENSE,
    outdir: "./dist",
    format: format,
    sourcemap: "linked" as const,
    naming: format === "esm" ? "[dir]/[name].js" : "[dir]/[name].cjs",
  };
}

for (const format of ["esm"] as const) {
  await Bun.build(options(format));
}

export {};

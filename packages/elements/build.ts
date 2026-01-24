/// <reference types="@types/bun" />
const LICENSE = `/**
* @license
* Copyright (c) 2024 Atrium Contributors
* SPDX-License-Identifier: MIT
*/`;

async function buildLib(root: string) {
  await Bun.build({
    entrypoints: [`${root}/src/index.ts`],
    external: ["lit", "@sv/elements", "@sv/scroll-lock", "@floating-ui/dom"],
    footer: LICENSE,
    outdir: `${root}/dist`,
    format: "esm",
    sourcemap: "linked" as const,
    naming: "[dir]/[name].js",
  });
}

await Promise.all([
  //
  // buildLib("./packages/animation"),
  buildLib("./packages/blur"),
  buildLib("./packages/box"),
  // buildLib("./packages/chart"),
  buildLib("./packages/expandable"),
  buildLib("./packages/form"),
  buildLib("./packages/list"),
  buildLib("./packages/loader"),
  buildLib("./packages/popover"),
  buildLib("./packages/portal"),
  buildLib("./packages/range"),
  buildLib("./packages/scroll"),
  buildLib("./packages/select"),
  buildLib("./packages/shortcut"),
  buildLib("./packages/time"),
  buildLib("./packages/toast"),
  buildLib("./packages/toggle"),
  buildLib("./packages/track"),
  buildLib("./packages/transition"),
  buildLib("./packages/calendar"),
  buildLib("./packages/tabs"),
]);

export {};

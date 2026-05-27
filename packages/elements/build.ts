/// <reference types="@types/bun" />
import * as esbuild from "esbuild";

const LICENSE = `/**
* @license
* Copyright (c) 2024 Atrium Contributors
* SPDX-License-Identifier: MIT
*/`;

// We use esbuild (not Bun.build) because Bun.build does not rename intermediate
// `var _<propName> = new WeakMap()` bindings emitted by the TC39 standard-
// decorator transform when two classes in the same bundle decorate fields with
// the same name (e.g. TabsPanelElement.selected + TabsTabElement.selected).
// The duplicates collapse via `var` hoisting and the accessor reads from a
// WeakMap that was never populated → "Cannot read from private field".
// esbuild scopes those bindings (`_selected` / `_selected2`) and avoids it.
async function buildLib(root: string) {
  await esbuild.build({
    entryPoints: [`${root}/src/index.ts`],
    external: ["lit", "@sv/elements", "@sv/scroll-lock", "@floating-ui/dom"],
    footer: { js: LICENSE },
    outfile: `${root}/dist/index.js`,
    format: "esm",
    bundle: true,
    sourcemap: "linked",
    target: "es2022",
    tsconfig: "./tsconfig.json",
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
  buildLib("./packages/lightbox"),
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
  buildLib("./packages/pager"),
]);

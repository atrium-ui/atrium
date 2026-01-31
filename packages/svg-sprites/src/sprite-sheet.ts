import { getSheet } from "./sheet.js";

globalThis.Blob = globalThis.Blob || class {};

export function blob() {
  return new globalThis.Blob(["_svgSheetString_"], { type: "image/svg+xml" });
}

export function svg(
  options = { dir: ["assets/icons/**/*.svg"] },
): Promise<string> | string {
  return getSheet(options, true);
}

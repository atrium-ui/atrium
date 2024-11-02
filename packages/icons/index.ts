import { SvgIcon } from "svg-sprites/svg-icon";

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class IconElement extends SvgIcon {
  // TODO: patch svg-sprites to allow for a custom `createIcons` function
  static get createIcons() {
    if (typeof window !== "undefined") {
      const svgSheetBlob = new Blob(["_svgSheetString_"], { type: "image/svg+xml" });
      return URL.createObjectURL(svgSheetBlob);
    }

    return undefined;
  }
}

if ("customElements" in globalThis && !customElements.get("a-icon")) {
  customElements.define("a-icon", IconElement);
}

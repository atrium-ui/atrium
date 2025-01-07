let svgSheet: HTMLDivElement;
let supportsAdoptingStyleSheets = true;
let loaded: Promise<void>;

async function loadSvgSheet() {
  const { svg } = await import("svg-sprites/sheet");
  svgSheet = document.createElement("div");
  svgSheet.innerHTML = await svg();
}

if (typeof window !== "undefined") {
  loaded = loadSvgSheet();

  supportsAdoptingStyleSheets =
    globalThis.ShadowRoot &&
    "adoptedStyleSheets" in Document.prototype &&
    "replace" in CSSStyleSheet.prototype;
}

export class FraIcon extends HTMLElement {
  static sheet?: CSSStyleSheet;

  static elementProperties = new Map([["name", { type: String }]]);

  static get styles() {
    return /*css*/ `
      :host {
        font-size: 1.5rem;
        color: inherit;
        display: inline-block;
        vertical-align: top;
        width: 1em;
        height: 1em;
      }

      svg {
        display: block;
        width: inherit;
        height: inherit;
      }
    `;
  }

  static getStyleSheet(): CSSStyleSheet {
    if (!FraIcon.sheet) {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(FraIcon.styles);
      FraIcon.sheet = sheet;
    }
    return FraIcon.sheet;
  }

  static get observedAttributes() {
    return ["name"];
  }

  _name: string | undefined = undefined;

  attributeChangedCallback() {
    this.updateIcon();

    this._name = this.getAttribute("name") || "unknown";
  }

  get name() {
    return this._name;
  }

  async updateIcon() {
    await loaded;

    let symbol: SVGSymbolElement | null;

    if (!this.name) return;

    const escapedName = this.name?.replace(/\//g, "\\/");
    symbol = svgSheet.querySelector(`[id="${escapedName}"]`);
    this.dataset.icon = escapedName;

    if (symbol) {
      this.useSymbol(symbol);
    } else {
      console.warn(`Could not find icon "${this.name}"`);
      symbol = svgSheet.querySelector("#unknown");
    }
  }

  useSymbol(symbol: SVGSymbolElement) {
    if (this.shadowRoot && symbol) {
      const node = symbol.cloneNode(true) as SVGElement;
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", symbol.getAttribute("viewBox") || "");
      svg.setAttribute("aria-hidden", "true");
      for (const child of node.children) {
        svg.appendChild(child);
      }
      this.shadowRoot.appendChild(svg);
    }
  }

  constructor() {
    super();

    const shadow = this.attachShadow({ mode: "open" });

    if (supportsAdoptingStyleSheets) {
      shadow.adoptedStyleSheets = [FraIcon.getStyleSheet()];
    } else {
      const style = document.createElement("style");
      style.textContent = FraIcon.styles;
      shadow.appendChild(style);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "svg-icon": FraIcon;
  }
}

if ("customElements" in globalThis && !customElements.get("svg-icon")) {
  customElements.define("svg-icon", FraIcon);
}

let svgSheet: HTMLDivElement;
let supportsAdoptingStyleSheets = true;
let loaded: Promise<void>;

async function loadSvgSheet() {
  const { svg } = await import("@sv/svg-sprites/sheet");
  svgSheet = document.createElement("div");
  svgSheet.innerHTML = await svg();
  if (svgSheet.children[0]) {
    document.head.appendChild(svgSheet.children[0]);
  }
}

if (typeof window !== "undefined") {
  loaded = loadSvgSheet();

  supportsAdoptingStyleSheets =
    globalThis.ShadowRoot &&
    "adoptedStyleSheets" in Document.prototype &&
    "replace" in CSSStyleSheet.prototype;
}

export class IconElement extends HTMLElement {
  static sheet?: CSSStyleSheet;

  static get styles() {
    return /*css*/ `
      :host {
        color: inherit;
        display: inline-block;
        vertical-align: top;
        width: 1em;
        height: 1em;
      }
      img, svg {
        display: block;
        width: inherit;
        height: inherit;
      }
    `;
  }

  static getStyleSheet(): CSSStyleSheet {
    if (!IconElement.sheet) {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(IconElement.styles);
      IconElement.sheet = sheet;
    }
    return IconElement.sheet;
  }

  static get observedAttributes() {
    return ["use", "name", "src"];
  }

  _name: string | undefined = undefined;
  _use: string | undefined = undefined;
  _src: string | undefined = undefined;

  attributeChangedCallback() {
    this.updateIcon();

    this._name = this.getAttribute("name") || undefined;
    this._use = this.getAttribute("use") || undefined;
    this._src = this.getAttribute("src") || undefined;
  }

  get src() {
    return this._src;
  }

  get iconName() {
    return this._name || this._use || "unknown";
  }

  async updateIcon() {
    await loaded;

    let symbol: HTMLElement | null;

    if (this.src) {
      this.useSrc(this.src);
      return;
    }

    if (!this.iconName) return;

    symbol = document.getElementById(this.iconName);
    this.dataset.icon = this.iconName;

    if (symbol) {
      this.useSymbol(symbol);
    } else {
      console.warn(`Could not find icon "${this.iconName}"`);
      symbol = document.getElementById("unknown");
    }
  }

  _initiated = false;

  useSymbol(symbol: HTMLElement) {
    if (this.shadowRoot && symbol) {
      if (this._initiated) this.shadowRoot.innerHTML = "";

      const node = symbol.cloneNode(true) as SVGElement;
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", symbol.getAttribute("viewBox") || "");
      svg.setAttribute("aria-hidden", "true");
      svg.replaceChildren(...node.children);
      this.shadowRoot.appendChild(svg);

      this._initiated = true;
    }
  }

  useSrc(src: string) {
    if (this.shadowRoot) {
      if (this._initiated) this.shadowRoot.innerHTML = "";

      const img = document.createElement("img");
      img.src = src;
      img.setAttribute("aria-hidden", "true");
      this.shadowRoot.appendChild(img);

      this._initiated = true;
    }
  }

  constructor() {
    super();

    const shadow = this.attachShadow({ mode: "open" });

    if (supportsAdoptingStyleSheets) {
      shadow.adoptedStyleSheets = [IconElement.getStyleSheet()];
    } else {
      const style = document.createElement("style");
      style.textContent = IconElement.styles;
      shadow.appendChild(style);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "svg-icon": IconElement;
  }
}

if ("customElements" in globalThis && !customElements.get("svg-icon")) {
  customElements.define("svg-icon", IconElement);
}

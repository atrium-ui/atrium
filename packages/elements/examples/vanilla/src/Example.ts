const styles = `
:host {
	display: block;
}
`;

let supportsAdoptingStyleSheets = true;

if (typeof window !== "undefined") {
	supportsAdoptingStyleSheets =
		globalThis.ShadowRoot &&
		"adoptedStyleSheets" in Document.prototype &&
		"replace" in CSSStyleSheet.prototype;
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
if (!("HTMLElement" in globalThis)) globalThis.HTMLElement = class {};

export class Example extends HTMLElement {
	static sheet?: CSSStyleSheet;

	static getStyleSheet(): CSSStyleSheet {
		if (!Example.sheet) {
			const sheet = new CSSStyleSheet();
			sheet.replaceSync(styles);
			Example.sheet = sheet;
		}
		return Example.sheet;
	}

	constructor() {
		super();

		const shadow = this.attachShadow({ mode: "open" });

		if (supportsAdoptingStyleSheets) {
			shadow.adoptedStyleSheets = [Example.getStyleSheet()];
		} else {
			const style = document.createElement("style");
			style.textContent = styles;
			shadow.appendChild(style);
		}
	}

	connectedCallback() {
		this.render();
	}

	protected render() {
		if (this.shadowRoot)
			this.shadowRoot.innerHTML = /*html*/ `
				<div class="container">
					<slot></slot>
				</div>
			`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"a-example": Example;
	}
}

if ("customElements" in globalThis) customElements.define("a-example", Example);

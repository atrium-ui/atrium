import { LitElement, css } from 'lit';

declare global {
	interface HTMLElementTagNameMap {
		'a-boilerplate': BoilerplateElement;
	}
}

export class BoilerplateElement extends LitElement {
	public static get styles() {
		return [
			css`
        :host {
          display: block;
        }
      `,
		];
	}

	connectedCallback() {
		super.connectedCallback();
	}

	disconnectedCallback(): void {
		super.disconnectedCallback();
	}
}

customElements.define('a-boilerplate', BoilerplateElement);

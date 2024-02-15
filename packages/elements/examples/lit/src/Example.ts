import { HTMLTemplateResult, LitElement, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("a-example")
export class Example extends LitElement {
	public static styles = unsafeCSS(`
		:host {
			display: block;
		}
	`);

	@property({ type: Boolean, reflect: true })
	public prop?: boolean;

	protected render(): HTMLTemplateResult {
		return html`
      <div class="container">
        <slot></slot>
      </div>
    `;
	}
}

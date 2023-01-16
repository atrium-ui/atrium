import { html, css, HTMLTemplateResult, LitElement } from "lit";
import { customElement, property, query } from "lit/decorators.js";

@customElement("sv-example")
export class Example extends LitElement {
  public static get styles() {
    return [
      css`
        :host {
          display: block;
        }
      `,
    ];
  }

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

import { LitElement, css, html } from "lit";
import { property } from "lit/decorators.js";

declare global {
  interface HTMLElementTagNameMap {
    "a-option": OptionElement;
  }
}

export class OptionElement extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block;
      }
    `;
  }

  @property({ type: String, reflect: true })
  public value!: string;

  render() {
    return html`<slot></slot>`;
  }
}

customElements.define("a-option", OptionElement);

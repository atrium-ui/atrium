import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("dropdown-option")
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

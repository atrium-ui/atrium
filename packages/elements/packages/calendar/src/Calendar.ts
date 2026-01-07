import { LitElement, css, html } from "lit";
import { property } from "lit/decorators/property.js";

export class CalendarElement extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
    }
  `;

  /**
   * FormData name of the field.
   */
  @property({ type: String })
  public name?: string;

  /**
   * The value of the field, which is submitted with the form data.
   */
  @property({ type: String, reflect: true })
  public value?: string;

  connectedCallback() {
    super.connectedCallback();

    this.tabIndex = 0;
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
  }

  render() {
    return html`calendar`;
  }
}

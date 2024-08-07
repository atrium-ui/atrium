import { LitElement, type PropertyValues, css, html } from "lit";
import { property } from "lit/decorators/property.js";
import "air-datepicker/air-datepicker.css";
import localeEn from "air-datepicker/locale/en";
import AirDatepicker from "air-datepicker";

export class DatepickerElement extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
    }

    ::slotted(.datepicker) {
      width: 100% !important;
      height: 100% !important;
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

  private air?: AirDatepicker<HTMLElement>;

  connectedCallback() {
    super.connectedCallback();

    this.tabIndex = 0;

    this.air = new AirDatepicker<HTMLElement>(this, {
      locale: localeEn,
      inline: true,
      visible: true,
      keyboardNav: true,
      classes: "datepicker",
      onSelect: (date) => {
        this.dispatchEvent(new CustomEvent("change", { detail: date, bubbles: true }));
      },
    });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
  }

  render() {
    return html`
      <slot />
    `;
  }
}

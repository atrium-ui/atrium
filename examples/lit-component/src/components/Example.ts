import { html, HTMLTemplateResult, LitElement, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import styles from "./Example.css";

@customElement("sv-example")
export class Example extends LitElement {
  public static styles = unsafeCSS(styles);

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

import { html, css, HTMLTemplateResult, LitElement } from "lit";
import { property } from "lit/decorators.js";

export class Expandable extends LitElement {
  public static get styles() {
    return [
      css`
        :host {
          display: block;

          --transition-speed: 0.33s;
          --animation-easing: ease;
        }

        .container {
          display: grid;
          grid-template-rows: 0fr;
          overflow: hidden;
          transition: grid-template-rows var(--transition-speed) var(--animation-easing);
        }

        :host([opened]) .container {
          grid-template-rows: 1fr;
        }

        slot {
          display: block;
          min-height: 0;
        }
      `,
    ];
  }

  @property({ type: Boolean, reflect: true })
  public opened?: boolean;

  public close(): void {
    this.opened = false;
    this.onAnimationFrame();
  }

  public open(): void {
    this.opened = true;
    this.onAnimationFrame();
  }

  @property({ type: Number })
  public scrollOffsetY?: number;

  protected onAnimationFrame() {
    // scrolls interaction into viewport
    const rect = this.getClientRects()[0];
    if (rect) {
      const elementStartPosY = rect.y;
      const offsetY = this.scrollOffsetY || 0;
      if (elementStartPosY <= offsetY) {
        window.scrollBy(0, (elementStartPosY - offsetY) / 10);
      }
    }
  }

  protected render(): HTMLTemplateResult {
    return html`
      <div class="container">
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "sv-expandable": Expandable;
  }
}

customElements.define("sv-expandable", Expandable);

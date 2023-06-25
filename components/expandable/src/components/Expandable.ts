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

  @property({ type: Boolean, reflect: true }) public opened: boolean = false;
  @property({ type: String, reflect: true }) public direction: string = "down";

  public close(): void {
    this.opened = false;
    this.onAnimationFrame();
  }

  public open(): void {
    this.opened = true;
    this.onAnimationFrame();
  }

  public toggle(): void {
    this.opened ? this.close() : this.open();
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
      ${this.direction === "down"
        ? html`<slot name="toggle" @click=${this.toggle}></slot>`
        : undefined}
      <div class="container" aria-hidden=${!this.opened && "true"}>
        <slot></slot>
      </div>
      ${this.direction === "up"
        ? html`<slot name="toggle" @click=${this.toggle}></slot>`
        : undefined}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "sv-expandable": Expandable;
  }
}

customElements.define("sv-expandable", Expandable);

import { type HTMLTemplateResult, LitElement, css, html, PropertyValueMap } from "lit";
import { property } from "lit/decorators.js";

declare global {
  interface HTMLElementTagNameMap {
    "a-expandable": Expandable;
  }
}

/**
 * - A wrapper element, that can collapse and expand its content with an animation.
 * - It can include a trigger elemeent which is always visible.
 *
 * @customEvent change - Emitted when the element open state changes
 *
 * @example
 * ```tsx
 * <a-expandable opened class="accordion">
 *    <div slot="toggle">
 *      <button type="button">
 *        <div class="headline">Title</div>
 *      </button>
 *    </div>
 *
 *    <div>Content</div>
 *  </a-expandable>
 * ```
 *
 * @see https://sv.pages.s-v.de/sv-frontend-library/mono/elements/a-expandable/
 */
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
					grid-template-columns: 100%;
          overflow: hidden;
          transition: grid-template-rows var(--transition-speed) var(--animation-easing);
        }

        :host([opened]) .container {
          grid-template-rows: 1fr;
        }

        .content {
          display: block;
          min-height: 0;
        }

        ::slotted(*) {
          pointer-events: all;
        }

        button {
          all: unset;
          display: block;
          width: 100%;
          pointer-events: none;
        }
      `,
    ];
  }

  /** Wether the eleemnt is open or not */
  @property({ type: Boolean, reflect: true }) public opened = false;

  /** What direction to open */
  @property({ type: String, reflect: true }) public direction: "down" | "up" = "down";

  private _id = `expandable_${Math.floor(Math.random() * 100000)}`;

  public close(): void {
    this.opened = false;
    this.onAnimationFrame();
    this.dispatchEvent(new Event("change"));
  }

  public open(): void {
    this.opened = true;
    this.onAnimationFrame();
    this.dispatchEvent(new Event("change"));
  }

  public toggle(): void {
    this.opened ? this.close() : this.open();
  }

  @property({ type: Number })
  public scrollOffsetY?: number;

  protected updated(): void {
    const btn = this.button;
    if (btn) btn.ariaExpanded = this.opened.toString();
  }

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

  private get button() {
    const slot = this.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="toggle"]');
    return slot?.assignedElements()[0];
  }

  private renderToggle() {
    return html`
      <slot name="toggle"
        @slotchange=${(e) => {
          const slot = e.currentTarget;
          const child = slot.children[0] as HTMLElement;
          child?.setAttribute("aria-controls", this._id);
        }}
        @click=${(e) => {
          if (this.button?.contains(e.target)) {
            this.toggle();
          }
        }}>
      </slot>
    `;
  }

  protected render(): HTMLTemplateResult {
    return html`
      ${this.direction === "down" ? this.renderToggle() : undefined}
      <div class="container" id="${this._id}" aria-hidden=${!this.opened && "true"}>
        <slot class="content"></slot>
      </div>
      ${this.direction === "up" ? this.renderToggle() : undefined}
    `;
  }
}

if (!customElements.get("a-expandable")) {
  customElements.define("a-expandable", Expandable);
}

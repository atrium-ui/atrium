import { type HTMLTemplateResult, LitElement, css, html } from "lit";
import { property } from "lit/decorators/property.js";

declare global {
  interface HTMLElementTagNameMap {
    "a-expandable": Expandable;
  }
}

let accordionIncrement = 0;

/**
 * A element that can collapse and expand its content with an animation.
 *
 * @customEvent change - Emitted when the element open state changes
 *
 * @example
 * ```tsx
 * <a-expandable opened class="accordion">
 *    <button slot="toggle" type="button">
 *      <div class="headline">Title</div>
 *    </button>
 *
 *    <div>Content</div>
 *  </a-expandable>
 * ```
 *
 * @see https://svp.pages.s-v.de/atrium/elements/a-expandable/
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

  public close(): void {
    this.opened = false;
    this.onChange();
  }

  public open(): void {
    this.opened = true;
    this.onChange();
  }

  public toggle(): void {
    this.opened ? this.close() : this.open();
  }

  protected updated(): void {
    this.onChange();
  }

  private onChange() {
    const trigger = this.trigger;
    if (trigger) {
      this.trigger.setAttribute("aria-expanded", this.opened.toString());
    }

    const content = this.content;
    if (content) {
      content.setAttribute("aria-hidden", String(!this.opened));
    }

    const ev = new CustomEvent("change", { bubbles: true, cancelable: true });
    this.dispatchEvent(ev);

    if (!ev.defaultPrevented)
      this.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
  }

  private get trigger() {
    return this?.querySelector<HTMLElement>('[slot="toggle"]');
  }

  private get content() {
    return this.querySelector<HTMLElement>("> :not([slot])");
  }

  private _id_toggle = `expandable_toggle_${++accordionIncrement}`;
  private _id_content = `expandable_content_${accordionIncrement}`;

  private onSlotChange() {
    const trigger = this.trigger;
    if (trigger) {
      trigger.setAttribute("aria-controls", this._id_content);
      trigger.id = this._id_toggle;
    }

    const content = this.content;
    if (content) {
      content.role = "region";
      content.id = this._id_content;
      content.setAttribute("aria-labelledby", this._id_toggle);
    }
  }

  private onClick(e: Event) {
    if (this.trigger?.contains(e.target as HTMLElement)) this.toggle();
  }

  private renderToggle() {
    return html`<slot name="toggle" @slotchange=${this.onSlotChange} @click=${this.onClick}></slot>`;
  }

  protected render(): HTMLTemplateResult {
    return html`
      ${this.direction === "down" ? this.renderToggle() : undefined}
      <div class="container">
        <slot @slotchange=${this.onSlotChange} class="content"></slot>
      </div>
      ${this.direction === "up" ? this.renderToggle() : undefined}
    `;
  }
}

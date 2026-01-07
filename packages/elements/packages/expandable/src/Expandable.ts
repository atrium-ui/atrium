import { type HTMLTemplateResult, LitElement, css, html } from "lit";
import { property } from "lit/decorators/property.js";
import { ifDefined } from "lit/directives/if-defined.js";

declare global {
  interface HTMLElementTagNameMap {
    "a-expandable": Expandable;
  }
}

let windowLoaded = false;

if (typeof window !== "undefined") {
  window.addEventListener("load", () => {
    windowLoaded = true;
  });
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
 * @see https://atrium-ui.dev/elements/a-expandable/
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
          content-visibility: visible;
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

  onChange() {
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

    if (!ev.defaultPrevented && windowLoaded) {
      this.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  }

  get content() {
    for (const ele of this.children) {
      // default slot
      if (!ele.slot) return ele;
    }
    return undefined;
  }

  get trigger() {
    for (const ele of this.children) {
      if (ele.slot === "toggle") return ele;
    }
    return undefined;
  }

  _id_toggle = `expandable_toggle_${++accordionIncrement}`;
  _id_content = `expandable_content_${accordionIncrement}`;

  onSlotChange() {
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

  onBeforeMatch() {
    if (!this.opened) this.open();
  }

  onClick(e: Event) {
    if (this.trigger?.contains(e.target as HTMLElement)) this.toggle();
  }

  findDeeplink() {
    if (!location.hash) {
      return undefined;
    }

    try {
      const ele = this.querySelector<HTMLElement>(location.hash);
      if (ele) {
        return ele;
      }
    } catch (_err: unknown) {
      // invalid selector or ele not found
    }

    const slots = this.querySelectorAll("slot");
    if (!slots) {
      return undefined;
    }

    const hashId = location.hash.substring(1);

    for (const slot of slots) {
      for (const ele of slot.assignedElements()) {
        if (ele.id === hashId) {
          return ele;
        }

        try {
          const link = ele?.querySelector<HTMLElement>(`#${hashId}`);
          if (link) {
            return link;
          }
        } catch (_err: unknown) {
          // invalid selector or ele not found
        }
      }
    }

    return undefined;
  }

  onDeeplink = () => {
    if (!this.opened && this.findDeeplink()) {
      this.open();
    }
  };

  connectedCallback() {
    super.connectedCallback();

    this.onDeeplink();

    window.addEventListener("hashchange", this.onDeeplink);
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    window.removeEventListener("hashchange", this.onDeeplink);
  }

  renderToggle() {
    return html`<slot
      name="toggle"
      @slotchange=${this.onSlotChange}
      @click=${this.onClick}
    ></slot>`;
  }

  protected render(): HTMLTemplateResult {
    return html`
      ${this.direction === "down" ? this.renderToggle() : undefined}
      <div
        class="container"
        part="container"
        ?inert=${!this.opened}
        hidden=${ifDefined(!this.opened ? "until-found" : undefined)}
        @beforematch=${this.onBeforeMatch}
      >
        <slot @slotchange=${this.onSlotChange} class="content"></slot>
      </div>
      ${this.direction === "up" ? this.renderToggle() : undefined}
    `;
  }
}

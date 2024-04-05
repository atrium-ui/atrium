import { type HTMLTemplateResult, LitElement, css, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";

declare global {
  interface HTMLElementTagNameMap {
    "a-popover": Popover;
  }
}

/**
 * # a-popover
 *
 * - A wrapper element that shows content when the user clicks with the input element.
 *
 * ## Props
 *
 * @attribute direction (default: "down") - Controls the direction in that the content will be show from the origin element.
 * @attribute opened (default: false) - Controls if the content is shown or not.
 *
 * @example
 * ```html
 * <a-popover>
 *   <button type="button" slot="input">
 *     Label
 *   </button>
 *
 *   <div>
 *     Content
 *   </div>
 * </a-popover>
 * ```
 *
 * @see https://sv.pages.s-v.de/sv-frontend-library/mono/elements/a-popover/
 */
@customElement("a-popover")
export class Popover extends LitElement {
  public static styles = css`
    :host {
      display: flex;
      justify-content: center;
      transition-property: all;
      position: relative;
    }

    .content {
      position: absolute;
      top: 100%;
      margin-top: 0.5rem;
      pointer-events: none;
    }

    @keyframes scale-up {
      from {
        transform: scale(0.95);
      }
    }

    @keyframes scale-down {
      to {
        transform: scale(0.95);
      }
    }

    :host([direction="up"]) .content {
      top: auto;
      bottom: 100%;
      margin-bottom: 0.5rem;
    }

    :host([direction="down"]) .content {
      top: 100%;
      bottom: auto;
      margin-top: 0.5rem;
    }

    :host([opened]) .content {
      animation: scale-up 0.2s ease both;
      pointer-events: all;
    }

    :host(:not([opened])) .content {
      animation: scale-down 0.2s ease both;
      pointer-events: all;
    }
  `;

  @property({ type: String, reflect: true })
  public direction: "down" | "up" = "down";

  @property({ type: Boolean, reflect: true })
  public opened = false;

  @query(".content")
  content;

  open() {
    this.opened = true;
  }

  close() {
    this.opened = false;
  }

  toggle() {
    if (this.opened) {
      this.close();
    } else {
      this.open();
    }
  }

  shouldBlur(e: MouseEvent) {
    if (this.contains(e.target as HTMLElement)) {
      return false;
    }
    return true;
  }

  handleClick = (e: MouseEvent) => {
    if (this.shouldBlur(e)) {
      this.dispatchEvent(new Event("blur"));
      this.opened = false;
    }
  };

  connectedCallback(): void {
    super.connectedCallback();

    window.addEventListener("click", this.handleClick);
  }

  disconnectedCallback(): void {
    window.removeEventListener("click", this.handleClick);
  }

  render(): HTMLTemplateResult {
    return html`
      <slot
        name="input"
        @click=${() => {
          this.toggle();
        }}
      ></slot>
      <div class="content">
        <slot></slot>
      </div>
    `;
  }
}

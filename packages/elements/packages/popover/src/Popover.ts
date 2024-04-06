import {
  LitElement,
  css,
  html,
  type HTMLTemplateResult,
  type ReactiveController,
  type ReactiveControllerHost,
} from "lit";
import { customElement, property, query } from "lit/decorators.js";

declare global {
  interface HTMLElementTagNameMap {
    "a-popover": Popover;
  }
}

export class WindowEventListener<
  E extends string,
  L extends EventListenerOrEventListenerObject,
> implements ReactiveController
{
  host: ReactiveControllerHost;

  constructor(
    host: ReactiveControllerHost,
    public event: E,
    public handleClick: L,
  ) {
    host.addController(this);
    this.host = host;
  }

  hostConnected() {
    window.addEventListener(this.event, this.handleClick);
  }

  hostDisconnected() {
    window.removeEventListener(this.event, this.handleClick);
  }
}

const PopoverAlignment = {
  Bottom: "bottom",
  Top: "top",
  Left: "left",
  Right: "right",
  Auto: "auto",
} as const;

/**
 * # a-popover
 *
 * - A wrapper element that shows content when the user clicks with the input element.
 *
 * ## Props
 *
 * @attribute align (default: "auto") - Controls the align in that the content will be show from the origin element.
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
  @property({ type: String })
  public align: (typeof PopoverAlignment)[keyof typeof PopoverAlignment] =
    PopoverAlignment.Auto;

  @property({ type: Boolean, reflect: true })
  public opened = false;

  public static styles = css`
    :host {
      display: inline-block;
      transition-property: all;
    }

    @keyframes scale-up {
      from {
        transform: translateY(-5px);
      }
    }

    @keyframes scale-down {
      to {
        transform: translateY(-5px);
      }
    }

    .content {
      display: block;
      position: absolute;
    }

    :host([opened]) .content {
      animation: scale-up 0.2s ease both;
    }

    :host(:not([opened])) .content {
      pointer-events: none;
      animation: scale-down 0.2s ease both;
    }
  `;

  @query(".content") container?: HTMLSlotElement;
  @query(".trigger") input?: HTMLSlotElement;

  render(): HTMLTemplateResult {
    return html`
      <slot
        class="trigger"
        name="input"
        @click=${() => this.toggle()}>
      </slot>
      <slot
        class="content"
        ?inert=${this.opened ? false : true}
        aria-hidden=${this.opened ? "false" : "true"}
        @keydown=${this.onKeyDown}>
      </slot>
    `;
  }

  private get content() {
    return this.container?.assignedElements()[0] as HTMLElement;
  }

  private get trigger() {
    return this.input?.assignedElements()[0] as HTMLButtonElement;
  }

  private onKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      this.close();
      this.trigger?.focus();
    }
  }

  private shouldBlur(e: Event) {
    if (this.contains(e.target as HTMLElement)) {
      return false;
    }
    return true;
  }

  private clickListener = new WindowEventListener(this, "click", (e: Event) => {
    if (this.shouldBlur(e)) {
      this.dispatchEvent(new Event("blur"));
      this.close();
    }
  });

  show() {
    this.opened = true;
  }

  close() {
    this.opened = false;
  }

  toggle() {
    this.opened ? this.close() : this.show();
  }

  protected updated(): void {
    if (this.trigger) {
      this.trigger.ariaHasPopup = "dialog";
      this.trigger.ariaExpanded = this.opened ? "true" : "false";
    }
    if (this.content) {
      this.content.role = "dialog";
    }

    if (!this.container) return;

    const trigger = this.getBoundingClientRect();
    const contentWidth = this.container.scrollWidth || 0;
    const contentHeight = this.container.scrollHeight || 0;

    const bounds = {
      // top: trigger.top - contentHeight,
      right: trigger.right + contentWidth,
      bottom: trigger.bottom + contentHeight,
      left: trigger.left - contentWidth,
    };

    const alignLeft = (content: HTMLElement) => {
      content.style.left = "auto";
      content.style.right = `${contentWidth}px`;
    };

    const alignRight = (content: HTMLElement) => {
      content.style.left = "0px";
      content.style.right = "auto";
    };

    const alignTop = (content: HTMLElement) => {
      content.style.top = "auto";
      content.style.bottom = `${trigger.height + contentHeight}px`;
    };

    const alignBottom = (content: HTMLElement) => {
      content.style.top = `${trigger.height}px`;
      content.style.bottom = "auto";
    };

    const alignAuto = (content: HTMLElement) => {
      if (bounds.bottom > window.innerHeight) {
        alignTop(content);
      } else {
        alignBottom(content);
      }

      if (bounds.right > window.innerWidth) {
        // align left
        alignLeft(content);
      } else if (bounds.left <= 0) {
        // align right
        alignRight(content);
      } else {
        // center
        content.style.left = `calc(50% - ${contentWidth / 2}px)`;
        content.style.right = "auto";
      }
    };

    switch (this.align) {
      case PopoverAlignment.Left:
        alignLeft(this.container);
        break;
      case PopoverAlignment.Right:
        alignRight(this.container);
        break;
      case PopoverAlignment.Top:
        alignTop(this.container);
        break;
      case PopoverAlignment.Bottom:
        alignBottom(this.container);
        break;
      case PopoverAlignment.Auto:
        alignAuto(this.container);
        break;
      default:
        alignAuto(this.container);
        break;
    }
  }
}

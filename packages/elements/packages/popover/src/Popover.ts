import {
  LitElement,
  css,
  html,
  type HTMLTemplateResult,
  type ReactiveController,
  type ReactiveControllerHost,
} from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { Portal } from "@sv/elements/portal";
import "@sv/elements/blur";
import { computePosition, autoUpdate, autoPlacement, shift } from "@floating-ui/dom";

declare global {
  interface HTMLElementTagNameMap {
    "a-popover": Popover;
  }
}

export class ElementEventListener<
  E extends string,
  L extends EventListenerOrEventListenerObject,
> implements ReactiveController
{
  host: ReactiveControllerHost;

  constructor(
    host: ReactiveControllerHost,
    public root: EventTarget,
    public event: E,
    public handleClick: L,
  ) {
    host.addController(this);
    this.host = host;
  }

  hostConnected() {
    this.root.addEventListener(this.event, this.handleClick);
  }

  hostDisconnected() {
    this.root.removeEventListener(this.event, this.handleClick);
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
 * A wrapper element that shows content when the user clicks with the slotted input element.
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
 * @see https://svp.pages.s-v.de/atrium/elements/a-popover/
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
  `;

  @query(".trigger") input?: HTMLSlotElement;

  render(): HTMLTemplateResult {
    return html`
      <slot
        class="trigger"
        name="input"
        @click=${() => this.toggle()}>
      </slot>
    `;
  }

  private get container() {
    return this.querySelector("a-popover-content") as HTMLElement | undefined;
  }

  private get content() {
    return this.container?.children[0] as HTMLElement | undefined;
  }

  private get trigger() {
    return (this.input?.assignedElements()[0] as HTMLButtonElement) || undefined;
  }

  private shouldBlur(e: Event) {
    if (
      this.contains(e.target as HTMLElement) ||
      this.content?.contains(e.target as HTMLElement)
    ) {
      return false;
    }
    return true;
  }

  private clickListener = new ElementEventListener(this, window, "click", (e: Event) => {
    if (this.shouldBlur(e)) {
      this.dispatchEvent(new Event("blur"));
      this.close();
    }
  });

  private keyListener = new ElementEventListener(this, window, "keydown", ((
    e: KeyboardEvent,
  ) => {
    if (e.key === "Escape") {
      this.close();
      this.trigger?.focus();
    }
  }) as EventListenerOrEventListenerObject);

  cleanup?: () => void;

  show() {
    this.opened = true;
    this.container?.show();

    this.cleanup = autoUpdate(this, this.content, () => {
      computePosition(this, this.content, {
        middleware: [
          autoPlacement({
            allowedPlacements: ["bottom", "top"],
          }),
          shift(),
        ],
        placement: "bottom",
        strategy: "fixed",
      }).then(({ x, y }) => {
        this.content.style.transform = `translate(${x}px, ${y}px)`;
      });
    });
  }

  close() {
    this.opened = false;
    this.cleanup?.();
    this.container?.hide();
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
  }
}

customElements.define(
  "a-popover-content",
  class extends Portal {
    hide() {
      this.portal.children[0]?.removeAttribute("enabled");
    }

    show() {
      this.portal.children[0]?.setAttribute("enabled", "");
    }
  },
);

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
import { Blur } from "@sv/elements/blur";
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

class PopoverContent extends Blur {
  public scrollLock = false;

  static styles = css`
    :host {
      display: block;
      transition-property: all;
      pointer-events: none;
    }

    :host([enabled]) {
      pointer-events: all !important;
    }

    :host(:not([enabled])) ::slotted(*) {
      display: none;
    }
  `;
}

customElements.define("a-popover-content", PopoverContent);

class PopoverPortal extends Portal {
  protected portalGun() {
    const ele = document.createElement("a-popover-content");
    ele.dataset.portal = this.portalId;
    ele.style.position = "fixed";
    ele.style.top = "0px";
    ele.style.left = "0px";
    ele.style.width = "100%";
    ele.style.height = "100%";
    ele.style.zIndex = "10000000";
    return ele;
  }

  connectedCallback(): void {
    super.connectedCallback();

    const popover = this.closest("a-popover");
    if (popover) {
      this.addEventListener("blur", () => {
        popover.close();
      });
    }
  }
}

customElements.define("a-popover-portal", PopoverPortal);

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
 *   <a-popover-content>
 *     <div>Content</div>
 *   </a-popover-content>
 * </a-popover>
 * ```
 *
 * @see https://svp.pages.s-v.de/atrium/elements/a-popover/
 */
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

  private get portal() {
    return this.querySelector("a-popover-portal") as PopoverContent | undefined;
  }

  private get content() {
    return this.portal?.children[0] as HTMLElement | undefined;
  }

  private get trigger() {
    return (this.input?.assignedElements()[0] as HTMLButtonElement) || undefined;
  }

  cleanup?: () => void;

  show() {
    this.opened = true;
    this.portal?.portal?.enable();

    if (!this.content) {
      return;
    }

    this.cleanup = autoUpdate(this, this.content, () => {
      if (this.content)
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
          if (this.content) this.content.style.transform = `translate(${x}px, ${y}px)`;
        });
    });
  }

  close() {
    this.opened = false;
    this.cleanup?.();
    this.portal?.portal?.disable();
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

customElements.define("a-popover", Popover);

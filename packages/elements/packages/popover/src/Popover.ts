import {
  LitElement,
  css,
  html,
  type HTMLTemplateResult,
  type ReactiveController,
  type ReactiveControllerHost,
} from "lit";
import { property, query } from "lit/decorators.js";
import { Portal } from "@sv/elements/portal";
import { Blur } from "@sv/elements/blur";
import {
  computePosition,
  autoUpdate,
  autoPlacement,
  shift,
  arrow,
} from "@floating-ui/dom";

declare global {
  interface HTMLElementTagNameMap {
    "a-popover": Popover;
    "a-popover-trigger": PopoverTrigger;
    "a-popover-portal": PopoverPortal;
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

export class PopoverPortal extends Blur {
  public scrollLock = false;

  static styles = css`
    :host {
      display: block;
      transition-property: all;
      pointer-events: none;
      position: fixed;
      top: 0px;
      left: 0px;
      width: 100%;
      height: 100%;
      z-index: 1000;
    }

    :host([enabled]) {
      pointer-events: all !important;
    }

    :host(:not([enabled])) ::slotted(*) {
      pointer-events: none !important;
      opacity: 0 !important;
    }
  `;
}

/**
 * A popover element.
 * It positions itself relative to the trigger element using
 * [Floating UI](https://floating-ui.com/), a-portal and a-blur for focus management.
 *
 * @example
 * ```html
 * <a-popover>
 *   <div>Content</div>
 * </a-popover>
 * ```
 *
 * @see https://svp.pages.s-v.de/atrium/elements/a-popover/
 */
export class Popover extends Portal {
  protected portalGun() {
    const ele = document.createElement("a-popover-portal");
    ele.className = this.className;
    ele.dataset.portal = this.portalId;
    return ele as PopoverPortal;
  }

  private cleanup?: () => void;

  constructor() {
    super();

    this.addEventListener("blur", (e) => {
      const trigger = this.closest("a-popover-trigger");
      if (e instanceof CustomEvent) {
        trigger?.close();
      }
    });
  }

  get arrowElement() {
    return this.children[0]?.querySelector<HTMLElement>("a-popover-arrow");
  }

  /**
   * Show the popover.
   */
  public show() {
    const trigger = this.closest("a-popover-trigger");
    const content = this.children[0] as HTMLElement | undefined;

    if (!trigger || !content) return;

    this.cleanup = autoUpdate(trigger, content, () => {
      if (content)
        computePosition(trigger, content, {
          middleware: [
            autoPlacement({
              allowedPlacements: ["bottom", "top"],
            }),
            shift(),
            this.arrowElement && arrow({ element: this.arrowElement }),
          ],
        }).then(({ x, y, middlewareData, placement }) => {
          if (content) content.style.transform = `translate(${x}px, ${y}px)`;

          if (middlewareData.arrow) {
            const { x, y } = middlewareData.arrow;

            const arrow = this.arrowElement;
            if (arrow) {
              Object.assign(arrow.style, {
                left: x != null ? `${x}px` : "",
                top: placement === "top" ? (y != null ? `${y}px` : "") : "0",
                bottom: placement === "top" ? "0" : "",
              });
            }
          }
        });
    });

    if (this.children[0]) {
      this.children[0].role = "dialog";
    }

    if (this.portal instanceof PopoverPortal) {
      this.portal.enable();
    }
  }

  /**
   * Hide the popover.
   */
  public hide() {
    this.cleanup?.();

    if (this.portal instanceof PopoverPortal) {
      this.portal.disable();
    }
  }

  disconnectedCallback(): void {
    this.cleanup?.();
    super.disconnectedCallback();
  }
}

/**
 * A wrapper element that shows content when the user clicks with the slotted input element.
 *
 * @example
 * ```html
 * <a-popover-trigger>
 *   <button type="button" slot="trigger">
 *     Label
 *   </button>
 *
 *   <a-popover>
 *     <div>Content</div>
 *   </a-popover>
 * </a-popover>
 * ```
 *
 * @see https://svp.pages.s-v.de/atrium/elements/a-popover/
 */
export class PopoverTrigger extends LitElement {
  /**
   * Wether the content is shown or not.
   */
  @property({ type: Boolean, reflect: true })
  public opened = false;

  public static styles = css`
    :host {
      display: inline-block;
      transition-property: all;
    }
  `;

  @query(".trigger") input?: HTMLSlotElement;
  @query(".content") contentSlot?: HTMLSlotElement;

  render(): HTMLTemplateResult {
    return html`
      <slot class="trigger" name="trigger"></slot>
      <slot class="content"></slot>
    `;
  }

  connectedCallback(): void {
    super.connectedCallback();

    // TODO: listen for mutations
    this.trigger?.setAttribute("aria-haspopup", "dialog");
    this.trigger?.setAttribute("aria-expanded", "false");
  }

  constructor() {
    super();

    this.addEventListener("click", (e) => {
      if (this.trigger?.contains(e.target as Node)) {
        this.toggle();
      }
    });
  }

  private get content() {
    // Note: slot.assignedNodes() would be better, but it's not supported within our test runner
    for (const ele of this.children) {
      // default slot
      if (!ele.slot) return ele;
    }
    return undefined;
  }

  private get trigger() {
    for (const ele of this.children) {
      if (ele.slot === "trigger") return ele;
    }
    return undefined;
  }

  private clickFallback = new ElementEventListener(this, window, "click", (e) => {
    if (this.content instanceof Popover) return;

    if (this.opened && !this.contains(e.target)) {
      this.close();
    }
  });

  /**
   * Show the inner popover.
   */
  public show() {
    this.opened = true;

    if (this.content instanceof Popover) {
      this.content.show();
    }

    this.trigger?.setAttribute("aria-haspopup", "dialog");
    this.trigger?.setAttribute("aria-expanded", "true");
  }

  /**
   * Closes the inner popover.
   */
  public close() {
    this.opened = false;

    if (this.content instanceof Popover) {
      this.content.hide();
    }

    this.trigger?.setAttribute("aria-haspopup", "dialog");
    this.trigger?.setAttribute("aria-expanded", "false");
  }

  /**
   * Toggles the inner popover.
   */
  public toggle() {
    this.opened ? this.close() : this.show();
  }
  protected updated(): void {
    if (this.trigger) {
      this.trigger.ariaHasPopup = "dialog";
      this.trigger.ariaExpanded = this.opened ? "true" : "false";
    }
  }
}

class PopoverArrow extends LitElement {
  static styles = css`
    :host {
      position: absolute;
      z-index: -1;
    }
  `;

  render() {
    return html`<slot></slot>`;
  }
}

if (!customElements.get("a-popover-arrow")) {
  customElements.define("a-popover-arrow", PopoverArrow);
}

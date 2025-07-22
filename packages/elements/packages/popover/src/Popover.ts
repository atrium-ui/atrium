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

    :host([enabled]:not([tooltip])) {
      /* non-modal (tooltip) or modal */
      pointer-events: all !important;
    }

    :host(:not([enabled])) ::slotted(*) {
      pointer-events: none !important;
      opacity: 0 !important;
    }
  `;
}

type Alignment = "start" | "end";
type Placements =
  | "top"
  | "top-end"
  | "top-start"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "right";

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
  static get observedAttributes() {
    return ["alignment", "placements"];
  }

  protected override portalGun() {
    const ele = new PopoverPortal();
    ele.className = this.className;
    ele.dataset.portal = this.portalId;
    return ele;
  }

  protected triggerElementSelector = "a-popover-trigger";

  protected override onEventProxy(ev: Event) {
    if (ev.type !== "exit") {
      return;
    }

    const trigger = this.closest<PopoverTrigger>(this.triggerElementSelector);
    if (ev instanceof CustomEvent) {
      trigger?.hide();
    }
  }

  get arrowElement() {
    return (
      (this.children[0] as HTMLElement | undefined)?.querySelector<HTMLElement>(
        "a-popover-arrow",
      ) || undefined
    );
  }

  public get alignment(): Alignment | undefined {
    if (this.hasAttribute("alignment")) {
      return this.getAttribute("alignment") as Alignment;
    }
    return undefined;
  }

  public get allowedPlacements(): Placements[] {
    if (this.hasAttribute("placements")) {
      return this.getAttribute("placements")?.split(",") as Placements[];
    }
    return ["top", "bottom"];
  }

  private cleanup?: () => void;

  /**
   * Show the popover.
   */
  public show() {
    this.placePortal();

    const trigger = this.closest<PopoverTrigger>(this.triggerElementSelector);
    const content = this.children[0] as HTMLElement | undefined;

    if (!trigger || !content) return;

    this.cleanup = autoUpdate(trigger, content, () => {
      if (content)
        computePosition(trigger, content, {
          middleware: [
            autoPlacement({
              alignment: this.alignment,
              allowedPlacements: this.allowedPlacements,
            }),
            shift(),
            this.arrowElement && arrow({ element: this.arrowElement }),
          ],
        }).then(({ x, y, middlewareData, placement }) => {
          if (content) content.style.transform = `translate(${x}px, ${y}px)`;

          // set placement data for styling purposes
          content.dataset.placement = placement;

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

    // waits for DOM mutations to finish, to start transitions no enable
    requestAnimationFrame(() => {
      if (this.portal instanceof PopoverPortal) {
        this.portal.enable();
      }
    });
  }

  private transitionInProgress = false;

  private onTransitionStart = () => {
    this.transitionInProgress = true;

    // wait for transitions to end before removing portal
    this.addEventListener("transitionend", this.onRemovePortal, {
      once: true,
    });
  };

  private onRemovePortal = () => {
    this.removePortal();
    this.cleanup?.();

    this.removeEventListener("transitionstart", this.onTransitionStart);
    this.removeEventListener("transitionend", this.onRemovePortal);

    this.transitionInProgress = false;
  };

  /**
   * Hide the popover.
   */
  public hide() {
    this.addEventListener("transitionstart", this.onTransitionStart, {
      once: true,
    });

    // disable the portal (blur), to start the transition
    if (this.portal instanceof PopoverPortal) {
      this.portal.disable();
    }

    // wait for transitions to start before removing portal
    setTimeout(() => {
      if (!this.transitionInProgress) {
        this.onRemovePortal();
      }
      // if it started, it will end at some point, right? :)
    }, 150);
  }

  // disabled imidate placemnt of portal
  public override autoplace = false;

  connectedCallback(): void {
    super.connectedCallback();

    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = `
      <style>
        ::slotted(*) {
          display: none !important;
        }
      </style>
      <slot></slot>
    `;
  }

  disconnectedCallback(): void {
    // overwrite default removePortal, to respect transitions to play
    this.hide();
  }
}

export class Tooltip extends Popover {
  protected override portalGun() {
    const ele = document.createElement("div");
    ele.style.position = "fixed";
    ele.style.top = "0px";
    ele.style.left = "0px";
    ele.style.zIndex = "10000000";
    ele.className = this.className;
    ele.dataset.portal = this.portalId;
    ele.setAttribute("tooltip", "");
    requestAnimationFrame(() => {
      ele.setAttribute("enabled", "");
    });
    return ele;
  }
}

/**
 * A wrapper element that shows content when the user clicks with the slotted input element.
 * Calls `.show()` on the target when the trigger is clicked.
 * Calls `.hide()` on the target when the trigger is clicked outside of the popover.
 *
 * TODO: Generalized a-trigger. So it can be used for lightbox and other overlays.
 *
 * @customEvent show - Fired when the popover is shown.
 * @customEvent hide - Fired when the popover is hidden.
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
 * </a-popover-trigger>
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

  /**
   * The time in milliseconds to wait before showing the popover.
   */
  @property({ type: Number })
  public showdelay = 750;

  /**
   * The time in milliseconds to wait before hiding the popover.
   */
  @property({ type: Number })
  public hidedelay = 250;

  public static styles = css`
    :host {
      display: inline-block;
      transition-property: all;
    }

    ::slotted([slot="trigger"]) {
      touch-action: none;
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

    let lastPointerType: string | undefined;

    new ElementEventListener(this, window, "click", (e) => {
      if (this.isContent(this.content)) return;

      const content = this.content?.children[0];

      if (
        this.opened &&
        !this.contains(e.target as Node) &&
        !content?.contains(e.target as Node)
      ) {
        this.hide();
      }
    });

    this.addEventListener("click", (e) => {
      if (this.content instanceof Tooltip) return; // not tooltip

      if (this.trigger?.contains(e.target as Node)) {
        this.toggle();
      }
    });

    // Tooltip integration

    let hoverTimeout: ReturnType<typeof setTimeout>;

    this.addEventListener("pointerover", (e) => {
      lastPointerType = e.pointerType;

      if (lastPointerType !== "mouse") return;

      if (!(this.content instanceof Tooltip)) return;

      const content = this.content?.children[0];

      if (
        this.trigger?.contains(e.target as Node) ||
        content?.contains(e.target as Node)
      ) {
        clearTimeout(hoverTimeout);
        hoverTimeout = setTimeout(() => this.show(), this.showdelay);
      } else {
        clearTimeout(hoverTimeout);
        hoverTimeout = setTimeout(() => this.hide(), this.hidedelay);
      }
    });

    this.addEventListener("pointerleave", (e) => {
      lastPointerType = e.pointerType;

      if (lastPointerType !== "mouse") return;

      if (!(this.content instanceof Tooltip)) return;

      const content = this.content?.children[0];

      if (
        this.trigger?.contains(e.target as Node) ||
        content?.contains(e.target as Node)
      ) {
        clearTimeout(hoverTimeout);
        hoverTimeout = setTimeout(() => this.show(), this.showdelay);
      } else {
        clearTimeout(hoverTimeout);
        hoverTimeout = setTimeout(() => this.hide(), this.hidedelay);
      }
    });

    this.addEventListener("contextmenu", (e) => {
      // longpress to show tooltip
      if (lastPointerType !== "touch") return;

      e.preventDefault();

      clearTimeout(hoverTimeout);
      hoverTimeout = setTimeout(() => this.show(), this.showdelay);
    });

    this.addEventListener(
      "focus",
      (e) => {
        if (!(this.content instanceof Tooltip)) return;
        if (!this.trigger?.contains(e.target as Node)) return;

        clearTimeout(hoverTimeout);
        hoverTimeout = setTimeout(() => this.show(), this.showdelay);
      },
      {
        capture: true,
      },
    );

    this.addEventListener(
      "blur",
      (e) => {
        if (!(this.content instanceof Tooltip)) return;
        if (this.trigger?.contains(document.activeElement)) return;

        clearTimeout(hoverTimeout);
        this.hide();
      },
      {
        capture: true,
      },
    );
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

  protected isContent(
    element?: Element & {
      show?: () => void;
      hide?: () => void;
    },
  ) {
    if (element?.show instanceof Function && element?.hide instanceof Function) {
      return element as {
        show: () => void;
        hide: () => void;
      };
    }
    return undefined;
  }

  /**
   * Show the inner popover.
   */
  public show() {
    this.opened = true;

    this.isContent(this.content)?.show();

    this.trigger?.setAttribute("aria-haspopup", "dialog");
    this.trigger?.setAttribute("aria-expanded", "true");

    this.dispatchEvent(new CustomEvent("show"));
  }

  /**
   * Closes the inner popover.
   */
  public hide() {
    this.opened = false;

    this.isContent(this.content)?.hide();

    this.trigger?.setAttribute("aria-haspopup", "dialog");
    this.trigger?.setAttribute("aria-expanded", "false");

    this.dispatchEvent(new CustomEvent("hide"));
  }

  /**
   * Toggles the inner popover.
   */
  public toggle() {
    this.opened ? this.hide() : this.show();
  }

  protected updated(): void {
    if (this.trigger) {
      this.trigger.ariaHasPopup = "dialog";
      this.trigger.ariaExpanded = this.opened ? "true" : "false";
    }
  }
}

export class PopoverArrow extends LitElement {
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

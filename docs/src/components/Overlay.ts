import { Blur } from "@sv/elements/blur";
import { Portal } from "@sv/elements/portal";
import { css, html, LitElement } from "lit";
import { property, query } from "lit/decorators.js";
import { ScrollLock } from "@sv/scroll-lock";

const overlayRegistry = new Map<string, OverlayElement>();

class OverlayBlurElement extends Blur {
  public override scrolllock = true;

  public override lock = new ScrollLock({
    allowElements: ["a-overlay-blur *"],
  });

  static override styles = css`
    :host {
      display: block;
      transition-property: all;
      pointer-events: none;
      position: fixed;
      top: 0px;
      left: 0px;
      width: 100%;
      height: 100%;
      z-index: 100;
    }

    :host([enabled]) {
      pointer-events: all !important;
    }

    :host(:not([enabled])) .container {
      pointer-events: none !important;
      opacity: 0 !important;
    }

    .container {
      transition: opacity 0.2s ease;
      opacity: 1;
      background: rgba(0, 0, 28, 0.6);
      backdrop-filter: blur(8px);
      position: relative;
      width: 100%;
      height: 100%;
    }
  `;

  protected override render() {
    return html`
      <div class="container">
        <slot></slot>
      </div>
    `;
  }
}

/**
 * A wrapper element that shows content when the user clicks with the slotted input element.
 *
 * @example
 * ```html
 * <a-overlay-trigger>
 *   <button type="button" slot="trigger">
 *     Label
 *   </button>
 *
 *   <a-overlay>
 *     <div>Content</div>
 *   </a-overlay>
 * </a-overlay-trigger>
 * ```
 */
export class OverlayTriggerElement extends LitElement {
  /**
   * Wether the content is shown or not.
   */
  @property({ type: Boolean, reflect: true })
  public opened = false;

  public static override styles = css`
    :host {
      display: inline-block;
      transition-property: all;
    }
  `;

  @query(".trigger") input?: HTMLSlotElement;
  @query(".target") targetSlot?: HTMLSlotElement;

  override render() {
    return html`
      <slot class="trigger" name="trigger"></slot>
      <slot class="target"></slot>
    `;
  }

  override connectedCallback(): void {
    super.connectedCallback();

    // TODO: listen for mutations (slotchange)
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

  private get target() {
    const id = this.trigger?.getAttribute("aria-controls");
    return id ? overlayRegistry.get(id) : undefined;
  }

  private get trigger() {
    // Note: slot.assignedNodes() would be better, but it's not supported within our test runner
    for (const element of this.children) {
      // default slot
      if (!element.slot) return element;
    }
    return undefined;
  }

  /**
   * Show the inner popover.
   */
  public show() {
    this.opened = true;

    if (this.target instanceof OverlayElement) {
      this.target.show();

      this.target.addEventListener(
        "exit",
        () => {
          this.close();
        },
        {
          once: true,
        },
      );
    }

    this.trigger?.setAttribute("aria-haspopup", "dialog");
    this.trigger?.setAttribute("aria-expanded", "true");
  }

  /**
   * Closes the inner popover.
   */
  public close() {
    this.opened = false;

    if (this.target instanceof OverlayElement) {
      this.target.hide();
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

  protected override updated(): void {
    if (this.trigger) {
      this.trigger.ariaHasPopup = "dialog";
      this.trigger.ariaExpanded = this.opened ? "true" : "false";
    }
  }
}

/**
 * A lightbox element.
 *
 * @example
 * ```html
 * <a-overlay>
 *   <div>Content</div>
 * </a-overlay>
 * ```
 */
export class OverlayElement extends Portal {
  protected override portalGun() {
    const element = new OverlayBlurElement();
    element.className = this.className;
    element.dataset.portal = this.portalId;
    // Lightbox has to contain a focusable element, for focus management to work
    // element.tabIndex = 0;
    // TODO: make this nicer:
    // @ts-ignore
    element.portal = this;
    return element;
  }

  constructor() {
    super();

    this.addEventListener("exit", (e) => {
      const trigger = this.closest("a-overlay-trigger");
      if (e instanceof CustomEvent) {
        trigger?.close();
      }
    });
  }

  connectedCallback() {
    super.connectedCallback();

    if (this.id) {
      overlayRegistry.set(this.id, this);
    }
  }

  /**
   * Show the lightbox.
   */
  public show() {
    // TODO: why does the focus, not work in the same frame?
    requestAnimationFrame(() => {
      if (this.portal instanceof OverlayBlurElement) {
        this.portal.enable();

        document.querySelector(".root")?.classList.add("blurred");

        // @ts-ignore
        const elements = this.portal?.focusableElements();
        elements[0]?.focus();
      }
    });
  }

  /**
   * Hide the lightbox.
   */
  public hide() {
    if (this.portal instanceof OverlayBlurElement) {
      this.portal.disable();

      document.querySelector(".root")?.classList.remove("blurred");
    }
  }
}

// define global interface for typescript check
declare global {
  interface HTMLElementTagNameMap {
    "a-overlay-trigger": OverlayTriggerElement;
    "a-overlay-blur": OverlayBlurElement;
    "a-overlay": OverlayElement;
  }
}

if (!customElements.get("a-overlay-blur")) {
  customElements.define("a-overlay-blur", OverlayBlurElement);
}

if (!customElements.get("a-overlay-trigger")) {
  customElements.define("a-overlay-trigger", OverlayTriggerElement);
}

if (!customElements.get("a-overlay")) {
  customElements.define("a-overlay", OverlayElement);
}

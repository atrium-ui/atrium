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
import { computePosition, autoUpdate, autoPlacement, shift } from "@floating-ui/dom";

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

class PopoverPortal extends Blur {
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

customElements.define("a-popover-portal", PopoverPortal);

class Popover extends Portal {
  protected portalGun() {
    const ele = document.createElement("a-popover-portal");
    ele.className = this.className;
    ele.dataset.portal = this.portalId;
    return ele as PopoverPortal;
  }

  private cleanup?: () => void;

  connectedCallback(): void {
    super.connectedCallback();

    this.addEventListener("blur", (e) => {
      const trigger = this.closest("a-popover-trigger");
      if (e instanceof CustomEvent) {
        trigger?.close();
      }
    });
  }

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
          ],
        }).then(({ x, y }) => {
          if (content) content.style.transform = `translate(${x}px, ${y}px)`;
        });
    });

    if (this.children[0]) {
      this.children[0].role = "dialog";
    }

    if (this.portal instanceof PopoverPortal) {
      this.portal.enable();
    }
  }

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

customElements.define("a-popover", Popover);

/**
 * A wrapper element that shows content when the user clicks with the slotted input element.
 *
 * @example
 * ```html
 * <a-popover-trigger>
 *   <button type="button" slot="input">
 *     Label
 *   </button>
 *
 *   <a-popover>
 *     <div>Content</div>
 *   </a-popover-content>
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
      <slot
        class="trigger"
        name="input"
        @click=${() => this.toggle()}>
      </slot>
      <slot class="content"></slot>
    `;
  }

  private get portal() {
    return this.contentSlot?.assignedElements()[0];
  }

  private get trigger() {
    return (this.input?.assignedElements()[0] as HTMLButtonElement) || undefined;
  }

  private clickFallback = new ElementEventListener(this, window, "click", (e) => {
    if (this.portal instanceof Popover) return;

    if (this.opened && !this.contains(e.target)) {
      this.close();
    }
  });

  public show() {
    this.opened = true;

    if (this.portal instanceof Popover) {
      this.portal.show();
    }
  }

  public close() {
    this.opened = false;

    if (this.portal instanceof Popover) {
      this.portal.hide();
    }
  }

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

customElements.define("a-popover-trigger", PopoverTrigger);

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
    "a-popover-content": PopoverContent;
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

class PopoverContent extends Portal {
  protected portalGun() {
    const ele = document.createElement("a-popover-portal");
    ele.className = this.className;
    ele.dataset.portal = this.portalId;
    return ele as PopoverPortal;
  }

  connectedCallback(): void {
    super.connectedCallback();

    this.addEventListener("blur", (e) => {
      const popover = this.closest("a-popover");
      if (e instanceof CustomEvent) {
        popover?.close();
      }
    });
  }
}

customElements.define("a-popover-content", PopoverContent);

/**
 * A wrapper element that shows content when the user clicks with the slotted input element.
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
    return this.contentSlot?.assignedElements()[0] as
      | PopoverContent
      | HTMLElement
      | undefined;
  }

  private get content() {
    return this.portal?.children[0] as HTMLElement | undefined;
  }

  private get trigger() {
    return (this.input?.assignedElements()[0] as HTMLButtonElement) || undefined;
  }

  private cleanup?: () => void;

  public show() {
    this.opened = true;

    if (
      this.portal instanceof PopoverContent &&
      this.portal?.portal instanceof PopoverPortal
    ) {
      this.portal.portal.enable();
    }

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
        }).then(({ x, y }) => {
          if (this.content) this.content.style.transform = `translate(${x}px, ${y}px)`;
        });
    });
  }

  private clickFallback = new ElementEventListener(this, window, "click", (e) => {
    if (this.portal instanceof PopoverContent) return;

    if (this.opened && !this.contains(e.target)) {
      this.close();
    }
  });

  public close() {
    this.opened = false;
    this.cleanup?.();

    if (
      this.portal instanceof PopoverContent &&
      this.portal?.portal instanceof PopoverPortal
    ) {
      this.portal.portal.disable();
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
    if (this.content) {
      this.content.role = "dialog";
    }
  }
}

customElements.define("a-popover", Popover);

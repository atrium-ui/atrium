import { HTMLTemplateResult, LitElement, css, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { ScrollLock } from "@sv/scroll-lock";

declare global {
  interface HTMLElementTagNameMap {
    "a-blur": Blur;
  }
}

/**
 * # a-blur
 *
 * - A Blur is a wrapper element which can show and hide its children.
 * - It will automatically "blur" (hide) the content, when clicked outside of its children.
 * - Optionally, when the content is shown, scrolling will be locked.
 *
 * ## Props
 *
 * @attribute enabled (default: false) - Whether the blur is enabled or not.
 * @attribute scrollLock (default: false) - Whether the blur should lock scrolling when shown.
 *
 * @example
 * ```html
 * <a-blur>
 * 	<div>
 * 		<h1>Modal</h1>
 * 		<p>Click outside of this modal to close it.</p>
 * 	</div>
 * </a-blur>
 * ```
 *
 * @see https://sv.pages.s-v.de/sv-frontend-library/mono/elements/a-blur/
 */
@customElement("a-blur")
export class Blur extends LitElement {
  public static styles = css`
    :host {
      display: block;
      transition-property: all;
      pointer-events: none;
    }

    :host([enabled]) {
      pointer-events: all;
    }
  `;

  /**
   * ### enabled
   * Whether the blur is enabled or not.
   * @defaultValue false
   */
  @property({ type: Boolean, reflect: true })
  public enabled = false;

  /**
   * ### scrollLock
   * Whether the blur should lock scrolling when shown.
   * @defaultValue false
   */
  @property({ type: Boolean, reflect: true })
  public scrollLock = true;

  scrollLockControl = new ScrollLock({
    allowElements: ["a-blur > *"],
  });

  tryLock() {
    if (this.scrollLock) {
      this.scrollLockControl.enable();
    }
  }

  tryUnlock() {
    if (this.scrollLock) {
      this.scrollLockControl.disable();
    }
  }

  @query("slot")
  slot;

  protected updated(): void {
    if (this.enabled) {
      this.tryLock();
      this.setAttribute("aria-hidden", "false");
    } else {
      this.tryUnlock();
      this.setAttribute("aria-hidden", "true");
    }
  }

  shouldBlur(e: MouseEvent) {
    if (e.target === this && this.contains(e.target as HTMLElement)) {
      return this.enabled;
    }
    return false;
  }

  handleClick = (e: MouseEvent) => {
    if (this.shouldBlur(e)) {
      this.dispatchEvent(new Event("blur"));
      this.enabled = false;
    }
  };

  handleCloseEvent = (e: Event) => {
    this.enabled = false;
  };

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener("mousedown", this.handleClick);
    this.addEventListener("close", this.handleCloseEvent, { capture: true });
  }

  disconnectedCallback(): void {
    this.removeEventListener("mousedown", this.handleClick);
    this.removeEventListener("close", this.handleCloseEvent, { capture: true });

    // TODO: This call should be on a stack.
    //				So that if multiple blur elements are enabled, it only disables when all are disabled.
    this.tryUnlock();
  }

  render(): HTMLTemplateResult {
    return html`<slot></slot>`;
  }
}

import { LitElement, css, html } from "lit";

/**
 * A feed of toast elements. Handles the positioning and animations of the toasts.
 *
 * @example
 * ```tsx
 * import "@sv/elements/toast";
 *
 * <a-portal>
 *   <a-toast-feed class="fixed right-12 bottom-12 text-base" />
 * </a-portal>
 * ```
 *
 * @see https://svp.pages.s-v.de/atrium/elements/a-toast/
 */
export class ToastFeed extends LitElement {
  static instance: ToastFeed | null = null;
  observer: MutationObserver;

  static get styles() {
    return css`
      :host {
        display: block;
        --transition-duration: 0.5s;
        --transition-timing-function: ease;
      }

      .add-toast-transition
      {
        transition: transform var(--transition-duration) var(--transition-timing-function);
      }
    `;
  }

  static getInstance() {
    if (!ToastFeed.instance) {
      ToastFeed.instance = new ToastFeed();
    }
    return ToastFeed.instance;
  }

  constructor() {
    super();
    ToastFeed.instance = this;
    this.observer = new MutationObserver((mutations) => this.handleMutations(mutations));
  }

  connectedCallback() {
    super.connectedCallback();
    this.startObserving();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.stopObserving();
  }

  startObserving() {
    const config = { childList: true, subtree: true };
    this.observer.observe(this, config);
  }

  stopObserving() {
    this.observer.disconnect();
  }

  firstUpdated() {
    this.element?.addEventListener("transitionend", () => {
      if (this.element) {
        this.element.classList.remove("add-toast-transition");
      }
    });
  }

  handleMutations(mutations) {
    for (const mutation of mutations) {
      if (mutation.type === "childList") {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (!this.element) return;
            const element = this.element;
            requestAnimationFrame(() => {
              element.style.transform = `translateY(${node.clientHeight}px)`;
              requestAnimationFrame(() => {
                element.classList.add("add-toast-transition");
                element.style.transform = "translateY(0px)";
              });
            });
          }
        }
      }
    }
  }

  get element() {
    return this.shadowRoot?.children[0] as HTMLElement;
  }

  protected render() {
    return html`<div><slot></slot></div>`;
  }
}

/**
 * Options for the toast.
 */
export interface ToastOptions {
  /**
   * The message to display. Will be overwritten by slotted content.
   */
  message?: string;
  /**
   * Time in milliseconds to display the toast for..
   */
  time?: number;
  /**
   * Called when the toast is clicked.
   */
  onClick?: (event: MouseEvent) => void;
}

/**
 * A single toast element.
 *
 * @customEvent killed - Fires when the toast is killed.
 *
 * @example
 * ```tsx
 * import "@sv/elements/toast";
 *
 * // create a toas and keep a reference to it
 * const toast = new Toast({ message: "A Message" });
 * const feed = ToastFeed.getInstance(); // the a-toast-feed element
 * feed?.append(toast);
 *
 * // optionally slot any content into the toast
 * toast.innerHTML = `
 *  <span>Custom HTML content</span>
 * `;
 * ```
 *
 * @see https://svp.pages.s-v.de/atrium/elements/a-toast/
 */
export class Toast extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block;
        position: relative;
        transition: opacity .5s ease, transform .5s ease, height 0.5s ease, padding 0.5s ease, margin 0.5s ease;
        overflow: hidden;
        margin: 4px 0 0 0;
        min-width: 220px;
        max-width: 500px;
      }

      :host(:hover) {
        filter: brightness(0.98);
      }

      :host(:active) {
        filter: brightness(0.95);
      }

      .default-container {
        padding: 10px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 2px, 8px, 0.07);
        background: rgb(39 39 42 / 1);
        border: 1px solid rgb(24 24 27 / 1);
        margin: 4px 0 0 0;
      }
    `;
  }

  message?: string;
  time?: number;

  constructor(options: ToastOptions) {
    super();

    this.message = options?.message;
    this.time = options?.time;

    this.addEventListener("click", (e) => {
      options.onClick?.(e);

      if (e.defaultPrevented) return;

      setTimeout(() => this.kill(), 100);
    });
  }

  connectedCallback(): void {
    super.connectedCallback();

    if (this.time !== undefined && this.time > 0) {
      setTimeout(() => this.kill(), this.time);
    }
  }

  /**
   * Kills the toast and removes it from the DOM.
   */
  public kill() {
    this.style.height = `${this.offsetHeight}px`;
    this.offsetHeight; // trigger reflow

    this.style.transform = "translateY(10px)";
    this.style.height = "0px";
    this.style.paddingTop = "0";
    this.style.paddingBottom = "0";
    this.style.marginTop = "0";
    this.style.marginBottom = "0";
    this.style.opacity = "0";

    this.ontransitionend = (e) => {
      if (e.propertyName !== "height") return;
      this.remove();
      this.dispatchEvent(new CustomEvent("killed"));
    };
  }

  protected render() {
    return html`
      <slot>
        <div class="default-container">
          <span>${this.message}</span>
        </div>
      </slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "a-toast-feed": ToastFeed;
    "a-toast": Toast;
  }
}

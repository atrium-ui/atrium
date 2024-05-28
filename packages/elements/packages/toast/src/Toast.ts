import { LitElement, css, html } from "lit";

export interface ToastOptions {
  message?: string;
  time?: number;
}

export function toast(options: ToastOptions) {
  const toast = new Toast(options);
  const feed = ToastFeed.getInstance();
  const ele = document.createElement("div");
  ele.style.margin = "4px 0";
  ele.append(toast);
  feed?.append(ele);
  return toast;
}

/**
 * A feed of toast elements
 *
 * @example
 * ```tsx
 * import { toast } from "@sv/elements/toast";
 *
 * <a-toast-feed />
 *
 * toast({
 *   message: "Hello, world!"
 *   time: 5000
 * })
 * ```
 *
 * @see https://svp.pages.s-v.de/atrium/elements/a-toast/
 */
export class ToastFeed extends LitElement {
  static instance: ToastFeed | null = null;

  static get styles() {
    return css`
      :host {
        display: block;
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
  }

  protected render() {
    return html`<slot></slot>`;
  }
}

/**
 * A single toast
 *
 * @example
 * ```tsx
 * import "@sv/elements/toast";
 *
 * <a-toast>
 *   <span>A Message</span>
 * <a-toast>
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
        transition: opacity .5s ease, transform .5s ease, height 0.75s ease;
        cursor: pointer;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 2px, 8px, 0.07);
        padding: 10px 24px;
        background: rgb(39 39 42 / 1);
        border: 1px solid rgb(24 24 27 / 1);
        min-height: 40px;
        min-width: 220px;
        max-width: 400px;
        animation: slide-in 0.5s ease;
        box-sizing: border-box;
        margin: 4px 0 0 0;
        overflow: hidden;
      }

      :host(:hover) {
        filter: brightness(0.98);
      }

      :host(:active) {
        filter: brightness(0.95);
      }

      @keyframes slide-in {
        from {
          opacity: 0;
          transform: translateY(40px);
        }
      }
    `;
  }

  message?: string;
  time?: number;

  constructor(options: ToastOptions) {
    super();

    this.message = options?.message;
    this.time = options?.time ?? 2000;

    this.addEventListener("click", () => {
      setTimeout(() => {
        this.kill();
      }, 100);
    });
  }

  connectedCallback(): void {
    super.connectedCallback();

    if (this.time) {
      setTimeout(() => this.kill(), this.time);
    }
  }

  kill() {
    this.style.transform = "translateY(10px)";
    this.style.opacity = "0";

    setTimeout(() => this.remove(), 500);
  }

  protected render() {
    return html`
      <div>
        <span>${this.message}</span>
      </div>
      <slot></slot>
    `;
  }
}

if (typeof window !== "undefined") {
  customElements.define("a-toast-feed", ToastFeed);
  customElements.define("a-toast", Toast);
}

declare global {
  interface HTMLElementTagNameMap {
    "a-toast-feed": ToastFeed;
    "a-toast": Toast;
  }
}

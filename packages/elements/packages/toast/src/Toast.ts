import { LitElement, css, html } from "lit";

let instance: ToastFeed | null = null;

/**
 * A feed of toast elements
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
export class ToastFeed extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block;
      }
    `;
  }

  constructor() {
    super();
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    instance = this;
  }

  protected render() {
    return html`
      <div>
        <slot></slot>
      </div>
    `;
  }

  static getInstance() {
    if (!instance) {
      instance = new ToastFeed();
    }
    return instance;
  }
}

const log: Toast[] = [];

export class Toasts {
  private static push(notification: Toast) {
    const feed = ToastFeed.getInstance();
    if (feed) {
      feed?.append(notification);
      log.unshift(notification);
      return notification;
    }

    return;
  }

  static info(message: string) {
    Toasts.push(
      new Toast({
        message: `${message}`,
        time: 3000,
      }),
    );
  }

  static error(message: string) {
    Toasts.push(
      new ToastError({
        message: `Error: ${message}`,
        time: 3000,
      }),
    );
  }
}

interface NotificationOptions {
  message?: string;
  time?: number;
}

export class Toast extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block;
        position: relative;
        font-size: 14px;
        line-height: 100%;
        color: #eee;
        transition: opacity 1s ease, height 0.75s ease;
        cursor: default;
      }

      :host(:hover) .wrapper {
        filter: brightness(0.98);
      }

      :host(:active) .wrapper {
        filter: brightness(0.95);
      }

      .wrapper {
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 2px, 8px, 0.07);
        padding: 6px 18px;
        background: rgb(39 39 42 / 1);
        border: 1px solid rgb(24 24 27 / 1);
        min-height: 40px;
        min-width: 220px;
        display: flex;
        align-items: center;
        animation: slide-in 0.5s ease;
        box-sizing: border-box;
        margin-bottom: 5px;
        z-index: -1;
      }

      @keyframes slide-in {
        from {
          opacity: 0;
          transform: translateY(-40px);
        }
      }
    `;
  }

  message?: string;
  time?: number;

  constructor(options: NotificationOptions) {
    super();

    this.message = options.message;
    this.time = options.time;

    this.addEventListener("click", () => {
      setTimeout(() => {
        this.kill();
      }, 100);
    });
  }

  connectedCallback(): void {
    super.connectedCallback();

    if (this.time) {
      setTimeout(() => {
        this.kill();
      }, this.time);
    }
  }

  kill() {
    this.style.height = `${this.offsetHeight + 5}px`;

    this.offsetHeight;

    this.style.opacity = "0";
    this.style.height = "0px";

    setTimeout(() => {
      this.remove();
    }, 1000);
  }

  protected render() {
    return html`
      <div class="wrapper">
        <span>${this.message}</span>
        <slot></slot>
      </div>
    `;
  }
}

export class ToastError extends Toast {
  static get styles() {
    return css`
      ${Toast.styles}

      span {
        display: flex;
        align-items: center;
      }

      .wrapper {
        justify-content: space-between;
        background: #f44040;
        color: white;
      }

      .icon {
        display: inline-block;
        margin-right: 8px;
        margin-bottom: -1px;
        margin-left: -5px;
        flex: none;
      }
    `;
  }

  protected render() {
    return html`
      <div class="wrapper">
        <span>
          <svg class="icon" width="16" height="16" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="30" stroke="white" stroke-width="4"/>
            <path d="M30.091 37.273L30.091 16L33.829 16L33.829 37.273L30.091 37.273ZM29.293 43.951C29.293 43.587 29.37 43.244 29.524 42.922C29.664 42.614 29.86 42.334 30.112 42.082C30.35 41.844 30.637 41.655 30.973 41.515C31.295 41.375 31.638 41.305 32.002 41.305C32.366 41.305 32.709 41.375 33.031 41.515C33.339 41.655 33.612 41.844 33.85 42.082C34.088 42.334 34.277 42.614 34.417 42.922C34.557 43.244 34.627 43.587 34.627 43.951C34.627 44.315 34.557 44.658 34.417 44.98C34.277 45.316 34.088 45.603 33.85 45.841C33.612 46.093 33.339 46.289 33.031 46.429C32.709 46.569 32.366 46.639 32.002 46.639C31.638 46.639 31.295 46.569 30.973 46.429C30.637 46.289 30.35 46.093 30.112 45.841C29.86 45.603 29.664 45.316 29.524 44.98C29.37 44.658 29.293 44.315 29.293 43.951Z" fill="white"/>
          </svg>

          <span>${this.message}</span>
        </span>
      </div>
    `;
  }
}

customElements.define("a-toast-feed", ToastFeed);
customElements.define("a-toast", Toast);
customElements.define("a-toast-error", ToastError);

declare global {
  interface HTMLElementTagNameMap {
    "a-toast-feed": ToastFeed;
    "a-toast": Toast;
    "a-toast-error": ToastError;
  }
}

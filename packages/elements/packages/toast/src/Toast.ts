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
 * @see https://atrium-ui.dev/elements/a-toast/
 */
export class ToastFeed extends LitElement {
  static instance: ToastFeed | null = null;

  static get styles() {
    return css`
      :host {
        display: block;
        --transition-duration: 0.5s;
        --transition-timing-function: ease;
      }
      .add-toast-transition {
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
  }

  handleSlotChange() {
    //
  }

  protected render() {
    return html`<div><slot @slotchange="${this.handleSlotChange}"></slot></div>`;
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
 * @see https://atrium-ui.dev/elements/a-toast/
 */
export class Toast extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block;
        position: relative;
        transition: opacity .5s ease, height 0.5s ease, margin 0.5s ease, transform 0.5s ease;
        min-width: 220px;
        max-width: 500px;
        margin-top: 1rem;
        margin-bottom: 1rem;
      }
    `;
  }

  message?: string;
  time?: number;

  private killed = false;

  constructor(public options: ToastOptions) {
    super();

    this.message = options?.message;
    this.time = options?.time;

    this.addEventListener("click", (e) => {
      this.options.onClick?.(e);

      if (e.defaultPrevented) return;
    });

    this.addEventListener("transitionend", (e) => {
      if (this.killed) {
        this.remove();
        this.dispatchEvent(new CustomEvent("killed"));
        return;
      }

      this.style.height = "";
    });

    this.addEventListener("pointerdown", (event) => {
      this.start = [event.clientX, event.clientY];
      this.style.transition = "none";
    });
  }

  connectedCallback(): void {
    super.connectedCallback();

    requestAnimationFrame(() => this.onShow());

    window.addEventListener("pointerup", this.onPointerUp);
    window.addEventListener("pointermove", this.onPointerMove);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();

    window.removeEventListener("pointerup", this.onPointerUp);
    window.removeEventListener("pointermove", this.onPointerMove);
  }

  private start: [number, number] | undefined;
  private velocity: [number, number] = [0, 0];

  private onPointerUp = () => {
    this.start = undefined;

    this.style.transition = "";

    if (!this.killed) {
      this.style.transform = "";
    }
  };

  private onPointerMove = (event: PointerEvent) => {
    if (!this.start || this.killed) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const absoluteDelta = [
      event.clientX - this.start[0],
      event.clientY - this.start[1],
    ] as const;

    this.velocity[0] += event.movementX;
    this.velocity[0] *= 0.8;

    if (Math.abs(absoluteDelta[0]) > 5) {
      this.style.transform = `translateX(${absoluteDelta[0]}px)`;
    }
    if (Math.abs(this.velocity[0]) > 100) {
      this.dismiss();
    }
  };

  private onShow() {
    const height = this.offsetHeight;

    this.style.transition = "none";

    this.style.height = "0px";
    this.style.opacity = "0";
    this.style.margin = "0";
    this.offsetHeight; // trigger reflow

    this.style.transition = "";

    this.style.height = `${height}px`;
    this.style.opacity = "";
    this.style.margin = "";

    if (this.time !== undefined && this.time > 0) {
      setTimeout(() => this.kill(), this.time);
    }
  }

  public dismiss() {
    if (this.killed) return;
    this.killed = true;

    this.style.transition = "";

    this.style.opacity = "0";
  }

  /**
   * Kills the toast and removes it from the DOM.
   */
  public kill() {
    if (this.killed) return;
    this.killed = true;

    this.style.transition = "";

    this.style.height = `${this.offsetHeight}px`;
    this.offsetHeight; // trigger reflow

    this.style.margin = "0";
    this.style.height = "0px";
    this.style.opacity = "0";
  }

  protected render() {
    return html`<slot><div>${this.message}</div></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "a-toast-feed": ToastFeed;
    "a-toast": Toast;
  }
}

import { LitElement, html, css } from "lit";
import { property } from "lit/decorators.js";

const resizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    if (entry.target instanceof BoxElement) {
      entry.target.resize();
    }
  }
});

/**
 * An a-box element provides an interface to the resize events of a single element.
 * For performance reasons, it uses a single ResizeObserver to observe all a-box elements on the page.
 * Resize events are debounced by default.
 *
 * @customEvent resize - Dispatched when the element is resized.
 */
export class BoxElement extends LitElement {
  private baseDebounceTime = 25;
  private maxDebounceTime = 150;
  private debounceTime = this.baseDebounceTime;
  private timer: Timer | undefined;
  private timerResolved = false;

  /**
   * Whether to retain the size of the element while resizing.
   */
  @property({ type: Boolean }) retain = false;

  private get ele() {
    return this.shadowRoot?.children[0] as HTMLElement;
  }

  private freeze() {
    if (!this.timerResolved) return;
    if (!this.retain) return;

    this.ele.style.width = `${this.offsetWidth}px`;
    this.ele.style.height = `${this.offsetHeight}px`;
    this.style.overflow = "hidden";
  }

  private reset() {
    this.ele.style.width = "";
    this.ele.style.height = "";
    this.style.overflow = "";
    this.debounceTime = this.baseDebounceTime;
  }

  /**
   * Called for a resize event.
   */
  public resize() {
    this.freeze();

    if (this.timer) {
      this.debounceTime = Math.min(this.debounceTime + 2, this.maxDebounceTime);

      clearTimeout(this.timer);
      this.timerResolved = false;
    } else {
      this.onResize();
      this.timerResolved = true;
    }

    const timer = setTimeout(() => {
      this.timer = undefined;
      if (!this.timerResolved) {
        this.onResize();
      }
    }, this.debounceTime);

    this.timer = timer;
  }

  private onResize() {
    this.reset();

    const ev = new CustomEvent("resize", { cancelable: true });
    this.dispatchEvent(ev);
  }

  connectedCallback() {
    super.connectedCallback();
    resizeObserver.observe(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    resizeObserver.unobserve(this);
  }

  static styles = css`
    :host {
      display: block;
    }
    slot {
      display: block;
      width: 100%;
      height: 100%;
    }
  `;

  render() {
    return html`<slot></slot>`;
  }
}

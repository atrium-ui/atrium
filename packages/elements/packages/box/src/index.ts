import { LitElement, html, css } from "lit";

const boxes = new Set<BoxElement>();

let eventCount = 0;
let eventCountResolved = 0;

const resizeObserver = new ResizeObserver((entries) => {
  eventCount++;
  console.debug("resize");

  for (const entry of entries) {
    if (entry.target instanceof BoxElement) {
      entry.target.resize();
    }
  }
});

class BoxElement extends LitElement {
  private baseDebounceTime = 25;
  private maxDebounceTime = 250;
  private debounceTime = this.baseDebounceTime;
  private timer: Timer | undefined;
  private timerResolved = false;

  private get ele() {
    return this.shadowRoot?.children[0] as HTMLElement;
  }

  private lock() {
    if (!this.timerResolved) return;

    this.ele.style.width = `${this.offsetWidth}px`;
    this.ele.style.height = `${this.offsetHeight}px`;
    this.ele.style.backgroundColor = "red";
    this.style.overflow = "hidden";
  }

  private unlock() {
    this.ele.style.width = "";
    this.ele.style.height = "";
    this.style.overflow = "";
    this.ele.style.backgroundColor = "";
    this.debounceTime = this.baseDebounceTime;
  }

  public resize() {
    // TODO: lock dimensions
    this.lock();

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
    this.unlock();

    eventCountResolved++;

    // TODO: free dimensions
    const ev = new CustomEvent("resize", { cancelable: true });
    this.dispatchEvent(ev);

    console.debug(
      100 - Math.floor((eventCountResolved / eventCount) * 100),
      "% events saved",
    );
  }

  connectedCallback() {
    super.connectedCallback();
    boxes.add(this);
    resizeObserver.observe(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    boxes.delete(this);
    resizeObserver.unobserve(this);
  }

  static styles = css`
    :host {
      display: block;
    }
  `;

  render() {
    return html`<div><slot></slot></div>`;
  }
}

customElements.define("a-box", BoxElement);

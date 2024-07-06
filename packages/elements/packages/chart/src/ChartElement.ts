import { Chart, BarController, BarElement, CategoryScale, LinearScale } from "chart.js";
import {
  LitElement,
  css,
  html,
  type HTMLTemplateResult,
  type PropertyValueMap,
} from "lit";

declare global {
  interface HTMLElementTagNameMap {
    "a-chart": ChartElement;
  }
}

Chart.register(BarController, BarElement, CategoryScale, LinearScale);

/**
 * A Chart with data loaded from a URL
 *
 * @customEvent load - Emitted when the chart has loaded.
 *
 * @example
 * ```html
 * <a-chart
 *   height="200"
 *   width="200"
 *   src="./data.json"
 * />
 * ```
 *
 * @see https://svp.pages.s-v.de/atrium/elements/a-chart/
 */
export class ChartElement extends LitElement {
  public static styles = css`
    :host {
      display: inline-block;
    }
    canvas {
      display: block;
      width: inherit;
      height: inherit;
      max-width: 100%;
      max-height: 100%;
    }
  `;

  protected render(): HTMLTemplateResult {
    return html`${this.canvas}`;
  }

  static properties = {
    src: { type: String, reflect: true },
    type: { type: String, reflect: true },
    width: { type: Number, reflect: true },
    height: { type: Number, reflect: true },
  };

  constructor() {
    super();

    this.width = 300;
    this.height = 150;
  }

  private intersectionObserver?: IntersectionObserver;

  connectedCallback(): void {
    super.connectedCallback();

    if (!this.intersectionObserver) {
      this.intersectionObserver = new IntersectionObserver((intersetions) => {
        for (const intersetion of intersetions) {
          this.paused = !intersetion.isIntersecting;
          if (this.paused === false) {
            this.tryLoad(this.src);
          }
        }
      });
    }
    this.intersectionObserver.observe(this);

    window.addEventListener("beforeunload", this.cleanup);
  }

  disconnectedCallback(): void {
    this.intersectionObserver?.disconnect();

    window.removeEventListener("beforeunload", this.cleanup);

    super.disconnectedCallback();
  }

  //
  // Puplic interface

  /** url to daata */
  public declare src?: string;

  /** chart type */
  public declare type?: "bar";

  /** width in pixel */
  public declare width: number;

  /** height in pixel */
  public declare height: number;

  public chart?: Chart;

  //
  // Internals

  private canvas: HTMLCanvasElement = document.createElement("canvas");

  private loaded = false;
  private paused = true;

  private format() {
    // force density of 2, just looks better multisampled
    const ratio = Math.max(devicePixelRatio || 2, 2);

    this.canvas.width = this.width * ratio;
    this.canvas.height = this.height * ratio;
  }

  protected firstUpdated(): void {
    this.format();
    this.tryLoad(this.src);
  }

  protected updated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>,
  ): void {
    if (_changedProperties.has("src") && this.src) {
      this.tryLoad(this.src);
    }
  }

  private async tryLoad(src?: string) {
    if (this.paused) return;

    if (this.loaded) {
      // cleanup and reinit
      this.cleanup();
    }

    if (!src) {
      return;
    }

    fetch(src)
      .then((res) => res.json())
      .then((data) => {
        this.chart = new Chart(this.canvas, {
          type: this.type,
          data: data,
        });

        this.dispatchEvent(new CustomEvent("load"));
      });
  }

  public cleanup = () => {};
}

customElements.define("a-chart", ChartElement);

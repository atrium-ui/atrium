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
 * A simple chart with data loaded from a URL and styleable with CSS.
 *
 * @customEvent load - Emitted when the chart has loaded.
 *
 * @example
 * ```html
 * <a-chart
 *   type="bar"
 *   width="600"
 *   height="300"
 *   class="h-[300px] aspect-[2/1] text-black stroke-black/5 dark:stroke-white/5 dark:text-white"
 *   src="/atrium/chart-data.json"
 * />
 * ```
 *
 * @see https://svp.pages.s-v.de/atrium/elements/a-chart/
 */
export class ChartElement extends LitElement {
  public static styles = css`
    :host {
      display: inline-block;
      stroke: #e9e9e9;
    }

    @media (prefers-color-scheme: dark) {
   	  :host {
    		stroke: #454545;
     	}
    }

    canvas {
      display: block;
      width: inherit;
      height: inherit;
      max-width: 100%;
      max-height: 100%;
      color: inherit;
      border-color: inherit;
    }
  `;

  protected render(): HTMLTemplateResult {
    return html`${this.canvas}`;
  }

  static properties = {
    src: { type: String, reflect: true },
    type: { type: String, reflect: true, default: "bar" },
    width: { type: Number, reflect: true },
    height: { type: Number, reflect: true },
  };

  constructor() {
    super();

    this.width = 300;
    this.height = 150;
  }

  private intersectionObserver?: IntersectionObserver;

  private matchMedia?: MediaQueryList;

  connectedCallback(): void {
    super.connectedCallback();

    if (!this.intersectionObserver) {
      this.intersectionObserver = new IntersectionObserver((intersetions) => {
        for (const intersetion of intersetions) {
          this.paused = !intersetion.isIntersecting;
          this.tryLoad(this.src);
        }
      });
    }
    this.intersectionObserver.observe(this);

    this.matchMedia = window.matchMedia("(prefers-color-scheme: dark)");
    this.matchMedia.addEventListener("change", this.onChange);

    window.addEventListener("beforeunload", this.cleanup);
  }

  disconnectedCallback(): void {
    this.intersectionObserver?.disconnect();

    this.matchMedia?.removeEventListener("change", this.onChange);

    window.removeEventListener("beforeunload", this.cleanup);

    super.disconnectedCallback();
  }

  //
  // Puplic interface

  /** url to daata */
  public declare src?: string;

  /** chart type */
  public declare type: "bar";

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

  private onChange = () => {
    this.tryLoad(this.src);
  };

  /** chart.js options */
  public options() {
    const color = getComputedStyle(this.canvas).getPropertyValue("color");
    const borderColor = getComputedStyle(this.canvas).getPropertyValue("stroke");

    const scaleOptions = {
      ticks: {
        color: color,
        textStrokeColor: color,
        backdropColor: color,
      },
      grid: {
        color: borderColor,
      },
    };

    return {
      responsive: true,
      color: color,
      borderColor: borderColor,
      scales: {
        y: scaleOptions,
        x: scaleOptions,
      },
      plugins: {
        legend: {
          labels: {
            color: color,
          },
        },
      },
    };
  }

  private async tryLoad(src?: string) {
    if (!src) return;
    if (this.paused) return;

    if (this.loaded) {
      // cleanup and reinit
      this.cleanup();
    }

    fetch(src)
      .then((res) => res.json())
      .then((data) => {
        this.loaded = true;
        this.chart = new Chart(this.canvas, {
          type: this.type,
          options: this.options(),
          data,
        });

        this.dispatchEvent(new CustomEvent("load"));
      });
  }

  /** chart.js destroy */
  public cleanup = () => {
    this.chart?.destroy();
  };
}

customElements.define("a-chart", ChartElement);

import { LitElement, css, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";

declare global {
  interface HTMLElementTagNameMap {
    "a-range": Range;
  }
}

// TODO: form integration
// TODO: multi value range

/**
 * A simple range slider component for a single value.
 *
 * @example
 * ```html
 * <a-range value="0.5"></a-range>
 * ```
 *
 * @see https://svp.pages.s-v.de/atrium/elements/a-select/
 */
export class Range extends LitElement {
  static get styles() {
    return css`
      :host {
        display: inline-block;

        --range-handle-background: var(--theme-color, #bfa188);
        --range-progress-background: var(--theme-color, #bfa188);
        --range-track-background: #eee;
        --range-track-height: 0.125rem;
        --range-track-padding: 0.25rem 0;
        --range-handle-size: 0.625rem;
      }

      .range {
        outline: none;
        position: relative;
        touch-action: none;
        user-select: none;
        user-drag: none;
        cursor: pointer;
        padding: var(--range-track-padding);
        margin-right: var(--range-handle-size);
      }

      .progress {
        height: var(--range-track-height);
        position: relative;
        cursor: pointer;
      }
      .progress::before {
        content: "";
        display: block;
        width: calc(100% + var(--range-handle-size));
        height: 100%;
        background: var(--range-track-background);
        opacity: 0.5;
        border-radius: 1rem;
        margin: 0 calc(var(--range-handle-size) / -2px);
        transition: outline 0.15s ease;
        outline: solid 1px transparent;
        outline-offset: 1px;
      }
      .range:focus-visible .progress::before {
        outline-color: var(--range-outline-color);
      }
      .progress::after {
        content: "";
        display: block;
        width: calc((var(--progress) * 100%) + var(--range-handle-size));
        pointer-events: none;
        height: 100%;
        background: var(--range-progress-background);
        border-radius: 1rem;
        margin: 0 calc(var(--range-handle-size) / -2px);
        position: absolute;
        top: 0;
      }

      .handle {
        width: var(--range-handle-size);
        height: var(--range-handle-size);
        border-radius: 50%;
        background: var(--range-handle-background);
        position: absolute;
        left: calc(var(--progress) * 100% + (var(--range-handle-size) / 2));
        top: 50%;
        transform: translate(-50%, -50%);
        cursor: pointer;
      }
      .handle:hover {
        transform: translate(-50%, -50%) scale(1.02);
      }
      .handle:active {
        transform: translate(-50%, -50%) scale(0.985);
        filter: brightness(1.05);
      }
    `;
  }

  /** The current value of the range. */
  @property({ type: Number })
  public value = 0;

  public get valueAsNumber(): number {
    return this.value;
  }

  /** Minimum value of the range. */
  @property({ type: Number })
  public min = 0;

  /** Maximum value of the range. */
  @property({ type: Number })
  public max = 1;

  /** Step value of the range. */
  @property({ type: Number })
  public step = 0.01;

  /** Disabled state of the range. */
  @property({ type: Boolean })
  public disabled = false;

  @query(".progress")
  private readonly progressElement!: HTMLElement;

  private dragStartPosition: number | undefined = 0;

  private lastProgress = 0;

  protected onHandleMouseDown(event: MouseEvent): void {
    this.lastProgress = this.progress;
    this.dragStartPosition = event.clientX;
  }

  protected onMouseUp(): void {
    this.dragStartPosition = undefined;
  }

  protected onMouseMove(e: MouseEvent): void {
    if (this.dragStartPosition) {
      const deltaPixels = e.x - this.dragStartPosition;
      const rect = this.progressElement.getClientRects()[0];
      if (!rect) throw new Error("Progress element not found");

      const deltaProgress = deltaPixels / rect.width;

      const progress = Math.min(1, Math.max(this.lastProgress + deltaProgress, 0));

      this.updateProgress(progress);
      e.preventDefault();
    }
  }

  protected onProgressClick(event: MouseEvent): void {
    if ((event.target as HTMLElement)?.className === "handle") {
      return;
    }

    const rect = this.progressElement.getClientRects()[0];
    if (!rect) throw new Error("Progress element not found");

    const handleWidth = 5;
    const progress = (event.x - handleWidth - rect.x) / rect.width;
    this.updateProgress(progress);

    this.onHandleMouseDown(event);
  }

  private get progress() {
    return this.value / (this.max - this.min);
  }

  protected updateProgress(progress: number): void {
    if (this.disabled) return;

    // map progress range to value
    const value = this.min + progress * (this.max - this.min);
    this.value = Math.round(value / this.step) * this.step;

    this.dispatchEvent(new CustomEvent("input", { detail: { value: this.value } }));
  }

  protected onKeyDown(e): void {
    const ev = e as KeyboardEvent;

    switch (ev.key) {
      case "ArrowLeft":
        this.dispatchEvent(new CustomEvent("input:backward"));
        break;
      case "ArrowRight":
        this.dispatchEvent(new CustomEvent("input:forward"));
        break;
    }
  }

  connectedCallback(): void {
    super.connectedCallback();

    window.addEventListener("pointermove", this.onMouseMove.bind(this));
    window.addEventListener("pointerup", this.onMouseUp.bind(this));
    window.addEventListener("pointercancel", this.onMouseUp.bind(this));
    this.addEventListener("keydown", this.onKeyDown.bind(this));
  }

  render() {
    return html`
      <div
        style="--progress: ${this.progress}"
        class="range"
        role="slider"
        aria-valuemin=${this.min}
        aria-valuemax=${this.max}
        aria-valuenow="${this.value}"
        aria-orientation="horizontal"
        aria-disabled="${this.disabled}"
        tabindex="0"
        @mousedown="${(e) => this.onProgressClick(e)}"
      >
        <div part="track" class="progress"></div>
        <div part="handle" class="handle" @pointerdown="${(e) => this.onHandleMouseDown(e)}"></div>
      </div>
    `;
  }
}

import { css, html, LitElement, nothing } from "lit";

const SWEEP = 190;

const SWEEP_STEPS = 50;

const FINE_SCALE = 0.1;

const DRAG_SLOP = 4;

type NumberBounds = {
  readonly min: number | null;
  readonly max: number | null;

  readonly step: number;
};

type NumberScale = "linear" | "logarithmic";

export function positionOfValue(
  value: number,
  range: readonly [number, number],
  scale: NumberScale,
): number {
  const [min, max] = range;
  if (scale === "logarithmic" && min > 0 && value > 0) {
    return Math.log(value / min) / Math.log(max / min);
  }
  return (value - min) / (max - min);
}

export function valueAtPosition(
  position: number,
  range: readonly [number, number],
  scale: NumberScale,
): number {
  const [min, max] = range;
  if (scale === "logarithmic" && min > 0) {
    return min * (max / min) ** position;
  }
  return min + (max - min) * position;
}

export function stepDecimals(step: number): number {
  const fraction = String(step).split(".")[1];
  return fraction ? fraction.length : 0;
}

export function settleNumber(value: number, bounds: NumberBounds): number {
  const { min, max, step } = bounds;
  let settled = value;
  if (step > 0) {
    const from = min ?? 0;
    const grid = from + Math.round((value - from) / step) * step;

    settled = Number(grid.toFixed(stepDecimals(step)));
  }
  if (min !== null && settled < min) return min;
  if (max !== null && settled > max) return max;
  return settled;
}

const claimTouch = (event: TouchEvent): void => {
  event.preventDefault();
};

type Drag = {
  readonly pointer: number;
  readonly startX: number;

  readonly startValue: number;
  moved: boolean;
};

declare global {
  interface HTMLElementEventMap {
    "fluid-change": CustomEvent<number>;
  }
}

export class FluidInputElement extends LitElement {
  static override styles = css`
		:host {
			display: inline-flex;

			width: 60px;
			height: 24px;
			font: inherit;

			user-select: none;
			-webkit-user-select: none;

			-webkit-tap-highlight-color: transparent;
			-webkit-touch-callout: none;
		}
		.box {
			position: relative;
			flex: 1;
			min-width: 0;
			display: flex;
			align-items: center;
			justify-content: center;
			overflow: hidden;
			border: 1px solid var(--color-border);
			border-radius: 7px;
			background: var(--color-bg-subtle);
			color: var(--color-text);
			cursor: ew-resize;

			touch-action: none;
			transition:
				background 0.12s ease,
				border-color 0.12s ease;
		}

		.box.is-hovered {
			border-color: var(--color-border-strong);
		}
		.box.is-pressed {
			border-color: var(--color-border-strong);
			background: var(--color-bg-muted);
		}
		.box.is-dragging {
			border-color: var(--color-accent);
			background: var(--color-bg-muted);

			transition-duration: 0s;
		}
		.box.is-dragging::before {
			opacity: 1;
		}

		.box::before {
			content: "";
			position: absolute;
			inset: auto auto 0 0;
			height: 2px;
			width: calc(100% * var(--held, 0));
			background: var(--color-accent);
			opacity: 0.5;
			pointer-events: none;
			transition: opacity 0.12s ease;
		}
		.value {
			display: flex;
			align-items: center;

			gap: 0.25em;

			position: relative;
		}
		.number {
			min-width: 1ch;
			padding: 0;
			border: 0;
			background: none;
			color: inherit;
			font: inherit;
			font-weight: 600;
			font-variant-numeric: tabular-nums;
			text-align: center;

			cursor: inherit;
			outline: none;
		}
		.number:read-write {
			cursor: text;
			user-select: text;
			-webkit-user-select: text;
		}
		.suffix {
			opacity: 0.5;
			pointer-events: none;
		}

		.step {
			position: absolute;
			top: 0;
			bottom: 0;
			display: grid;
			place-items: center;
			width: 15px;
			padding: 0;
			border: 0;
			border-radius: 5px;
			background: none;
			color: var(--color-text-subtle);
			cursor: pointer;

			touch-action: manipulation;
			transition:
				background 0.12s ease,
				color 0.12s ease,
				transform 0.12s ease;
		}
		.step.is-down {
			left: 0;
		}
		.step.is-up {
			right: 0;
		}

		.box.is-hovered .step:hover {
			color: var(--color-text);
			background: color-mix(in srgb, var(--color-accent) 9%, transparent);
		}

		.step:active {
			color: var(--color-accent);
			background: color-mix(in srgb, var(--color-accent) 16%, transparent);
			transform: scale(0.86);

			transition-duration: 0s;
		}
		.chevron {
			width: 11px;
			height: 11px;
			display: block;
			fill: none;
			stroke: currentColor;
			stroke-width: 1.9;
			stroke-linecap: round;
			stroke-linejoin: round;
		}
		.box:focus-within {
			outline: 2px solid color-mix(in srgb, var(--color-accent) 38%, transparent);
			outline-offset: 1px;
		}
		:host([disabled]) .box {
			cursor: default;
		}
		:host([disabled]) .step {
			display: none;
		}
	`;

  static override properties = {
    value: { type: Number },
    min: { type: Number },
    max: { type: Number },
    step: { type: Number },
    scale: { type: String },
    suffix: { type: String },
    disabled: { type: Boolean, reflect: true },
    label: { type: String },
    editing: { state: true },
    hovered: { state: true },
  };

  declare value: number;

  declare min: number | null;
  declare max: number | null;

  declare step: number;
  declare scale: NumberScale;

  declare suffix: string;
  declare disabled: boolean;

  declare label: string;

  declare editing: boolean;

  declare hovered: boolean;

  private drag: Drag | null = null;

  private stepPointer: number | null = null;

  private claimBoxTouch = (event: TouchEvent): void => {
    if (this.disabled || this.editing) return;
    claimTouch(event);
  };

  constructor() {
    super();
    this.value = 0;
    this.min = null;
    this.max = null;
    this.step = 1;
    this.scale = "linear";
    this.suffix = "";
    this.disabled = false;
    this.label = "";
    this.editing = false;
    this.hovered = false;
  }

  private get range(): readonly [number, number] | null {
    const { min, max } = this;
    if (min === null || max === null || max <= min) return null;
    return [min, max];
  }

  private get text(): string {
    return Number.isFinite(this.value) ? this.value.toFixed(stepDecimals(this.step)) : "";
  }

  private get field(): HTMLInputElement | null {
    return this.renderRoot.querySelector<HTMLInputElement>(".number");
  }

  private ask(value: number): void {
    if (!Number.isFinite(value)) return;
    const next = settleNumber(value, this);
    if (next === this.value) return;
    this.dispatchEvent(new CustomEvent<number>("fluid-change", { detail: next }));
  }

  private draggedValue(start: number, pixels: number, fine: boolean): number {
    const range = this.range;
    const distance = pixels * (fine ? FINE_SCALE : 1);
    if (!range) return start + (distance * this.step * SWEEP_STEPS) / SWEEP;
    const position = positionOfValue(start, range, this.scale);
    return valueAtPosition(position + distance / SWEEP, range, this.scale);
  }

  private onPointerEnter = (event: PointerEvent): void => {
    if (this.disabled || event.pointerType === "touch") return;
    this.hovered = true;
  };

  private onPointerLeave = (): void => {
    this.hovered = false;
  };

  private onPointerDown = (event: PointerEvent): void => {
    if (this.disabled || this.editing || event.button !== 0) return;
    const box = event.currentTarget as HTMLElement;
    box.setPointerCapture(event.pointerId);
    this.drag = {
      pointer: event.pointerId,
      startX: event.clientX,
      startValue: this.value,
      moved: false,
    };
    this.requestUpdate();

    event.preventDefault();
  };

  private onPointerMove = (event: PointerEvent): void => {
    const drag = this.drag;
    if (!drag || event.pointerId !== drag.pointer) return;
    const alongX = event.clientX - drag.startX;
    if (!drag.moved) {
      if (Math.abs(alongX) < DRAG_SLOP) return;
      drag.moved = true;

      this.requestUpdate();
    }
    this.ask(this.draggedValue(drag.startValue, alongX, event.shiftKey));
  };

  private onPointerUp = (event: PointerEvent): void => {
    const drag = this.drag;
    if (!drag || event.pointerId !== drag.pointer) return;
    (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
    this.drag = null;
    this.requestUpdate();

    if (!drag.moved) this.beginEdit();
  };

  private onPointerCancel = (): void => {
    this.drag = null;
    this.requestUpdate();
  };

  private beginEdit(): void {
    if (this.disabled || this.editing) return;
    this.editing = true;
    this.updateComplete.then(() => {
      const field = this.field;
      if (!field) return;
      field.focus();
      field.select();
    });
  }

  private commitEdit(): void {
    if (!this.editing) return;
    this.editing = false;
    const field = this.field;
    if (!field) return;
    const typed = field.value.trim();
    if (typed !== "") this.ask(Number(typed));
    field.value = this.text;
  }

  private cancelEdit(): void {
    if (!this.editing) return;
    this.editing = false;
    const field = this.field;
    if (!field) return;
    field.value = this.text;
    field.blur();
  }

  private onFieldKeyDown = (event: KeyboardEvent): void => {
    switch (event.key) {
      case "Enter":
        this.commitEdit();
        return;
      case "Escape":
        this.cancelEdit();
        return;

      case "ArrowUp":
      case "ArrowDown": {
        if (this.editing) return;
        event.preventDefault();
        const way = event.key === "ArrowUp" ? 1 : -1;
        this.ask(this.value + way * this.step);
        return;
      }
      default:
        return;
    }
  };

  private onFieldInput = (event: Event): void => {
    event.stopPropagation();
  };

  override render() {
    const range = this.range;
    const held = range
      ? Math.min(1, Math.max(0, positionOfValue(this.value, range, this.scale)))
      : 0;

    const drag = this.drag;

    const state = this.disabled
      ? ""
      : drag
        ? drag.moved
          ? "is-dragging"
          : "is-pressed"
        : this.hovered
          ? "is-hovered"
          : "";
    return html`
			<div
				class="box ${state}"
				style="--held: ${held}"
				@touchstart=${this.claimBoxTouch}
				@pointerenter=${this.onPointerEnter}
				@pointerleave=${this.onPointerLeave}
				@pointerdown=${this.onPointerDown}
				@pointermove=${this.onPointerMove}
				@pointerup=${this.onPointerUp}
				@pointercancel=${this.onPointerCancel}
			>
				${this.stepper(-1)}
				<span class="value">
					<input
						class="number"
						type="text"
						inputmode="decimal"
						autocomplete="off"
						spellcheck="false"
						size=${Math.max(1, this.text.length)}
						.value=${this.text}
						?readonly=${!this.editing}
						?disabled=${this.disabled}
						role="spinbutton"
						aria-label=${this.label}
						aria-valuenow=${this.value}
						aria-valuemin=${this.min ?? nothing}
						aria-valuemax=${this.max ?? nothing}
						aria-valuetext=${this.suffix ? `${this.text}${this.suffix}` : nothing}
						@keydown=${this.onFieldKeyDown}
						@blur=${() => {
              this.commitEdit();
            }}
						@input=${this.onFieldInput}
					/>
					${this.suffix ? html`<span class="suffix">${this.suffix}</span>` : nothing}
				</span>
				${this.stepper(1)}
			</div>
		`;
  }

  private stepper(way: -1 | 1) {
    return html`
			<button
				class="step ${way < 0 ? "is-down" : "is-up"}"
				type="button"
				tabindex="-1"
				aria-hidden="true"
				@touchstart=${claimTouch}
				@pointerdown=${(event: PointerEvent) => {
          event.stopPropagation();
          if (event.button === 0) this.stepPointer = event.pointerId;
        }}
				@pointerup=${(event: PointerEvent) => {
          if (this.stepPointer !== event.pointerId) return;
          this.stepPointer = null;
          this.ask(this.value + way * this.step);
        }}
				@pointercancel=${() => {
          this.stepPointer = null;
        }}
				@pointerleave=${() => {
          this.stepPointer = null;
        }}
			>
				<svg class="chevron" viewBox="0 0 24 24">
					<path d=${way < 0 ? "m14 6-6 6 6 6" : "m10 6 6 6-6 6"} />
				</svg>
			</button>
		`;
  }
}

if (!customElements.get("a-fluid-input")) {
  customElements.define("a-fluid-input", FluidInputElement);
}

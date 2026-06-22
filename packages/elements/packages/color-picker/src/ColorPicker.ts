import { LitElement, css, html, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";

/**
 * Color picker with a 2D saturation/value field, hue and alpha sliders,
 * hex input, optional palette presets, and eye dropper support.
 *
 * @customEvent change - Fired when a color is committed (field release, hex blur/Enter, preset click).
 * @customEvent input  - Fired continuously while dragging the field or a slider.
 *
 * @example Basic
 * ```html
 * <a-color-picker name="color" value="#1d4ed8"></a-color-picker>
 * ```
 *
 * @example With alpha and palette
 * ```html
 * <a-color-picker alpha value="#1d4ed8cc"
 *   palette="#ef4444,#22c55e,#3b82f6"></a-color-picker>
 * ```
 */
export class ColorPickerElement extends LitElement {
  static shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static styles = css`
    :host {
      display: inline-block;
      font-family: inherit;
      user-select: none;

      --_focus-outline: var(--color-picker-focus-outline, black);
      --_border: var(--color-picker-border, rgba(0, 0, 0, 0.15));
      --_swatch-size: var(--color-picker-swatch-size, 1.5rem);
    }

    .picker {
      display: flex;
      flex-direction: column;
      gap: 0.625rem;
    }

    /* ── Palette ───────────────────────────────────────── */

    .palette {
      display: flex;
      flex-wrap: wrap;
      gap: 0.375rem;
    }

    .palette-swatch {
      width: var(--_swatch-size);
      height: var(--_swatch-size);
      border-radius: 0.25rem;
      border: 1px solid var(--_border);
      cursor: pointer;
      padding: 0;
      outline: none;
      flex-shrink: 0;
    }

    .palette-swatch:hover:not(:disabled) {
      transform: scale(1.12);
    }

    .palette-swatch:focus-visible {
      outline: 2px solid var(--_focus-outline);
      outline-offset: 2px;
    }

    .palette-swatch[data-selected] {
      outline: 2px solid var(--_focus-outline);
      outline-offset: 2px;
    }

    .palette-swatch:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* ── 2D SV field ───────────────────────────────────── */

    .sv-field {
      position: relative;
      width: 100%;
      aspect-ratio: 4 / 3;
      border-radius: 0.5rem;
      overflow: hidden;
      cursor: crosshair;
      touch-action: none;
      -webkit-user-select: none;
    }

    .sv-canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      display: block;
      image-rendering: pixelated;
    }

    .sv-thumb {
      position: absolute;
      width: 1rem;
      height: 1rem;
      border-radius: 50%;
      border: 2px solid #fff;
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.3), 0 1px 4px rgba(0, 0, 0, 0.4);
      transform: translate(-50%, -50%);
      pointer-events: none;
      will-change: left, top;
    }

    /* ── Slider controls row ───────────────────────────── */

    .controls {
      display: flex;
      align-items: center;
      gap: 0.625rem;
    }

    .slider-stack {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      min-width: 0;
    }

    /* ── Hue & alpha sliders ──────────────────────────── */

    .hue-slider,
    .alpha-slider {
      position: relative;
      padding: 0.375rem 0;
      touch-action: none;
      user-select: none;
      -webkit-user-select: none;
      cursor: pointer;
      outline: none;
    }

    :host([disabled]) .hue-slider,
    :host([disabled]) .alpha-slider {
      cursor: not-allowed;
    }

    .hue-track,
    .alpha-track {
      position: relative;
      height: 0.625rem;
      border-radius: 9999px;
      overflow: hidden;
      border: 1px solid var(--_border);
    }

    .hue-canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      display: block;
    }

    /* Alpha: checkerboard pattern */
    .alpha-track {
      background-image: repeating-conic-gradient(
        rgba(0, 0, 0, 0.12) 0% 25%,
        transparent 0% 50%
      );
      background-size: 0.875rem 0.875rem;
    }

    /* Alpha: color gradient overlay */
    .alpha-track::before {
      content: "";
      position: absolute;
      inset: 0;
      background: var(--_alpha-bg);
    }

    .hue-handle,
    .alpha-handle {
      position: absolute;
      width: 1.125rem;
      height: 1.125rem;
      border-radius: 50%;
      background: #fff;
      border: 1.5px solid rgba(0, 0, 0, 0.15);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
      top: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
      will-change: left;
      transition: transform 0.08s;
    }

    .hue-handle { left: calc(var(--_hp, 0) * 100%); }
    .alpha-handle { left: calc(var(--_ap, 0) * 100%); }

    .hue-slider:focus-visible .hue-handle,
    .alpha-slider:focus-visible .alpha-handle {
      box-shadow: 0 0 0 2px var(--_focus-outline), 0 1px 3px rgba(0, 0, 0, 0.3);
    }

    .hue-slider:not([aria-disabled='true']):active .hue-handle,
    .alpha-slider:not([aria-disabled='true']):active .alpha-handle {
      transform: translate(-50%, -50%) scale(0.85);
    }

    /* ── Eye dropper ───────────────────────────────────── */

    .eyedropper-btn {
      flex-shrink: 0;
      width: 2rem;
      height: 2rem;
      border: 1px solid var(--_border);
      border-radius: 0.375rem;
      background: transparent;
      color: inherit;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      outline: none;
    }

    .eyedropper-btn:hover:not(:disabled) {
      opacity: 0.7;
    }

    .eyedropper-btn:focus-visible {
      outline: 2px solid var(--_focus-outline);
      outline-offset: -1px;
    }

    .eyedropper-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    /* ── Bottom row ────────────────────────────────────── */

    .bottom-row {
      display: flex;
      gap: 0.5rem;
      align-items: stretch;
    }

    .hex-wrap {
      flex: 1;
      display: flex;
      align-items: center;
      border: 1px solid var(--_border);
      border-radius: 0.375rem;
      padding: 0 0.5rem;
      gap: 0.125rem;
      min-width: 0;
    }

    .hex-wrap:focus-within {
      outline: 2px solid var(--_focus-outline);
      outline-offset: -1px;
    }

    .hex-prefix {
      font-size: 0.875rem;
      opacity: 0.45;
      font-family: monospace;
      flex-shrink: 0;
    }

    .hex-input {
      flex: 1;
      font-family: monospace;
      font-size: 0.875rem;
      padding: 0.375rem 0;
      border: none;
      background: transparent;
      color: inherit;
      outline: none;
      min-width: 0;
      text-transform: uppercase;
    }

    .hex-input:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .opacity-wrap {
      display: flex;
      align-items: center;
      border: 1px solid var(--_border);
      border-radius: 0.375rem;
      padding: 0 0.375rem;
      gap: 0.125rem;
    }

    .opacity-wrap:focus-within {
      outline: 2px solid var(--_focus-outline);
      outline-offset: -1px;
    }

    .opacity-input {
      width: 2.25rem;
      font-size: 0.875rem;
      padding: 0.375rem 0;
      border: none;
      background: transparent;
      color: inherit;
      outline: none;
      text-align: right;
      font-variant-numeric: tabular-nums;
      -moz-appearance: textfield;
    }

    .opacity-input::-webkit-inner-spin-button,
    .opacity-input::-webkit-outer-spin-button {
      -webkit-appearance: none;
    }

    .opacity-input:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .opacity-suffix {
      font-size: 0.875rem;
      opacity: 0.45;
    }
  `;

  /** FormData field name. */
  @property({ type: String })
  accessor name: string | undefined = undefined;

  /**
   * Current color in hex. `#rrggbb` normally, `#rrggbbaa` when `alpha` is set.
   */
  @property({ type: String, reflect: true })
  accessor value: string = "#1d4ed8";

  /** Show the alpha slider and encode opacity in the value. */
  @property({ type: Boolean, reflect: true })
  accessor alpha = false;

  /**
   * Comma-separated hex preset colors shown above the picker.
   * @example "#ef4444,#22c55e,#3b82f6"
   */
  @property({ type: String })
  accessor palette: string | undefined = undefined;

  /** Disable all interaction. */
  @property({ type: Boolean, reflect: true })
  accessor disabled = false;

  // Internal HSV state; hue is preserved across achromatic moves so the
  // gradient doesn't snap to red when saturation or value hits 0.
  @state() accessor hue = 220;
  @state() accessor svSat = 76;  // HSV saturation 0–100
  @state() accessor svVal = 70;  // HSV value 0–100
  @state() accessor alphaPercent = 100;

  @state() accessor hexInput = "1D4ED8";
  @state() accessor hexInputEditing = false;

  #pickerDragging = false;
  #hueDragging = false;
  #hueDragStartX = 0;
  #hueDragStartHue = 0;

  readonly input = document.createElement("input");

  connectedCallback() {
    super.connectedCallback();
    this.syncFromValue();
    if (this.name) {
      this.append(this.input);
      this.input.type = "hidden";
      this.input.name = this.name;
      this.input.value = this.value;
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.input.remove();
  }

  private syncFromValue() {
    const rgb = hexToRgb(this.value.slice(0, 7));
    if (rgb) {
      const [h, s, v] = rgbToHsv(...rgb);
      // Preserve hue when saturation is 0 (achromatic) or value is 0 (black).
      if (s > 0 && v > 0) this.hue = h;
      this.svSat = s;
      this.svVal = v;
    }
    if (this.alpha && this.value.length === 9) {
      this.alphaPercent = Math.round(
        (parseInt(this.value.slice(7, 9), 16) / 255) * 100,
      );
    }
    this.hexInput = this.value.slice(1, 7).toUpperCase();
  }

  private buildHex(): string {
    const [r, g, b] = hsvToRgb(this.hue, this.svSat, this.svVal);
    const hex = rgbToHex(r, g, b);
    if (this.alpha) {
      const a = Math.round((this.alphaPercent / 100) * 255)
        .toString(16)
        .padStart(2, "0");
      return hex + a;
    }
    return hex;
  }

  private commit(eventName: "input" | "change") {
    this.value = this.buildHex();
    if (!this.hexInputEditing) {
      this.hexInput = this.value.slice(1, 7).toUpperCase();
    }
    this.input.value = this.value;
    this.dispatchEvent(new Event(eventName, { bubbles: true, composed: true }));
  }

  // ── 2D field ─────────────────────────────────────────────────────────

  private onFieldPointerDown = (e: PointerEvent) => {
    if (this.disabled) return;
    e.preventDefault();
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    this.#pickerDragging = true;
    this.updateSvFromPointer(e);
    this.commit("input");
  };

  private onFieldPointerMove = (e: PointerEvent) => {
    if (!this.#pickerDragging) return;
    this.updateSvFromPointer(e);
    this.commit("input");
  };

  private onFieldPointerUp = (e: PointerEvent) => {
    if (!this.#pickerDragging) return;
    this.#pickerDragging = false;
    this.updateSvFromPointer(e);
    this.commit("change");
  };

  private updateSvFromPointer(e: PointerEvent) {
    const el = this.shadowRoot!.querySelector<HTMLElement>(".sv-field")!;
    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    this.svSat = Math.round(x * 100);
    this.svVal = Math.round((1 - y) * 100);
  }

  // ── Hue slider — delta-based drag + arrow keys ───────────────────────

  private onHuePointerDown = (e: PointerEvent) => {
    if (this.disabled) return;
    e.preventDefault();
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    this.#hueDragging = true;
    this.#hueDragStartX = e.clientX;
    this.#hueDragStartHue = this.hue;
  };

  private onHuePointerMove = (e: PointerEvent) => {
    if (!this.#hueDragging) return;
    this.hue = this.#calcHueDelta(e.clientX);
    this.commit("input");
  };

  private onHuePointerUp = (e: PointerEvent) => {
    if (!this.#hueDragging) return;
    this.#hueDragging = false;
    this.hue = this.#calcHueDelta(e.clientX);
    this.commit("change");
  };

  #calcHueDelta(clientX: number): number {
    const el = this.shadowRoot!.querySelector<HTMLElement>("[part~='hue-slider']")!;
    const width = el.getBoundingClientRect().width || 1;
    const delta = ((clientX - this.#hueDragStartX) / width) * 360;
    return Math.round(Math.max(0, Math.min(360, this.#hueDragStartHue + delta)));
  }

  private onHueKeyDown = (e: KeyboardEvent) => {
    if (this.disabled) return;
    const step = e.shiftKey ? 10 : 1;
    let next = this.hue;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") { next = Math.max(0, this.hue - step); }
    else if (e.key === "ArrowRight" || e.key === "ArrowUp") { next = Math.min(360, this.hue + step); }
    else return;
    e.preventDefault();
    if (next !== this.hue) { this.hue = next; this.commit("change"); }
  };

  // ── Alpha slider — delta-based drag + arrow keys ─────────────────────

  #alphaDragging = false;
  #alphaDragStartX = 0;
  #alphaDragStartPct = 0;

  private onAlphaPointerDown = (e: PointerEvent) => {
    if (this.disabled) return;
    e.preventDefault();
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    this.#alphaDragging = true;
    this.#alphaDragStartX = e.clientX;
    this.#alphaDragStartPct = this.alphaPercent;
  };

  private onAlphaPointerMove = (e: PointerEvent) => {
    if (!this.#alphaDragging) return;
    this.alphaPercent = this.#calcAlphaDelta(e.clientX);
    this.commit("input");
  };

  private onAlphaPointerUp = (e: PointerEvent) => {
    if (!this.#alphaDragging) return;
    this.#alphaDragging = false;
    this.alphaPercent = this.#calcAlphaDelta(e.clientX);
    this.commit("change");
  };

  #calcAlphaDelta(clientX: number): number {
    const el = this.shadowRoot!.querySelector<HTMLElement>("[part~='alpha-slider']")!;
    const width = el.getBoundingClientRect().width || 1;
    const delta = ((clientX - this.#alphaDragStartX) / width) * 100;
    return Math.round(Math.max(0, Math.min(100, this.#alphaDragStartPct + delta)));
  }

  private onAlphaKeyDown = (e: KeyboardEvent) => {
    if (this.disabled) return;
    const step = e.shiftKey ? 10 : 1;
    let next = this.alphaPercent;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") { next = Math.max(0, this.alphaPercent - step); }
    else if (e.key === "ArrowRight" || e.key === "ArrowUp") { next = Math.min(100, this.alphaPercent + step); }
    else return;
    e.preventDefault();
    if (next !== this.alphaPercent) { this.alphaPercent = next; this.commit("change"); }
  };

  // ── Hex input ─────────────────────────────────────────────────────────

  private onHexInput = (e: Event) => {
    this.hexInput = (e.target as HTMLInputElement).value.toUpperCase();
  };
  private onHexFocus = () => { this.hexInputEditing = true; };
  private onHexBlur = () => {
    this.hexInputEditing = false;
    this.applyHexInput();
  };
  private onHexKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      this.applyHexInput();
      (e.target as HTMLInputElement).blur();
    }
  };
  private onHexCopy = (e: ClipboardEvent) => {
    const input = e.target as HTMLInputElement;
    const selected = input.value.substring(
      input.selectionStart ?? 0,
      input.selectionEnd ?? input.value.length,
    );
    e.clipboardData?.setData("text/plain", "#" + selected);
    e.preventDefault();
  };
  private onHexPaste = (e: ClipboardEvent) => {
    e.preventDefault();
    const text = (e.clipboardData?.getData("text/plain") ?? "")
      .replace(/^#/, "")
      .slice(0, 6)
      .toUpperCase();
    const input = e.target as HTMLInputElement;
    input.value = text;
    this.hexInput = text;
  };

  private applyHexInput() {
    const rgb = hexToRgb("#" + this.hexInput.replace(/^#/, ""));
    if (rgb) {
      const [h, s, v] = rgbToHsv(...rgb);
      if (s > 0 && v > 0) this.hue = h;
      this.svSat = s;
      this.svVal = v;
      this.hexInput = rgbToHex(...rgb).slice(1).toUpperCase();
      this.commit("change");
    } else {
      this.hexInput = this.value.slice(1, 7).toUpperCase();
    }
  }

  // ── Opacity number input ──────────────────────────────────────────────

  private onOpacityInput = (e: Event) => {
    const v = parseInt((e.target as HTMLInputElement).value, 10);
    if (!isNaN(v)) {
      this.alphaPercent = Math.max(0, Math.min(100, v));
      this.commit("input");
    }
  };
  private onOpacityChange = (e: Event) => {
    const v = parseInt((e.target as HTMLInputElement).value, 10);
    if (!isNaN(v)) {
      this.alphaPercent = Math.max(0, Math.min(100, v));
      this.commit("change");
    }
  };

  // ── Palette ───────────────────────────────────────────────────────────

  selectPreset(color: string) {
    if (this.disabled) return;
    const rgb = hexToRgb(color);
    if (!rgb) return;
    const [h, s, v] = rgbToHsv(...rgb);
    if (s > 0 && v > 0) this.hue = h;
    this.svSat = s;
    this.svVal = v;
    this.commit("change");
  }

  private get parsedPalette(): string[] {
    if (!this.palette) return [];
    return this.palette.split(",").map((c) => c.trim().toLowerCase()).filter(Boolean);
  }

  private isPresetSelected(hex: string): boolean {
    return this.value.slice(0, 7).toLowerCase() === hex.slice(0, 7).toLowerCase();
  }

  // ── Eye dropper ───────────────────────────────────────────────────────

  private get eyeDropperSupported(): boolean {
    return typeof window !== "undefined" && "EyeDropper" in window;
  }

  private openEyeDropper = async () => {
    if (this.disabled || !this.eyeDropperSupported) return;
    try {
      const dropper = new (window as any).EyeDropper();
      const { sRGBHex } = await dropper.open();
      const rgb = hexToRgb(sRGBHex);
      if (!rgb) return;
      const [h, s, v] = rgbToHsv(...rgb);
      if (s > 0 && v > 0) this.hue = h;
      this.svSat = s;
      this.svVal = v;
      this.commit("change");
    } catch {
      // User cancelled — no-op
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────

  override focus(options?: FocusOptions) {
    this.shadowRoot?.querySelector<HTMLElement>(".hex-input")?.focus(options);
  }

  override firstUpdated() {
    this.renderCanvas();
    this.renderHueCanvas();
  }

  override updated(changed: Map<string, unknown>) {
    if (changed.has("hue")) this.renderCanvas();
  }

  // Renders the full hue spectrum (s=100, v=100) once — the rainbow never changes.
  private renderHueCanvas() {
    const canvas = this.shadowRoot?.querySelector<HTMLCanvasElement>(".hue-canvas");
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    const ctx = canvas.getContext("2d", { colorSpace: "srgb" });
    if (!ctx) return;

    const img = ctx.createImageData(w, h);
    const d = img.data;
    for (let col = 0; col < w; col++) {
      const hue = (col / (w - 1)) * 360;
      const [r, g, b] = hsvToRgb(hue, 100, 100);
      for (let row = 0; row < h; row++) {
        const i = (row * w + col) * 4;
        d[i]     = r;
        d[i + 1] = g;
        d[i + 2] = b;
        d[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  // Renders the SV gradient into the canvas pixel-by-pixel using the same
  // hsvToRgb formula the picker uses, so the visual exactly matches the math.
  // The canvas 2D context operates in sRGB, which is also what hsvToRgb outputs.
  private renderCanvas() {
    const canvas = this.shadowRoot?.querySelector<HTMLCanvasElement>(".sv-canvas");
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    const ctx = canvas.getContext("2d", { colorSpace: "srgb" });
    if (!ctx) return;

    const img = ctx.createImageData(w, h);
    const d = img.data;
    for (let row = 0; row < h; row++) {
      const v = (1 - row / (h - 1)) * 100;          // 100 at top → 0 at bottom
      for (let col = 0; col < w; col++) {
        const s = (col / (w - 1)) * 100;             // 0 at left → 100 at right
        const [r, g, b] = hsvToRgb(this.hue, s, v);
        const i = (row * w + col) * 4;
        d[i]     = r;
        d[i + 1] = g;
        d[i + 2] = b;
        d[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  render() {
    const { hue, svSat, svVal, alphaPercent } = this;

    const [r, g, b] = hsvToRgb(hue, svSat, svVal);
    const currentSolid = `rgb(${r},${g},${b})`;
    const alphaBg = `linear-gradient(to right, transparent, ${currentSolid})`;

    const presets = this.parsedPalette;

    return html`
      <div class="picker" part="picker">

        ${presets.length > 0 ? html`
          <div class="palette" part="palette" role="group" aria-label="Color presets">
            ${presets.map((color) => html`
              <button
                type="button"
                class="palette-swatch"
                part="palette-swatch"
                style=${styleMap({ background: color })}
                ?disabled=${this.disabled}
                ?data-selected=${this.isPresetSelected(color)}
                aria-label="Select color ${color}"
                aria-pressed=${this.isPresetSelected(color) ? "true" : "false"}
                @click=${() => this.selectPreset(color)}
              ></button>
            `)}
          </div>
        ` : nothing}

        <div
          class="sv-field"
          part="sv-field"
          role="img"
          aria-label="Color field. Use mouse or touch to select saturation and brightness."
          @pointerdown=${this.onFieldPointerDown}
          @pointermove=${this.onFieldPointerMove}
          @pointerup=${this.onFieldPointerUp}
          @pointercancel=${this.onFieldPointerUp}
        >
          <canvas
            class="sv-canvas"
            part="sv-canvas"
            width="101"
            height="101"
            aria-hidden="true"
          ></canvas>
          <div
            class="sv-thumb"
            part="sv-thumb"
            style=${styleMap({ left: `${svSat}%`, top: `${100 - svVal}%`, background: currentSolid })}
            aria-hidden="true"
          ></div>
        </div>

        <div class="controls" part="controls">
          ${this.eyeDropperSupported ? html`
            <button
              type="button"
              class="eyedropper-btn"
              part="eyedropper-btn"
              ?disabled=${this.disabled}
              aria-label="Pick color from screen"
              @click=${this.openEyeDropper}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M13.354.646a2.207 2.207 0 0 0-3.12 0l-1.586 1.586-.009-.009a.75.75 0 0 0-1.06 1.061l.008.009-5.96 5.96A2.25 2.25 0 0 0 1 10.843V13.5A1.5 1.5 0 0 0 2.5 15h2.657a2.25 2.25 0 0 0 1.59-.659l5.96-5.959.009.009a.75.75 0 0 0 1.06-1.061l-.009-.009 1.587-1.586a2.207 2.207 0 0 0 0-3.12zM4.687 13.28A.75.75 0 0 1 4.157 13.5H2.5v-1.657a.75.75 0 0 1 .22-.53l5.69-5.691 1.968 1.968z"/>
              </svg>
            </button>
          ` : nothing}

          <div class="slider-stack" part="slider-stack">
            <div
              class="hue-slider"
              part="hue-slider"
              role="slider"
              tabindex="0"
              aria-label="Hue"
              aria-valuemin="0"
              aria-valuemax="360"
              aria-valuenow=${hue}
              aria-valuetext="${hue}°"
              aria-disabled=${this.disabled ? "true" : "false"}
              style=${styleMap({ "--_hp": String(hue / 360) } as Record<string, string>)}
              @pointerdown=${this.onHuePointerDown}
              @pointermove=${this.onHuePointerMove}
              @pointerup=${this.onHuePointerUp}
              @pointercancel=${this.onHuePointerUp}
              @keydown=${this.onHueKeyDown}
            >
              <div class="hue-track" part="hue-track">
                <canvas class="hue-canvas" width="360" height="1" aria-hidden="true"></canvas>
              </div>
              <div class="hue-handle" part="hue-handle" aria-hidden="true"></div>
            </div>

            ${this.alpha ? html`
              <div
                class="alpha-slider"
                part="alpha-slider"
                role="slider"
                tabindex="0"
                aria-label="Opacity"
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow=${alphaPercent}
                aria-valuetext="${alphaPercent}%"
                aria-disabled=${this.disabled ? "true" : "false"}
                style=${styleMap({ "--_ap": String(alphaPercent / 100), "--_alpha-bg": alphaBg } as Record<string, string>)}
                @pointerdown=${this.onAlphaPointerDown}
                @pointermove=${this.onAlphaPointerMove}
                @pointerup=${this.onAlphaPointerUp}
                @pointercancel=${this.onAlphaPointerUp}
                @keydown=${this.onAlphaKeyDown}
              >
                <div class="alpha-track" part="alpha-track"></div>
                <div class="alpha-handle" part="alpha-handle" aria-hidden="true"></div>
              </div>
            ` : nothing}
          </div>
        </div>

        <div class="bottom-row" part="bottom-row">
          <div class="hex-wrap" part="hex-wrap">
            <span class="hex-prefix" aria-hidden="true">#</span>
            <input
              type="text"
              class="hex-input"
              part="hex-input"
              .value=${this.hexInput}
              ?disabled=${this.disabled}
              aria-label="Hex color value"
              spellcheck="false"
              autocomplete="off"
              maxlength="6"
              @input=${this.onHexInput}
              @focus=${this.onHexFocus}
              @blur=${this.onHexBlur}
              @keydown=${this.onHexKeyDown}
              @copy=${this.onHexCopy}
              @paste=${this.onHexPaste}
            />
          </div>

          ${this.alpha ? html`
            <div class="opacity-wrap" part="opacity-wrap">
              <input
                type="number"
                class="opacity-input"
                part="opacity-input"
                min="0" max="100"
                .value=${String(alphaPercent)}
                ?disabled=${this.disabled}
                aria-label="Opacity percentage"
                @input=${this.onOpacityInput}
                @change=${this.onOpacityChange}
              />
              <span class="opacity-suffix" aria-hidden="true">%</span>
            </div>
          ` : nothing}
        </div>

      </div>
    `;
  }
}

// ── Color conversion utilities ────────────────────────────────────────────────

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  s /= 100;
  v /= 100;
  const i = Math.floor(h / 60) % 6;
  const f = h / 60 - Math.floor(h / 60);
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  const parts: Array<[number, number, number]> = [
    [v, t, p], [q, v, p], [p, v, t],
    [p, q, v], [t, p, v], [v, p, q],
  ];
  const [r, g, b] = parts[i]!;
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  const s = max === 0 ? 0 : d / max;
  const v = max;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  return [h, Math.round(s * 100), Math.round(v * 100)];
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0"))
      .join("")
  );
}

function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace(/^#/, "");
  if (!/^[0-9a-fA-F]+$/.test(clean)) return null;
  if (clean.length === 3) {
    return [
      parseInt(clean[0]! + clean[0]!, 16),
      parseInt(clean[1]! + clean[1]!, 16),
      parseInt(clean[2]! + clean[2]!, 16),
    ];
  }
  if (clean.length === 6 || clean.length === 8) {
    return [
      parseInt(clean.slice(0, 2), 16),
      parseInt(clean.slice(2, 4), 16),
      parseInt(clean.slice(4, 6), 16),
    ];
  }
  return null;
}

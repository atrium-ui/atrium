import * as Rive from "@rive-app/canvas-advanced";
import {
  LitElement,
  css,
  html,
  type HTMLTemplateResult,
  type PropertyValueMap,
} from "lit";
import { property } from "lit/decorators/property.js";

declare global {
  interface HTMLElementTagNameMap {
    "a-animation": AnimationElement;
  }
}

interface Animation {
  cleanup(): void;
  onMouse(event: MouseEvent): void;
  input(name: string): Rive.SMIInput | undefined;
}

/**
 * Rive animation
 *
 * @customEvent load - Emitted when animation has loaded.
 * @customEvent play - Emitted when animation has started playing.
 * @customEvent pause - Emitted when animation has been paused.
 *
 * @example
 * ```html
 * <a-animation
 *   height="200"
 *   width="200"
 *   src="/loading.riv"
 * />
 * ```
 *
 * @see https://svp.pages.s-v.de/atrium/elements/a-animation/
 */
export class AnimationElement extends LitElement {
  static riveWasm = "https://unpkg.com/@rive-app/canvas-advanced@2.18.0/rive.wasm";
  static wasm?: Promise<Blob>;

  public static styles = css`
    :host {
      display: inline-block;
    }
    canvas {
      display: block;
      width: 100%;
      height: 100%;
      max-width: 100%;
      max-height: 100%;
      pointer-events: none;
    }
  `;

  protected render(): HTMLTemplateResult {
    return html`${this.canvas}`;
  }

  protected firstUpdated(): void {
    this.format();
  }

  /** url to .riv file */
  @property({ type: String, reflect: true })
  public src?: string;

  /** fit */
  @property({ type: String, reflect: true })
  public layout: "cover" | "fill" | "contain" = "contain";

  /** width in pixel */
  @property({ type: Number, reflect: true })
  public width = 300;

  /** height in pixel */
  @property({ type: Number, reflect: true })
  public height = 150;

  /** name of state machine */
  @property({ type: String, reflect: true })
  public stateMachine?: string;

  /** artboard name */
  @property({ type: String, reflect: true })
  public artboard?: string;

  /** wether to autoplay on load */
  @property({ type: Boolean, reflect: true })
  public autoplay = true;

  /**
   * Play the animation
   */
  public play() {
    this.playing = true;
  }

  /**
   * Pause the animation
   */
  public pause() {
    this.playing = false;
  }

  /**
   * Trigger a rive input by name
   */
  public trigger(name: string) {
    const instance = this.animations[0];
    const input = instance?.input(name);
    if (input) input.fire();
  }

  public loaded = false;

  private observer?: IntersectionObserver;

  connectedCallback(): void {
    super.connectedCallback();

    this.canvas.addEventListener("mousemove", this.onMouse);
    this.canvas.addEventListener("mousedown", this.onMouse);
    this.canvas.addEventListener("mouseup", this.onMouse);

    this.observer = new IntersectionObserver((intersetions) => {
      for (const intersetion of intersetions) {
        this.paused = !intersetion.isIntersecting;
      }
    });
    this.observer.observe(this);
  }

  disconnectedCallback(): void {
    this.dispose(0);

    this.canvas.removeEventListener("mousemove", this.onMouse);
    this.canvas.removeEventListener("mousedown", this.onMouse);
    this.canvas.removeEventListener("mouseup", this.onMouse);

    this.observer?.disconnect();
  }

  private playing = this.autoplay;
  private paused = false;

  private canvas: HTMLCanvasElement = document.createElement("canvas");

  private onMouse = (e: MouseEvent) => {
    this.animations[0]?.onMouse(e);
  };

  private animations: Animation[] = [];

  private get pixelRatio() {
    return devicePixelRatio || 2;
  }

  private format() {
    this.canvas.width = this.width * this.pixelRatio;
    this.canvas.height = this.height * this.pixelRatio;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
  }

  protected updated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>,
  ): void {
    if (_changedProperties.has("src") && this.src) {
      this.dispose(0);
      this.createAnimation(this.src);
      this.format();
    }
  }

  private dispose(index: number) {
    if (this.animations.length > 0) {
      this.animations[index]?.cleanup();
      this.animations.splice(index, 1);
    }
  }

  private async load(src: string) {
    if (!AnimationElement.riveWasm) {
      throw new Error(`Rive wasm not found: ${AnimationElement.riveWasm}`);
    }

    if (!AnimationElement.wasm) {
      AnimationElement.wasm = fetch(AnimationElement.riveWasm).then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to load Rive wasm: ${res.statusText}`);
        }
        return new Blob([await res.arrayBuffer()], { type: "application/wasm" });
      });
    }

    const wasmUrl = URL.createObjectURL(await AnimationElement.wasm);
    const rive = await Rive.default({
      locateFile: (_) => wasmUrl,
    });

    const bytes = await (await fetch(new Request(src))).arrayBuffer();
    const file = await rive.load(new Uint8Array(bytes));

    this.dispatchEvent(new CustomEvent("load"));

    return { rive, file };
  }

  private lastTime?: number;

  private fit() {
    if (!this.rive) {
      return undefined;
    }
    return this.layout === "contain"
      ? this.rive.Fit.contain
      : this.layout === "cover"
        ? this.rive.Fit.cover
        : this.layout === "fill"
          ? this.rive.Fit.fill
          : this.rive.Fit.contain;
  }

  private alignment() {
    if (!this.rive) {
      return undefined;
    }
    return this.rive.Alignment.center;
  }

  rive: Rive.RiveCanvas | undefined;

  private async createAnimation(src: string) {
    // TODO: refactor this function into a seprate class
    const { rive, file } = await this.load(src);

    this.rive = rive;
    this.loaded = true;

    const renderer = rive.makeRenderer(this.canvas);
    const artboard = file.defaultArtboard();
    const stateMachine = new rive.StateMachineInstance(
      artboard.stateMachineByName(
        this.stateMachine || artboard.stateMachineByIndex(0).name,
      ),
      artboard,
    );

    const fit = this.fit();
    const alignment = this.alignment();

    if (!fit || !alignment) {
      throw new Error("Something went very wrong");
    }

    const renderLoop = (time: number) => {
      if (!this.lastTime) {
        this.lastTime = time;
      }

      const elapsedTimeSec = (time - this.lastTime) / 1000;
      this.lastTime = time;

      // TODO: when paused, dont call animation frames
      if (!this.playing || this.paused) {
        rive.requestAnimationFrame(renderLoop);
        return;
      }

      renderer.clear();
      stateMachine.advance(elapsedTimeSec);
      artboard.advance(elapsedTimeSec);
      renderer.save();
      renderer.align(
        fit,
        alignment,
        {
          minX: 0,
          minY: 0,
          maxX: this.canvas.width,
          maxY: this.canvas.height,
        },
        artboard.bounds,
      );
      artboard.draw(renderer);
      renderer.restore();

      rive.requestAnimationFrame(renderLoop);
    };
    rive.requestAnimationFrame(renderLoop);

    this.animations.push({
      cleanup() {
        renderer.delete();
        file.delete();
        artboard.delete();
        stateMachine.delete();
      },
      input(name: string) {
        for (let i = 0, l = stateMachine.inputCount(); i < l; i++) {
          const input = stateMachine.input(i);
          if (input.name === name) return input;
        }
        return undefined;
      },
      onMouse(event) {
        const boundingRect = (
          event.currentTarget as HTMLElement
        )?.getBoundingClientRect();

        const canvasX = event.clientX - boundingRect.left;
        const canvasY = event.clientY - boundingRect.top;
        const forwardMatrix = rive.computeAlignment(
          fit,
          alignment,
          {
            minX: 0,
            minY: 0,
            maxX: boundingRect.width,
            maxY: boundingRect.height,
          },
          artboard.bounds,
        );
        const invertedMatrix = new Rive.Mat2D();
        forwardMatrix.invert(invertedMatrix);
        const canvasCoordinatesVector = new Rive.Vec2D(canvasX, canvasY);
        const transformedVector = rive.mapXY(invertedMatrix, canvasCoordinatesVector);
        const transformedX = transformedVector.x();
        const transformedY = transformedVector.y();

        switch (event.type) {
          // Pointer moving/hovering on the canvas
          case "mousemove": {
            stateMachine.pointerMove(transformedX, transformedY);
            break;
          }
          // Pointer click initiated but not released yet on the canvas
          case "mousedown": {
            stateMachine.pointerDown(transformedX, transformedY);
            break;
          }
          // Pointer click released on the canvas
          case "mouseup": {
            stateMachine.pointerUp(transformedX, transformedY);
            break;
          }
          default:
        }
      },
    });
  }
}

customElements.define("a-animation", AnimationElement);

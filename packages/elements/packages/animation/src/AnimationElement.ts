import * as Rive from "@rive-app/canvas-advanced";
import {
  LitElement,
  css,
  html,
  type HTMLTemplateResult,
  type PropertyValueMap,
} from "lit";

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
    }
  `;

  protected render(): HTMLTemplateResult {
    return html`${this.canvas}`;
  }

  static properties = {
    src: { type: String, reflect: true },
    layout: { type: String, reflect: true },
    width: { type: Number, reflect: true },
    height: { type: Number, reflect: true },
    autoplay: { type: Boolean, reflect: true },
    stateMachine: { type: String, reflect: true },
    artboard: { type: String, reflect: true },
  };

  constructor() {
    super();

    this.layout = "contain";
    this.autoplay = true;
    this.width = 300;
    this.height = 150;
  }

  private observer?: IntersectionObserver;

  private onMouse = (e: MouseEvent) => {
    this.animations[0]?.onMouse(e);
  };

  connectedCallback(): void {
    super.connectedCallback();

    this.canvas.addEventListener("mousemove", this.onMouse);
    this.canvas.addEventListener("mousedown", this.onMouse);
    this.canvas.addEventListener("mouseup", this.onMouse);

    this.observer = new IntersectionObserver((intersetions) => {
      for (const intersetion of intersetions) {
        this.setPaused(!intersetion.isIntersecting);
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

  //
  // Puplic interface

  /** url to .riv file */
  public declare src?: string;

  /** fit */
  public declare layout: "cover" | "fill" | "contain";

  /** width in pixel */
  public declare width: number;

  /** height in pixel */
  public declare height: number;

  /** name of state machine */
  public declare stateMachine?: string;

  /** artboard name */
  public declare artboard?: string;

  /** wether to autoplay on load */
  public declare autoplay: boolean;

  /**
   * Play the animation
   */
  public play() {
    this.setPlaying(true);
  }

  /**
   * Pause the animation
   */
  public pause() {
    this.setPlaying(false);
  }

  /**
   * Trigger a rive input by name
   */
  public trigger(name: string) {
    const instance = this.animations[0];
    const input = instance?.input(name);
    if (input) input.fire();
  }

  //
  // Internals

  private canvas: HTMLCanvasElement = document.createElement("canvas");

  private animations: Animation[] = [];

  private loaded = false;
  private playing = false;
  private paused = false;

  private get shouldAnimate() {
    return this.playing && !this.paused;
  }

  private setPaused(paused: boolean) {
    this.paused = paused;
    this.emitPlayPauseEvent();
  }

  private setPlaying(playing: boolean) {
    this.playing = playing;
    this.emitPlayPauseEvent();
  }

  private emitPlayPauseEvent() {
    if (this.shouldAnimate) {
      this.dispatchEvent(new CustomEvent("play"));
    } else {
      this.dispatchEvent(new CustomEvent("pause"));
    }
  }

  private format() {
    const ratio = devicePixelRatio || 2;

    this.canvas.width = this.width * ratio;
    this.canvas.height = this.height * ratio;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
  }

  private init() {
    if (this.loaded) {
      this.dispose(0);
    }

    if (this.src) {
      this.load(this.src).then(({ rive, file }) => {
        this.rive = rive;
        this.file = file;
        this.loaded = true;

        this.setPlaying(this.autoplay);

        this.createAnimation();
      });
    }
  }

  protected firstUpdated(): void {
    this.format();
  }

  protected updated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>,
  ): void {
    if (_changedProperties.has("src") && this.src) {
      this.init();
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

    const bytes = await (await fetch(src)).arrayBuffer();
    const file = await rive.load(new Uint8Array(bytes));

    this.dispatchEvent(new CustomEvent("load"));

    return { rive, file };
  }

  private dispose(index: number) {
    if (this.animations.length > 0) {
      this.animations.splice(index, 1);
      this.animations[index]?.cleanup();
    }

    if (this.frame) {
      this.rive?.cancelAnimationFrame(this.frame);
    }
  }

  private get disposed() {
    return !this.animations[0];
  }

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

  private rive: Rive.RiveCanvas | undefined;
  private file: Rive.File | undefined;

  private lastTime?: number;
  private frame?: number;

  private async createAnimation() {
    // TODO: refactor this function into a seprate class
    const rive = this.rive;
    const file = this.file;

    if (!rive || !file) {
      throw new Error("createAnimation before load");
    }

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

        const invertedMatrix = new rive.Mat2D();
        forwardMatrix.invert(invertedMatrix);
        const canvasCoordinatesVector = new rive.Vec2D(canvasX, canvasY);
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

    const renderLoop = (time: number) => {
      if (this.disposed) return;

      if (!this.lastTime) {
        this.lastTime = time;
      }

      const elapsedTimeSec = (time - this.lastTime) / 1000;
      this.lastTime = time;

      // TODO: when paused, dont call animation frames
      if (!this.shouldAnimate) {
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

      this.frame = rive.requestAnimationFrame(renderLoop);
    };

    renderLoop(0);
  }
}

customElements.define("a-animation", AnimationElement);

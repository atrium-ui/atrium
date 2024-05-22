import * as rive from "@rive-app/canvas";
import {
  LitElement,
  css,
  html,
  type HTMLTemplateResult,
  type PropertyValueMap,
} from "lit";
import { property } from "lit/decorators/property.js";

const { Rive } = rive;

declare global {
  interface HTMLElementTagNameMap {
    "a-animation": AnimationElement;
  }
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
  public static styles = css`
    :host {
      display: inline-block;
    }
    canvas {
      display: block;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }
  `;

  protected render(): HTMLTemplateResult {
    return html`${this.canvas}`;
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

  private canvas: HTMLCanvasElement = document.createElement("canvas");

  private animations: rive.Rive[] = [];

  private get pixelRatio() {
    return devicePixelRatio || 2;
  }

  private format() {
    this.canvas.width = this.width * this.pixelRatio;
    this.canvas.height = this.height * this.pixelRatio;
  }

  protected firstUpdated(): void {
    this.format();
  }

  protected updated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>,
  ): void {
    if (_changedProperties.has("src") && this.src) {
      this.dispose(0);
      this.createAnimation(this.src, {
        autoplay: this.autoplay,
        stateMachines: this.stateMachine,
        artboard: this.artboard,
      });
      this.format();
    }
  }

  private dispose(index: number) {
    if (this.animations.length > 0) {
      this.animations[index]?.cleanup();
      this.animations.splice(index, 1);
    }
  }

  private createAnimation(src: string, riveOptions: Partial<rive.RiveParameters>) {
    return new Promise((resolve) => {
      const instance = new Rive({
        ...riveOptions,
        layout: new rive.Layout({
          fit:
            this.layout === "contain"
              ? rive.Fit.Contain
              : this.layout === "cover"
                ? rive.Fit.Cover
                : this.layout === "fill"
                  ? rive.Fit.Fill
                  : rive.Fit.Contain,
          alignment: rive.Alignment.Center,
        }),
        canvas: this.canvas,
        src: src,
        onLoad: () => {
          resolve(instance);
          this.dispatchEvent(new CustomEvent("load"));
        },
        onPlay: () => {
          this.dispatchEvent(new CustomEvent("play"));
        },
        onPause: () => {
          this.dispatchEvent(new CustomEvent("pause"));
        },
      });
      this.animations.push(instance);
    });
  }

  disconnectedCallback(): void {
    this.dispose(0);
  }

  /**
   * Trigger a rive input by name
   */
  public trigger(rive: rive.Rive, stateMachine: string, name: string) {
    const inputs = rive.stateMachineInputs(stateMachine);
    if (inputs) {
      for (const input of inputs) {
        if (input.name === name) {
          input.fire();
          break;
        }
      }
    }
  }

  public transition(source: string, trigger?: string, duration?: number) {
    if (this.stateMachine) {
      const anim = this.animations[0];
      if (trigger && anim) this.trigger(anim, this.stateMachine, trigger);
      this.createAnimation(source, {
        autoplay: true,
      });
    }
  }
}

customElements.define("a-animation", AnimationElement);

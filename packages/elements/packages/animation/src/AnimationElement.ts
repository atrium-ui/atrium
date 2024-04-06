import * as rive from "@rive-app/canvas-single";
import {
  LitElement,
  css,
  html,
  type HTMLTemplateResult,
  type PropertyValueMap,
} from "lit";
import { property, query } from "lit/decorators.js";
const { Rive } = rive;

declare global {
  interface HTMLElementTagNameMap {
    "a-animation": AnimationElement;
  }
}

/**
 * # a-animation
 * Rive animation
 *
 * ## Props
 *
 * @attribute width - Canvas width
 * @attribute height - Canvas height
 * @attribute src - Path to .riv file
 *
 * @example
 * ```html
 * <a-animation
 *   height={props.height || 200}
 *   width={props.width || 200}
 *   src={props.src}
 * />
 * ```
 *
 * @see https://sv.pages.s-v.de/sv-frontend-library/mono/elements/a-animation/
 */
export class AnimationElement extends LitElement {
  public static styles = css`
    canvas {
      display: block;
      width: var(--w);
      height: var(--h);
    }
  `;

  protected render(): HTMLTemplateResult {
    return html`${this.canvas}`;
  }

  @property({ type: String, reflect: true }) public src!: string;
  @property({ type: Number, reflect: true }) public width = 600;
  @property({ type: Number, reflect: true }) public height = 600;
  @property({ type: String, reflect: true }) public stateMachine?: string;
  @property({ type: Boolean, reflect: true }) public autoplay = true;

  @query("canvas")
  private container!: HTMLElement;

  protected canvas: HTMLCanvasElement = document.createElement("canvas");
  protected bufferCanvas: HTMLCanvasElement = document.createElement("canvas");

  protected animations: rive.Rive[] = [];

  protected get pixelRatio() {
    return devicePixelRatio || 1;
  }

  public format() {
    this.canvas.width = this.width * this.pixelRatio;
    this.canvas.height = this.height * this.pixelRatio;
    this.container.style.setProperty("--w", `${this.width}px`);
    this.container.style.setProperty("--h", `${this.height}px`);
  }

  protected firstUpdated(): void {
    this.format();
  }

  protected updated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>,
  ): void {
    if (_changedProperties.has("src")) {
      this.dispose(0);
      this.createAnimation(this.src, this.autoplay, this.stateMachine);
      this.format();
    }
  }

  protected dispose(index: number) {
    if (this.animations.length > 0) {
      this.animations[index]?.cleanup();
      this.animations.splice(index, 1);
    }
  }

  protected createAnimation(src: string, autoplay?: boolean, stateMachine?: string) {
    return new Promise((resolve) => {
      const rive = new Rive({
        canvas: this.canvas,
        src: src,
        stateMachines: stateMachine,
        autoplay: autoplay,
        onLoad: () => resolve(rive),
      });
      this.animations.push(rive);
    });
  }

  disconnectedCallback(): void {
    this.dispose(0);
  }

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

  public transition(source: string, trigger?: string, duration?: number, offset = 0) {
    if (this.stateMachine) {
      const anim = this.animations[0];
      if (trigger && anim) this.trigger(anim, this.stateMachine, trigger);
      this.createAnimation(source, true);
    }
  }
}

customElements.define("a-animation", AnimationElement);

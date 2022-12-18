import { Rive } from "@rive-app/canvas";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "animated-riv": any;
    }
  }
}

export type RiveEvents = "load";

class RiveEvent extends Event {
  rive: Rive;

  constructor(riveInstance: Rive, event: RiveEvents) {
    super(event);
    this.rive = riveInstance;
  }
}

@customElement("animated-riv")
export class AnimatedRiv extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block;
      }
    `;
  }

  @property({ type: Number })
  width: number | undefined;

  @property({ type: Number })
  height: number | undefined;

  @property({ type: String })
  src: string | undefined;

  @property({ type: String })
  stateMachine: string = "State Machine 1";

  private riveProperties: Record<string, number> = {};

  private rive!: Rive;

  async connectedCallback(): Promise<void> {
    super.connectedCallback();

    this.requestUpdate();
    await this.updateComplete;

    if (this.src) {
      const canvas = this.shadowRoot?.querySelector("canvas");
      if (canvas) {
        this.rive = new Rive({
          src: this.src,
          canvas,
          stateMachines: this.stateMachine,
          onLoad: () => {
            canvas.width = this.width || this.rive.bounds.maxX;
            canvas.height = this.height || this.rive.bounds.maxY;
            this.rive.resizeToCanvas();

            this.rive.play();
            this.loop();

            this.dispatchEvent(new RiveEvent(this.rive, "load"));
          },
        });
      }
    }
  }

  private loop() {
    const inputs = this.rive.stateMachineInputs(this.stateMachine);

    for (const input of inputs) {
      const value = this.getAttribute(input.name);
      if (value !== undefined) {
        this.riveProperties[input.name] = +(value || 0);
        const deltaDiff = this.riveProperties[input.name] - +input.value;
        input.value = +input.value + deltaDiff / 20;
      }
    }

    requestAnimationFrame(this.loop.bind(this));
  }

  render() {
    return html`<canvas width="24" height="24"></canvas>`;
  }
}

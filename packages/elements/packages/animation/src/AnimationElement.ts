import { css, html, HTMLTemplateResult, LitElement, PropertyValueMap } from 'lit';
import { property, query } from 'lit/decorators.js';
import { Rive } from '@rive-app/canvas-single';

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

	@query('canvas')
	private container!: HTMLElement;

	protected canvas: HTMLCanvasElement = document.createElement('canvas');
	protected bufferCanvas: HTMLCanvasElement = document.createElement('canvas');

	protected animations: Rive[] = [];

	protected get pixelRatio() {
		return devicePixelRatio || 1;
	}

	public format() {
		this.canvas.width = this.width * this.pixelRatio;
		this.canvas.height = this.height * this.pixelRatio;
		this.container.style.setProperty('--w', `${this.width}px`);
		this.container.style.setProperty('--h', `${this.height}px`);
	}

	protected firstUpdated(): void {
		this.format();
	}

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	protected updated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
		if (_changedProperties.has('src')) {
			this.dispose(0);
			this.createAnimation(this.src, this.autoplay, this.stateMachine);
			this.format();
		}
	}

	protected dispose(index: number) {
		if (this.animations.length > 0) {
			this.animations[index].cleanup();
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

	public trigger(rive: Rive, stateMachine: string, name: string) {
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
			if (trigger) this.trigger(this.animations[0], this.stateMachine, trigger);
			this.createAnimation(source, true);
		}
	}
}

customElements.define('a-animation', AnimationElement);
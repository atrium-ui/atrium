import { HTMLTemplateResult, LitElement, css, html } from 'lit';
import { query } from 'lit/decorators.js';

export class AdaptiveHeight extends LitElement {
	public static get styles() {
		return [
			css`
        :host {
          display: block;

          --transition-speed: 0.33s;
          --animation-easing: ease-in-out;
        }

        .container {
          display: block;
          overflow: hidden;
          transition-duration: var(--transition-speed);
          transition-easing: var(--animation-easing);
        }

        .content {
          display: block;
        }
      `,
		];
	}

	constructor() {
		super();

		const observer = new MutationObserver(() => {
			this.requestUpdate();
		});

		observer.observe(this, { subtree: true, childList: true });

		window.addEventListener('resize', () => {
			this.lastHeight = this.content?.offsetHeight;
			this.lastWidth = this.content?.offsetWidth;
		});
	}

	@query('.container')
	container!: HTMLElement;

	@query('slot')
	content!: HTMLElement;

	lastHeight = 0;
	lastWidth = 0;

	async updated() {
		const height = this.content?.offsetHeight;
		const width = this.content?.offsetWidth;
		if (this.lastHeight && this.lastWidth && height && width) {
			await this.container.animate(
				[
					{
						height: `${this.lastHeight}px`,
						width: `${this.lastWidth}px`,
					},
					{
						height: `${height}px`,
						width: `${width}px`,
					},
				],
				{
					duration: 330,
					easing: 'ease',
				}
			).finished;
		}
		this.lastHeight = height;
		this.lastWidth = width;
	}

	protected render(): HTMLTemplateResult {
		return html`
      <div class="container">
        <slot class="content"></slot>
      </div>
    `;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'a-adaptive': AdaptiveHeight;
	}
}

customElements.define('a-adaptive', AdaptiveHeight);

import { HTMLTemplateResult, LitElement, css, html } from 'lit';
import { query } from 'lit/decorators.js';

declare global {
	interface HTMLElementTagNameMap {
		'a-adaptive': AdaptiveElement;
	}
}

export class AdaptiveElement extends LitElement {
	public static get styles() {
		return [
			css`
        :host {
          display: block;
        }

        .content {
          display: block;
        }
      `,
		];
	}

	constructor() {
		super();

		const observer = new MutationObserver((cahgnes) => {
			this.requestUpdate();
		});

		observer.observe(this, { subtree: true, childList: true, characterData: true });

		window.addEventListener('resize', () => {
			this.lastHeight = this.content?.offsetHeight;
			this.lastWidth = this.content?.offsetWidth;
		});
	}

	@query('slot')
	content!: HTMLElement;

	lastHeight = 0;
	lastWidth = 0;

	async updated() {
		const height = this.content?.offsetHeight;
		const width = this.content?.offsetWidth;
		if (height && width) {
			await this.animate(
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
		return html`<slot class="content"></slot>`;
	}
}

customElements.define('a-adaptive', AdaptiveElement);

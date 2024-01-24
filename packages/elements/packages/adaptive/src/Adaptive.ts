import { HTMLTemplateResult, LitElement, css, html } from 'lit';
import { query } from 'lit/decorators.js';

declare global {
	interface HTMLElementTagNameMap {
		'a-adaptive': AdaptiveElement;
	}
}

/**
 * # a-adaptive
 *
 * - Inherits the size of its child
 * - Automatically reacts to changes in the child’s size
 * - Animated by default
 *
 * @see https://sv.pages.s-v.de/sv-frontend-library/mono/elements/a-adaptive/
 */
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

	observer!: MutationObserver;

	connectedCallback() {
		super.connectedCallback();

		if (typeof MutationObserver !== 'undefined') {
			this.observer = new MutationObserver((cahgnes) => {
				this.requestUpdate();
			});
			this.observer.observe(this, { subtree: true, childList: true, characterData: true });
		}

		window.addEventListener('resize', this.onResize);
	}

	disconnectedCallback(): void {
		super.disconnectedCallback();
		window.removeEventListener('resize', this.onResize);

		if (this.observer) this.observer.disconnect();
	}

	onResize = () => {
		this.lastHeight = this.content?.offsetHeight;
		this.lastWidth = this.content?.offsetWidth;
	};

	@query('slot')
	content!: HTMLElement;

	lastHeight = this.offsetHeight;
	lastWidth = this.offsetWidth;

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
					duration: 200,
					easing: 'ease-out',
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

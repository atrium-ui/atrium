import { HTMLTemplateResult, LitElement, css, html } from 'lit';
import { property } from 'lit/decorators.js';

declare global {
	interface HTMLElementTagNameMap {
		'a-expandable': Expandable;
	}
}

export class Expandable extends LitElement {
	public static get styles() {
		return [
			css`
        :host {
          display: block;

          --transition-speed: 0.33s;
          --animation-easing: ease;
        }

        .container {
          display: grid;
          grid-template-rows: 0fr;
					grid-template-columns: 100%;
          overflow: hidden;
          transition: grid-template-rows var(--transition-speed) var(--animation-easing);
        }

        :host([opened]) .container {
          grid-template-rows: 1fr;
        }

        .content {
          display: block;
          min-height: 0;
        }

        ::slotted(*) {
          pointer-events: all;
        }

        button {
          all: unset;
          display: block;
          width: 100%;
          pointer-events: none;
        }
      `,
		];
	}

	@property({ type: Boolean, reflect: true }) public opened = false;
	@property({ type: String, reflect: true }) public direction = 'down';

	private _id = `expandable_${Math.floor(Math.random() * 100000)}`;

	public close(): void {
		this.opened = false;
		this.onAnimationFrame();
	}

	public open(): void {
		this.opened = true;
		this.onAnimationFrame();
	}

	public toggle(): void {
		this.opened ? this.close() : this.open();
	}

	@property({ type: Number })
	public scrollOffsetY?: number;

	protected onAnimationFrame() {
		// scrolls interaction into viewport
		const rect = this.getClientRects()[0];
		if (rect) {
			const elementStartPosY = rect.y;
			const offsetY = this.scrollOffsetY || 0;
			if (elementStartPosY <= offsetY) {
				window.scrollBy(0, (elementStartPosY - offsetY) / 10);
			}
		}
	}

	private renderButton() {
		return html`<button
      aria-controls="${this._id}"
      aria-expanded=${this.opened}
      @click=${(e) => {
				this.toggle();
			}}
    >
      <slot name="toggle"></slot>
    </button>`;
	}

	protected render(): HTMLTemplateResult {
		return html`
      ${this.direction === 'down' ? this.renderButton() : undefined}
      <div class="container" id="${this._id}" aria-hidden=${!this.opened && 'true'}>
        <slot class="content"></slot>
      </div>
      ${this.direction === 'up' ? this.renderButton() : undefined}
    `;
	}
}

if (!customElements.get('a-expandable')) {
	customElements.define('a-expandable', Expandable);
}

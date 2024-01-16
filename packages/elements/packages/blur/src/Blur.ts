import { HTMLTemplateResult, LitElement, css, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { ScrollLock } from '@sv/scroll-lock';

declare global {
	interface HTMLElementTagNameMap {
		'a-blur': Blur;
	}
}

const scrollLock = new ScrollLock();

@customElement('a-blur')
export class Blur extends LitElement {
	public static styles = css`
    :host {
      display: block;
      transition-property: all;
      pointer-events: none;
    }

    :host([enabled]) {
      pointer-events: all;
    }
  `;

	@property({ type: Boolean, reflect: true })
	public enabled = false;

	@property({ type: Boolean, reflect: true })
	public scrollLock = false;

	@query('slot')
	slot;

	protected updated(): void {
		if (this.enabled) {
			scrollLock.enable();
			this.setAttribute('aria-hidden', 'false');
		} else {
			scrollLock.disable();
			this.setAttribute('aria-hidden', 'true');
		}
	}

	shouldBlur(e: MouseEvent) {
		if (e.target === this && this.contains(e.target as HTMLElement)) {
			return this.enabled;
		}
		return false;
	}

	handleClick = (e: MouseEvent) => {
		if (this.shouldBlur(e)) {
			this.dispatchEvent(new Event('blur'));
			this.enabled = false;
		}
	};

	handleCloseEvent = (e: Event) => {
		this.enabled = false;
	};

	connectedCallback(): void {
		super.connectedCallback();
		this.addEventListener('mousedown', this.handleClick);
		this.addEventListener('close', this.handleCloseEvent, { capture: true });
	}

	disconnectedCallback(): void {
		this.removeEventListener('mousedown', this.handleClick);
		this.removeEventListener('close', this.handleCloseEvent, { capture: true });

		// TODO: This call should be on a stack.
		//				So that if multiple blur elements are enabled, it only disables when all are disabled.
		scrollLock.disable();
	}

	render(): HTMLTemplateResult {
		return html`<slot></slot>`;
	}
}

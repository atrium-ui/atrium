import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';

declare global {
	interface HTMLElementTagNameMap {
		'a-toggle': Toggle;
	}
}

export class Toggle extends LitElement {
	static getChildValue(child: HTMLElement) {
		return child.getAttribute('value') || child.dataset.value;
	}

	@property({ type: String, attribute: 'active-attribute' })
	public activeAttribute = 'selected';

	// select multiple options
	@property({ type: Boolean, reflect: false })
	public multiple = false;

	public activeChildren: string[] = [];

	public get value() {
		return this.activeChildren;
	}

	public set value(items: string[]) {
		this.activeChildren = items;
		this.updateChildren();
	}

	private focusCallback(e) {
		let i = 0;
		for (const child of this.children) {
			if (child.contains(e.target)) {
				this.selected = i;
				this.onSelected();
				break;
			}
			i++;
		}
	}

	private onPress(e: MouseEvent) {
		e.stopPropagation();

		let contained = false;

		let i = 0;
		for (const child of this.children) {
			if (e.target === child || child.contains(e.target as HTMLElement)) {
				contained = true;

				const value = Toggle.getChildValue(child as HTMLElement) || i.toString();

				if (this.activeChildren.includes(value)) {
					this.activeChildren.splice(this.activeChildren.indexOf(value), 1);
				} else {
					this.activeChildren.push(value);
				}
			}

			i++;
		}

		if (!contained) return;

		if (!this.multiple) {
			this.activeChildren.splice(0, this.activeChildren.length - 1);
		}

		const ev = new Event('input', { bubbles: true, cancelable: true });
		this.dispatchEvent(ev);

		if (ev.defaultPrevented) return;

		this.updateChildren();
	}

	private updateChildren() {
		let index = 0;
		for (const child of this.children) {
			const value = Toggle.getChildValue(child as HTMLElement) || index.toString();

			if (this.activeChildren.map((v) => v.toString()).indexOf(value.toString()) !== -1) {
				child.setAttribute(this.activeAttribute, '');
			} else {
				child.removeAttribute(this.activeAttribute);
			}

			index++;
		}
	}

	public selected = -1;

	public selectNext() {
		this.selected = Math.min(this.selected + 1, this.children.length - 1);
		this.onSelected();
	}

	public selectPrev() {
		this.selected = Math.max(this.selected - 1, 0);
		this.onSelected();
	}

	private onSelected() {
		const child = this.children[this.selected] as HTMLElement;
		if (child) {
			child.focus();
		}
		this.updateChildren();
	}

	onKey(e) {
		const selected = document.activeElement;
		if (selected != null) {
			let nextChild = selected.nextElementSibling;
			if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
				nextChild = selected.previousElementSibling;
			}

			if (nextChild) {
				const currentRect = selected.getClientRects()[0];
				const nextRect = nextChild.getClientRects()[0];

				const xd = Math.abs(nextRect.x - currentRect.x);
				const yd = Math.abs(nextRect.y - currentRect.y);

				if (xd > yd) {
					if (e.key === 'ArrowLeft') {
						this.selectPrev();
					}
					if (e.key === 'ArrowRight') {
						this.selectNext();
					}
				} else {
					if (e.key === 'ArrowUp') {
						this.selectPrev();
					}
					if (e.key === 'ArrowDown') {
						this.selectNext();
					}
				}
			}
		}
	}

	protected updated(): void {
		this.updateChildren();
	}

	render() {
		return html`<slot />`;
	}

	connectedCallback(): void {
		super.connectedCallback();

		if (!this.activeChildren) {
			this.activeChildren = [];
		} else {
			this.updateChildren();
		}

		this.addEventListener('keyup', this.onKey, { capture: true });

		this.addEventListener('click', this.onPress);
		this.addEventListener('focus', this.focusCallback, { capture: true });
	}

	disconnectedCallback(): void {
		super.disconnectedCallback();

		this.removeEventListener('keyup', this.onKey, { capture: true });

		this.removeEventListener('click', this.onPress);
		this.removeEventListener('focus', this.focusCallback, { capture: true });
	}
}

customElements.define('a-toggle', Toggle);

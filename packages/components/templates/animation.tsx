// a jsx rive component, might need a custom element
import { Rive } from '@rive-app/canvas-single';

customElements.define(
	'a-animation',
	class extends HTMLElement {
		static get observedAttributes() {
			return ['src'];
		}

		attributeChangedCallback(name, oldValue, newValue) {
			console.log('attributeChangedCallback', name, oldValue, newValue);
		}

		connectedCallback() {
			Rive.new();
		}
	}
);

export function Animation() {
	return (
		<div>
			<a-animation src="./animation.riv" />
		</div>
	);
}

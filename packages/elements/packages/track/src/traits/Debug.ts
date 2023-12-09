import { Trait } from '../index.js';
import DebugElement from './DebugElement.js';

export class DebugTrait extends Trait {
	debug = new DebugElement();

	created(): void {
		this.entity.focus();

		if (this.enabled) {
			this.entity.shadowRoot?.append(this.debug);
		}
	}

	_enabled = this.enabled;

	// @ts-ignore
	set enabled(val) {
		if (this.debug) {
			if (val === true && !this.debug.parentElement) {
				this.entity.shadowRoot?.append(this.debug);
			} else {
				if (this.debug) this.debug.remove();
			}
		}

		this._enabled = val;
	}

	get enabled() {
		return this._enabled;
	}

	adds: (() => string)[] = [];

	display(id: number, f) {
		this.adds[id] = f;
	}

	update(): void {
		const e = this.entity;
		const arr = [
			[`pixelRatio: ${devicePixelRatio}`],
			[`width: ${e.trackWidth}`],
			[`items: ${e.itemCount}`],
			[`current: ${e.currentItem}`],
			[`currentPos: ${e.getToItemPosition(e.currentItem)}`],
			[`pos: ${e.position}`],
			['input;red', e.inputForce.abs()],
			[`target: ${e.targetForce}`],
			[`transtion: ${e.transition}`],
			[`items: ${e.itemWidths.join(', ')}`],
			...this.adds.map((f) => [f().toString()]),
		];

		let index = 0;
		for (const item of arr) {
			if (item.length > 1) {
				// @ts-ignore
				this.debug.plot(index, ...item);
			} else {
				this.debug.set(index, item[0]);
			}
			index++;
		}
	}
}

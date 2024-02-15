import { Trait } from "../Trait.js";

export class AutoFocusTrait extends Trait {
	created(): void {
		if (this.enabled) this.entity.focus();
	}
}

import { Trait } from "../Trait.js";

export class AutoFocusTrait extends Trait {
  created(): void {
    this.entity.focus();
  }
}

import { Trait } from "../Track.js";

export class AutoFocusTrait extends Trait {
  created(): void {
    if (this.enabled) this.entity.focus();
  }
}

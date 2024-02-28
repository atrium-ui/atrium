import { InputState } from "../Track.js";
import { Trait } from "../Trait.js";
import { timer } from "../utils.js";

export class AutoplayTrait extends Trait {
  autoPlayTimeout = 4000;
  defaultAutoPlayTime = 3000;
  autoPlayTimer;

  lastTarget;

  input(inputState: InputState) {
    if (this.lastTarget !== this.entity.target) {
      this.autoPlayTimer = Date.now();
      this.lastTarget = this.entity.target;
    }

    if (inputState.release.value) {
      this.autoPlayTimer = Date.now() + this.autoPlayTimeout;
    }
  }

  update() {
    const autoplayTime = this.entity.autoplay * 1000 || this.defaultAutoPlayTime;
    const slideTime = timer(this.autoPlayTimer, autoplayTime);
    if (slideTime >= 1) {
      this.entity.moveBy(1, "ease");
      this.entity.dispatchEvent(new Event("autoplay"));
    }
  }
}

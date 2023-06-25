import DebugElement from "./Debug.js";
import { InputState } from "./EntitySlider.js";
import { Ease, isTouch, timer } from "./utils.js";

export class Trait {
  id: string;
  enabled = false;

  entity;

  constructor(id, entity, defaultEnabled = false) {
    this.id = id;
    this.enabled = defaultEnabled;
    this.entity = entity;

    this.created();
  }

  created() {
    // ...
  }

  input(inputState: InputState) {
    // ...
  }

  update() {
    // ...
  }
}

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

  adds: any[] = [];

  display(id: number, f) {
    this.adds[id] = f;
  }

  update(): void {
    const e = this.entity;
    const arr = [
      [`fps: ${Math.floor(e.frameRate)}`],
      [`width: ${e.trackWidth}`],
      [`items: ${e.itemCount}`],
      [`current: ${e.currentItem}`],
      [`currentPos: ${e.getItemPosition(e.currentItem)}`],
      [`grab: ${e.mouseGrab}`],
      [`pos: ${e.positionX}`],
      ["input;red", Math.abs(e.inputForceX)],
      [`target: ${e.targetX}`],
      [`transtion: ${e.transitionAt}`],
      [`items: ${e.itemWidths.join(", ")}`],
      ...this.adds.map((f) => [f().toString()]),
    ];

    arr.forEach((item, index) => {
      if (item.length > 1) {
        // @ts-ignore
        this.debug.plot(index, ...item);
      } else {
        this.debug.set(index, item[0]);
      }
    });
  }
}

export class AutoFocusTrait extends Trait {
  created(): void {
    this.entity.focus();
  }
}

export class PointerTrait extends Trait {
  grabbing = false;

  input(inputState: InputState) {
    const e = this.entity;

    if (inputState.grab.value && !this.grabbing) {
      this.grabbing = true;
    }

    if (inputState.release.value) {
      this.grabbing = false;
    }

    if (inputState.move.value) {
      e.inputForceX = -inputState.move.value;
    } else {
      if (this.grabbing) {
        e.inputForceX = 0;
      }
    }

    const track = e.track;
    if (track) {
      track.style.transform = `translateX(${e.positionX.toFixed(2)}px)`;
      if (!isTouch()) {
        track.style.pointerEvents = this.grabbing ? "none" : "";
      }
    }
    if (!isTouch()) {
      e.style.cursor = this.grabbing ? "grabbing" : "";
    }

    // TODO: implicitly connected to another trait
    if (!e.loop) {
      // clamp input force
      const newPos = e.positionX + e.inputForceX;
      let clampedPos = newPos;
      const stopLeft = 1;
      const stopRight = -e.trackWidth + e.clientWidth;
      clampedPos = Math.min(stopLeft, clampedPos);
      clampedPos = Math.max(stopRight, clampedPos);

      const diff = newPos - clampedPos;
      // TODO: input force gets reset as long as there is a mouse event
      e.inputForceX -= diff;
    }
  }

  update() {
    const e = this.entity;

    if (!this.grabbing) {
      e.inputForceX *= 0.9;
    }
  }
}

export class SnapTrait extends Trait {
  input(inputState: InputState): void {
    if (inputState.release.value) {
      const e = this.entity;
      e.moveBy(Math.abs(e.inputForceX) > 2 ? -Math.sign(e.inputForceX) : 0, "linear");
    }
    if (inputState.swipe.value) {
      const e = this.entity;
      e.moveBy(Math.sign(inputState.swipe.value), "linear");
    }
  }
}

export class AutoplayTrait extends Trait {
  autoPlayTimeout = 4000;
  autoPlayTime = 3000;
  autoPlayTimer;

  input(inputState: InputState) {
    if (inputState.format.value) {
      const entity = this.entity;

      this.autoPlayTimer = Date.now();

      entity.moveBy(0, "linear");
    }

    if (inputState.release.value) {
      this.autoPlayTimer = Date.now() + this.autoPlayTimeout;
    }
  }

  update() {
    const slideTime = timer(this.autoPlayTimer, this.autoPlayTime);
    if (slideTime >= 1) {
      // this.entity.moveBy(1, "ease");
      // this.autoPlayTimer = Date.now();
    }
  }
}

export class AutorunTrait extends Trait {
  defaultSpeed = 1;
  defaultPauesTransitionTime = 1500;

  speed = this.defaultSpeed;
  dir = -1;
  pauseTransitionTime = this.defaultPauesTransitionTime;

  paused = true;
  transitionAt = Date.now();

  pause() {
    this.paused = true;
    this.transitionAt = Date.now();
  }

  unpause() {
    this.paused = false;
    this.transitionAt = Date.now();
    this.entity.setTarget(null);
  }

  input(inputState: InputState) {
    if (inputState.move.value) {
      this.dir = Math.sign(inputState.move.value);
    }

    if (inputState.enter.value) {
      !isTouch() && this.pause();
    }

    if (inputState.leave.value) {
      !isTouch() && this.unpause();
    }

    if (inputState.format.value) {
      if (isTouch()) {
        !this.paused && this.pause();
      } else {
        this.paused && this.unpause();
      }
    }
  }

  public update() {
    const entity = this.entity;
    if (!this.paused) {
      const transitionTime = timer(this.transitionAt, this.pauseTransitionTime);
      entity.acceleration = this.speed * this.dir * Ease.easeOutSine(transitionTime);
    }
  }
}

export class LoopTrait extends Trait {
  update() {
    const e = this.entity;

    const maxX = -e.trackWidth;
    e.positionX = e.positionX % maxX;
    if (e.positionX >= 0) {
      e.positionX = maxX;
    }
  }
}

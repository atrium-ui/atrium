import DebugElement from "./Debug.js";
import { InputState } from "./Track.js";
import { Ease, Vec, isTouch, timer } from "./utils.js";

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
      [`width: ${e.trackWidth}`],
      [`items: ${e.itemCount}`],
      [`current: ${e.currentItem}`],
      [`currentPos: ${e.getItemPosition(e.currentItem)}`],
      [`pos: ${e.position.x}`],
      ["input;red", Math.abs(e.inputForce.x)],
      [`target: ${e.target?.x}`],
      [`transtion: ${e.transition}`],
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

  updateCursorStyle() {
    const e = this.entity;
    const track = e.track;
    if (track) {
      if (!isTouch()) {
        track.style.pointerEvents = this.grabbing ? "none" : "";
      }
    } else if (!isTouch()) {
      e.style.cursor = this.grabbing ? "grabbing" : "";
    }
  }

  getClapmedDiff() {
    if (!this.entity.loop) {
      const e = this.entity;
      const newPos = Vec.add(e.position, e.inputForce);
      let clampedPos = newPos;

      const stopTop = 0;
      let stopBottom = -e.trackHeight + e.itemHeights[e.itemCount - 1];
      const stopLeft = 0;
      let stopRight = -e.trackWidth + e.itemWidths[e.itemCount - 1];

      if (e.overflow == "fill") {
        stopRight = -e.trackWidth + e.offsetWidth;
        stopBottom = -e.trackHeight + e.offsetHeight;
      }

      clampedPos = new Vec(
        Math.min(stopLeft, clampedPos.x),
        Math.min(stopTop, clampedPos.y)
      );
      clampedPos = new Vec(
        Math.max(stopRight, clampedPos.x),
        Math.max(stopBottom, clampedPos.y)
      );

      return Vec.sub(newPos, clampedPos);
    }
    return new Vec();
  }

  input(inputState: InputState) {
    const e = this.entity;

    if (e.overflow == "full" && e.overflowWidth < 0) {
      return;
    }

    if (inputState.grab.value && !this.grabbing) {
      this.grabbing = true;
    }

    if (inputState.release.value) {
      this.grabbing = false;
    }

    if (inputState.move.value.abs()) {
      e.inputForce.set(Vec.mul(inputState.move.value, -1));
    } else {
      if (this.grabbing) {
        e.inputForce.mul(0);
      }
    }

    // clamp input force
    const diff = this.getClapmedDiff();
    if (diff.abs()) {
      if (!this.grabbing) {
        // TODO: diff value is higher than the actual pixel diff
        e.inputForce.set(diff.mul(-1));
        e.inputForce.mul(1 / 10);
      } else {
        if (e.vertical) {
          e.inputForce.x = 0;
        } else {
          e.inputForce.y = 0;
        }

        if (e.vertical && diff.y) {
          e.inputForce.mul(0.2);
        } else if (diff.x) {
          e.inputForce.mul(0.2);
        }
      }
    }

    if (inputState.swipe.value.abs()) {
      e.inputForce.set(inputState.swipe.value.mul(-1));
      e.setTarget(undefined);

      const diff = this.getClapmedDiff();
      e.inputForce.add(diff.mul(-1));
    }

    this.updateCursorStyle();
  }

  update() {
    this.entity.inputForce.mul(0.9);
  }
}

export class SnapTrait extends Trait {
  input(inputState: InputState): void {
    const e = this.entity;

    if (inputState.release.value) {
      e.moveBy(0, "linear");
    }

    if (inputState.swipe.value.abs()) {
      if (inputState.swipe.value.abs() < 10) {
        e.moveBy(0, "linear");
      }
    }
  }
}

export class AutoplayTrait extends Trait {
  autoPlayTimeout = 4000;
  defaultAutoPlayTime = 3000;
  autoPlayTimer;

  lastTarget = null;

  input(inputState: InputState) {
    if (this.lastTarget !== this.entity.target) {
      this.autoPlayTimer = Date.now();
      this.lastTarget = this.entity.target;
    }

    if (inputState.format.value) {
      const entity = this.entity;
      entity.moveBy(0, "linear");
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
    }
  }
}

export class AutorunTrait extends Trait {
  defaultSpeed = 1;
  defaultPauesTransitionTime = 1500;

  speed = new Vec(this.defaultSpeed, this.defaultSpeed);
  dir = new Vec(-1, -1);
  pauseTransitionTime = this.defaultPauesTransitionTime;

  paused = false;
  transitionAt = Date.now();

  pause() {
    this.paused = true;
    this.transitionAt = Date.now();
  }

  unpause() {
    this.paused = false;
    this.transitionAt = Date.now();
    this.entity.setTarget(undefined);
  }

  input(inputState: InputState) {
    if (inputState.move.value.x) {
      this.dir.x = -Math.sign(inputState.move.value.x);
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
      entity.inputForce.x = this.speed.x * this.dir.x * Ease.easeOutSine(transitionTime);
    }
  }
}

export class LoopTrait extends Trait {
  update() {
    const e = this.entity;

    const startY = 0;
    const maxY = startY + -e.trackHeight;
    e.position.y = e.position.y % maxY;
    if (e.position.y >= startY) {
      e.position.y = maxY;
    }

    const startX = 0;
    const maxX = startX + -e.trackWidth;
    e.position.x = e.position.x % maxX;
    if (e.position.x >= startX) {
      e.position.x = maxX;
    }
  }
}

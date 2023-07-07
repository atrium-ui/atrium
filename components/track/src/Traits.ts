import DebugElement from "./Debug.js";
import { InputState, Track } from "./Track.js";
import { Ease, Vec, isTouch, timer } from "./utils.js";

export class Trait {
  id: string;
  enabled = false;

  entity: Track;

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
      [`pixelRatio: ${devicePixelRatio}`],
      [`width: ${e.trackWidth}`],
      [`items: ${e.itemCount}`],
      [`current: ${e.currentItem}`],
      [`currentPos: ${e.getToItemPosition(e.currentItem)}`],
      [`pos: ${e.position}`],
      ["input;red", Math.abs(e.inputForce.x)],
      [`target: ${e.target}`],
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
  force = new Vec();
  grabbedStart = new Vec();
  grabDelta = new Vec();

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
    const e = this.entity as Track;
    const newPos = Vec.add(e.position, e.inputForce);
    let clampedPos = newPos;

    const stopTop = 0;
    let stopBottom = -e.trackHeight + e.offsetHeight;
    const stopLeft = 0;
    let stopRight = -e.trackWidth + e.offsetWidth;

    if (e.overflow == "item") {
      stopBottom = -e.trackHeight + e.itemHeights[e.itemCount - 1];
      stopRight = -e.trackWidth + e.itemWidths[e.itemCount - 1];
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

  input(inputState: InputState) {
    const e = this.entity;

    if (e.overflowscroll && e.overflowWidth < 0) {
      return;
    }

    if (inputState.grab.value && !this.grabbing) {
      this.grabbing = true;
      this.grabbedStart.set(e.mousePos);
      this.entity.dispatchEvent(new Event("pointer:grab"));
    }

    if (e.mousePos.abs()) {
      this.grabDelta.set(e.mousePos).sub(this.grabbedStart);
    }

    if (inputState.release.value) {
      this.grabbing = false;
      this.entity.dispatchEvent(new Event("pointer:release"));
    }

    if (inputState.move.value.abs()) {
      this.force.set(inputState.move.value);
      e.inputForce.set(inputState.move.value);
    } else {
      if (this.grabbing) {
        e.inputForce.mul(0);
      }
    }

    // clamp input force
    if (!e.loop) {
      const diff = this.getClapmedDiff();
      if (diff.abs()) {
        if (!this.grabbing) {
          e.inputForce.set(diff.mul(-1));
          e.inputForce.mul(1 / 10);
        } else {
          if (e.vertical && Math.abs(diff.y)) {
            e.inputForce.mul(0.2);
          } else if (Math.abs(diff.x)) {
            e.inputForce.mul(0.2);
          }
        }
      }
    }

    if (inputState.swipe.value.abs()) {
      e.inputForce.set(inputState.swipe.value.mul(-1));
      e.setTarget(undefined);

      if (!e.loop) {
        const diff = this.getClapmedDiff();
        e.inputForce.add(diff.mul(-1));
      }

      if (e.snap) {
        if (inputState.swipe.value.abs() < 5) {
          e.moveBy(0, "linear");
        }
      }
    }

    if (e.snap) {
      if (inputState.release.value) {
        const power = this.grabDelta.abs();
        const slideRect = e.getCurrentSlideRect();
        const axes = e.vertical ? 1 : 0;

        if (power < slideRect[axes] / 2) {
          // short throw
          e.moveBy(1 * Math.sign(-this.force[axes]), "linear");
        } else {
          e.moveBy(0, "linear");
        }
      }
    }

    if (e.vertical) {
      e.inputForce.x = 0;
    } else {
      e.inputForce.y = 0;
    }

    this.updateCursorStyle();
  }

  update() {
    if (this.grabbing) {
      this.entity.acceleration.mul(0);
    }
  }
}

export class AutoplayTrait extends Trait {
  autoPlayTimeout = 4000;
  defaultAutoPlayTime = 3000;
  autoPlayTimer;

  lastTarget: any = null;

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
      this.entity.dispatchEvent(new Event("autoplay"));
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
    if (inputState.move.value.abs()) {
      this.dir.set(inputState.move.value).sign();
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
      entity.inputForce
        .add(this.speed)
        .mul(this.dir)
        .mul(Ease.easeOutSine(transitionTime))
        .mul(entity.normal);
    }
  }
}

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
  }

  input(inputState: InputState) {
    // ...
  }

  update() {
    // ...
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
      e.inputForceX = -inputState.move.detlaX;
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

export class AutoplayTrait extends Trait {
  defaultAutoplayTimeout = 4000;
  defaultAutoplayTime = 5000;

  autoPlay = false;
  autoPlayTimeout = this.defaultAutoplayTimeout;
  autoPlayTime = this.defaultAutoplayTime;
  autoPlayTimer;

  input(inputState: InputState) {
    if (inputState.format.value) {
      const entity = this.entity;

      this.autoPlayTimer = Date.now();

      if (isTouch()) {
        this.autoPlay = true;
        entity.moveBy(0, "linear");
      } else {
        this.autoPlay = false;
      }
    }

    if (inputState.release.value) {
      if (isTouch()) {
        this.autoPlay = true;

        this.autoPlayTimer = Date.now() + this.autoPlayTimeout;

        const ent = this.entity;
        ent.moveBy(
          Math.abs(ent.acceleration) > 10 ? -Math.sign(ent.acceleration) : 0,
          "linear"
        );
      }
    }
  }

  update() {
    if (this.autoPlay) {
      const slideTime = timer(this.autoPlayTimer, this.autoPlayTime);
      if (slideTime >= 1) {
        this.entity.moveBy(1, "ease");
        this.autoPlayTimer = Date.now();
      }
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
      this.dir = Math.sign(inputState.move.detlaX);
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

import { InputState } from "./EntitySlider.js";
import { Ease, isTouch, timer } from "./utils.js";

export class Trait {
  id: string;
  enabled = false;

  entity;

  constructor(id, entity) {
    this.id = id;
    this.entity = entity;
  }

  input(inputState: InputState) {
    // ...
  }

  update(deltaTick: number) {
    // ...
  }
}

export class PointerTrait extends Trait {
  enabled = true;

  grabbing = false;

  grabStartX = 0;
  grabStartMouseX = 0;

  input(inputState: InputState) {
    const entity = this.entity;

    if (inputState.grab.pressed && !this.grabbing) {
      this.grabbing = true;
      this.grabStartX = entity.positionX;
      this.grabStartMouseX = entity.mouseX;
    }

    if (inputState.release.pressed) {
      this.grabbing = false;
    }

    if (inputState.move.pressed) {
      if (this.grabbing) {
        const mouseDiffX = entity.mouseX - this.grabStartMouseX;
        const posDiffX = this.grabStartX + mouseDiffX;
        entity.inputForceX = posDiffX - entity.positionX;
      } else {
        entity.inputForceX *= 0;
      }

      entity.inputForceX += -inputState.move.detlaX;
    } else {
      if (this.grabbing) {
        entity.inputForceX = 0;
      }
    }

    const track = entity.track;
    if (track) {
      track.style.transform = `translateX(${entity.positionX.toFixed(2)}px)`;
      if (!isTouch()) {
        track.style.pointerEvents = this.grabbing ? "none" : "";
      }
    }
    if (!isTouch()) {
      entity.style.cursor = this.grabbing ? "grabbing" : "";
    }
  }

  update() {
    const entity = this.entity;

    // clamp input force
    const newPos = entity.positionX + entity.inputForceX;
    let clampedPos = newPos;
    const stopLeft = 0;
    const stopRight = -entity.trackWidth + entity.clientWidth;
    clampedPos = Math.min(stopLeft, clampedPos);
    clampedPos = Math.max(stopRight, clampedPos);

    const diff = newPos - clampedPos;
    entity.inputForceX -= diff;

    if (!this.grabbing) {
      entity.inputForceX *= 0.9;
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
    if (inputState.format.pressed) {
      const entity = this.entity;

      this.autoPlayTimer = Date.now();

      if (isTouch()) {
        this.autoPlay = true;
        entity.moveBy(0, "linear");
      } else {
        this.autoPlay = false;
      }
    }

    if (inputState.release.pressed) {
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

  update(deltaTick) {
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
    if (inputState.move.pressed) {
      this.dir = Math.sign(inputState.move.detlaX);
    }

    if (inputState.enter.pressed) {
      !isTouch() && this.pause();
    }

    if (inputState.leave.pressed) {
      !isTouch() && this.unpause();
    }

    if (inputState.format.pressed) {
      if (isTouch()) {
        !this.paused && this.pause();
      } else {
        this.paused && this.unpause();
      }
    }
  }

  public update(deltaTick) {
    const entity = this.entity;
    if (!this.paused) {
      const transitionTime = timer(this.transitionAt, this.pauseTransitionTime);
      entity.acceleration =
        this.speed * this.dir * Ease.easeOutSine(transitionTime) * (deltaTick * 10);
    }
  }
}

export class LoopTrait extends Trait {
  update() {
    const entity = this.entity;
    // loop in front and back trait
    const maxX = -entity.width;
    entity.positionX = entity.positionX % maxX;
    if (entity.positionX >= 0) {
      entity.positionX = maxX;
    }
  }
}

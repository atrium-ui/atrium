import { Ease, isTouch, timer } from "./utils.js";

export class Trait {
  entity;

  constructor(entity) {
    this.entity = entity;
    this.onCreate();
  }

  onCreate() {
    //
  }

  public update(deltaTick: number) {
    //
  }

  public input(input: any) {
    const handlerName = "on" + input.type[0].toLocaleUpperCase() + input.type.slice(1);
    if (handlerName in this) this[handlerName](input);
  }
}

export class AutoplayTrait extends Trait {
  defaultAutoplayTimeout = 2000;
  defaultAutoplayTime = 3000;

  autoPlay = false;
  autoPlayTimeout = this.defaultAutoplayTimeout;
  autoPlayTime = this.defaultAutoplayTime;
  autoPlayTimer;

  onFormat() {
    const entity = this.entity;

    this.autoPlayTimer = Date.now();

    if (isTouch()) {
      this.autoPlay = true;
      entity.moveBy(0, "linear");
    } else {
      this.autoPlay = false;
    }
  }

  onRelease() {
    if (isTouch()) {
      this.autoPlay = true;

      this.autoPlayTimer = Date.now() + this.autoPlayTimeout;

      const ent = this.entity;
      ent.moveBy(Math.abs(ent.acceleration) > 5 ? -Math.sign(ent.acceleration) : 0, "linear");
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

  onCreate(): void {
    this.entity.autorun = this;
  }

  pause() {
    this.paused = true;
    this.transitionAt = Date.now();
  }

  unpause() {
    this.paused = false;
    this.transitionAt = Date.now();
    this.entity.setTarget(null);
  }

  onMove(e) {
    this.dir = Math.sign(e.deltaX);
  }

  onEnter() {
    !isTouch() && this.pause();
  }

  onLeave() {
    !isTouch() && this.unpause();
  }

  onFormat() {
    if (isTouch()) {
      !this.paused && this.pause();
    } else {
      this.paused && this.unpause();
    }
  }

  update(deltaTick) {
    const entity = this.entity;
    if (!this.paused) {
      const transitionTime = timer(this.transitionAt, this.pauseTransitionTime);
      entity.acceleration =
        this.speed * this.dir * Ease.easeOutSine(transitionTime) * (deltaTick * 10);
    }
  }
}

export class LoopTrait extends Trait {
  update(deltaTick) {
    const entity = this.entity;
    // loop in front and back trait
    const maxX = -entity.getGridWidth();
    entity.positionX = entity.positionX % maxX;
    if (entity.positionX >= 0) {
      entity.positionX = maxX;
    }
  }
}

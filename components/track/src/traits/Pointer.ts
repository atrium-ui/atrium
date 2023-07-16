import { InputState, Track } from "../Track.js";
import { Trait } from "../Trait.js";
import { Vec, isTouch } from "../utils.js";

export class PointerTrait extends Trait {
  grabbing = false;
  force = new Vec();
  grabbedStart = new Vec();
  grabDelta = new Vec();

  borderBounce = -0.1;
  borderResistnce = 0.8;

  updateCursorStyle() {
    const e = this.entity;
    const track = e.track;
    if (track) {
      if (!isTouch()) {
        track.style.pointerEvents = this.grabbing ? "none" : "";
      }
    }
    if (!isTouch()) {
      e.style.cursor = this.grabbing ? "grabbing" : "";
    }
  }

  getClapmedDiff() {
    const e = this.entity as Track;
    const newPos = Vec.add(e.position, e.inputForce);
    let clampedPos = newPos;

    let stopTop = 0;
    let stopBottom = 0;
    let stopLeft = 0;
    let stopRight = 0;

    if (e.snap) {
      // overflow item
      stopBottom = e.trackHeight - e.itemHeights[e.itemCount - 1];
      stopRight = e.trackWidth - e.itemWidths[e.itemCount - 1];
    } else {
      // overflow fill
      stopBottom = e.trackHeight - e.offsetHeight;
      stopRight = e.trackWidth - e.offsetWidth;
    }

    if (e.align == "left") {
      clampedPos = new Vec(
        Math.min(stopRight, clampedPos.x),
        Math.min(stopBottom, clampedPos.y)
      );
      clampedPos = new Vec(
        Math.max(stopLeft, clampedPos.x),
        Math.max(stopTop, clampedPos.y)
      );
    } else {
      clampedPos = new Vec(
        Math.max(stopLeft, clampedPos.x),
        Math.max(stopTop, clampedPos.y)
      );
      clampedPos = new Vec(
        Math.min(stopRight, clampedPos.x),
        Math.min(stopBottom, clampedPos.y)
      );
    }

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
      this.force.set(inputState.move.value).mul(-1);
      e.inputForce.set(inputState.move.value).mul(-1);
    } else {
      if (this.grabbing) {
        e.inputForce.mul(0);
      }
    }

    if (inputState.swipe.value.abs()) {
      e.inputForce.set(inputState.swipe.value.mul(0.2));
      e.setTarget(undefined);

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
          e.moveBy(1 * Math.sign(this.force[axes]), "linear");
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
    const e = this.entity;

    if (this.grabbing) {
      this.entity.acceleration.mul(0);
    }

    const bounce = !e.loop ? this.borderBounce : 0;
    const resitance = !e.loop ? 1 - this.borderResistnce : 1;

    // clamp input force
    const diff = this.getClapmedDiff();

    if (diff.abs()) {
      if (this.grabbing) {
        if (e.vertical && Math.abs(diff.y)) {
          e.inputForce.mul(resitance);
        } else if (Math.abs(diff.x)) {
          e.inputForce.mul(resitance);
        }
      }
    }

    if (bounce && diff.abs() && !this.grabbing) {
      if (e.vertical && Math.abs(diff.y)) {
        e.inputForce.add(diff.mul(bounce).sub(Vec.add(e.acceleration, e.inputForce)));
      } else if (Math.abs(diff.x)) {
        e.inputForce.add(diff.mul(bounce).sub(Vec.add(e.acceleration, e.inputForce)));
      }
    }
  }
}

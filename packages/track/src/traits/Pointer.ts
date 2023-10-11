import { InputState, Track } from '../Track.js';
import { Trait } from '../Trait.js';
import { Vec, isTouch } from '../utils.js';

export class PointerTrait extends Trait {
  grabbing = false;
  force = new Vec();
  grabbedStart = new Vec();
  grabDelta = new Vec();

  borderBounce = 0.1;
  borderResistnce = 0.3;

  updateCursorStyle() {
    const e = this.entity;
    const track = e.track;
    if (track) {
      if (!isTouch()) {
        track.style.pointerEvents = this.grabbing ? 'none' : '';
      }
    }
    if (!isTouch()) {
      e.style.cursor = this.grabbing ? 'grabbing' : '';
    }
  }

  input(inputState: InputState) {
    const e = this.entity;

    if (e.overflowscroll && e.overflowWidth < 0) {
      return;
    }

    if (inputState.grab.value && !this.grabbing) {
      this.grabbing = true;
      this.grabbedStart.set(e.mousePos);
      this.entity.dispatchEvent(new Event('pointer:grab'));
      this.entity.setTarget(undefined);
    }

    if (e.mousePos.abs()) {
      this.grabDelta.set(e.mousePos).sub(this.grabbedStart);
    }

    if (inputState.release.value) {
      this.grabbing = false;
      this.entity.dispatchEvent(new Event('pointer:release'));
    }

    if (inputState.move.value.abs()) {
      this.force.set(inputState.move.value).mul(-1);
      e.inputForce.set(inputState.move.value).mul(-1);
    } else {
      if (this.grabbing) {
        e.inputForce.mul(0);
      }
    }

    if (e.snap) {
      const accel = e.acceleration.abs();

      const force = this.grabDelta.abs();
      const slideRect = e.getCurrentSlideRect();
      const axes = e.vertical ? 1 : 0;

      const forceToSizeRatio = force / slideRect[axes];

      if (!this.grabbing && !e.target) {
        // this ration might not be perfect for every size
        if (accel * forceToSizeRatio < 1) {
          e.moveBy(0, 'linear');
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

  getClapmedPosition(pos: Vec) {
    const e = this.entity as Track;
    let clampedPos = pos;

    const stopTop = 0;
    let stopBottom = 0;
    const stopLeft = 0;
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

    if (e.align === 'left') {
      clampedPos = new Vec(Math.min(stopRight, clampedPos.x), Math.min(stopBottom, clampedPos.y));
      clampedPos = new Vec(Math.max(stopLeft, clampedPos.x), Math.max(stopTop, clampedPos.y));
    } else {
      clampedPos = new Vec(Math.max(stopLeft, clampedPos.x), Math.max(stopTop, clampedPos.y));
      clampedPos = new Vec(Math.min(stopRight, clampedPos.x), Math.min(stopBottom, clampedPos.y));
    }

    return clampedPos;
  }

  update() {
    const e = this.entity;

    if (this.grabbing) {
      this.entity.acceleration.mul(0);
    }

    const bounce = !e.loop ? this.borderBounce : 0;
    let resitance = !e.loop ? this.borderResistnce : 0;

    // clamp input force
    const pos = Vec.add(e.position, e.inputForce);
    const clamped = this.getClapmedPosition(pos);
    const diff = Vec.sub(pos, clamped);

    resitance = (1 - Math.abs(diff.x) / 200) * resitance;

    if (resitance && diff.abs()) {
      if (this.grabbing) {
        if (e.vertical && Math.abs(diff.y)) {
          e.inputForce.mul(resitance);
        } else if (Math.abs(diff.x)) {
          e.inputForce.mul(resitance);
        }
      }
    }

    if (bounce && diff.abs() && !this.grabbing) {
      if ((e.vertical && Math.abs(diff.y)) || Math.abs(diff.x)) {
        e.inputForce.sub(diff.mul(bounce));
        e.acceleration.mul(0);
      }
    }
  }
}

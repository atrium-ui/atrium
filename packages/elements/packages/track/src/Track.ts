import { LitElement, css, html } from "lit";
import { property } from "lit/decorators/property.js";
import { query } from "lit/decorators/query.js";

export type InputState = {
  grab: {
    value: boolean;
  };
  move: {
    value: Vec;
  };
  release: {
    value: boolean;
  };
  format: {
    value: boolean;
  };
  leave: {
    value: boolean;
  };
  enter: {
    value: boolean;
  };
};

function mod(a, n) {
  return a - Math.floor(a / n) * n;
}

function angleDist(a, b) {
  return mod(b - a + 180, 360) - 180;
}

export function timer(start, time) {
  return Math.min((Date.now() - start) / time, 1);
}

export type Easing = "ease" | "linear" | "none";

export const Ease = {
  easeInOutCirc(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
  },
  easeOutSine(x) {
    return Math.sin((x * Math.PI) / 2);
  },
};

export function isTouch() {
  return !!navigator.maxTouchPoints || "ontouchstart" in window;
}

type VecOrNumber = Vec | number[] | number;

export class Vec extends Array {
  constructor(x: VecOrNumber = 0, y = 0) {
    super();

    if (Vec.isVec(x)) {
      this[0] = x[0];
      this[1] = x[1];
    } else {
      this[0] = x;
      this[1] = y;
    }
  }

  get x() {
    return this[0];
  }

  set x(x: number) {
    this[0] = x;
  }

  get y() {
    return this[1];
  }

  set y(y: number) {
    this[1] = y;
  }

  get xy() {
    return [this[0], this[1]];
  }

  set xy(xy: number[]) {
    this[0] = xy[0];
    this[1] = xy[1];
  }

  add(vec: VecOrNumber) {
    if (Vec.isVec(vec)) {
      this[0] += vec[0];
      this[1] += vec[1];
    } else {
      this[0] += vec;
      this[1] += vec;
    }
    return this;
  }

  sub(vec: VecOrNumber) {
    if (Vec.isVec(vec)) {
      this[0] -= vec[0];
      this[1] -= vec[1];
    } else {
      this[0] -= vec;
      this[1] -= vec;
    }
    return this;
  }

  mul(vec: VecOrNumber) {
    if (Vec.isVec(vec)) {
      this[0] *= vec[0];
      this[1] *= vec[1];
    } else {
      this[0] *= vec;
      this[1] *= vec;
    }
    return this;
  }

  set(vec: VecOrNumber) {
    if (Vec.isVec(vec)) {
      this[0] = vec[0];
      this[1] = vec[1];
    } else {
      this[0] = vec;
      this[1] = vec;
    }
    return this;
  }

  mod(vec: VecOrNumber) {
    if (Vec.isVec(vec)) {
      this[0] = this[0] % vec[0];
      this[1] = this[1] % vec[1];
    } else {
      this[0] = this[0] % vec;
      this[1] = this[1] % vec;
    }
    return this;
  }

  sign() {
    this[0] = Math.sign(this[0]);
    this[1] = Math.sign(this[1]);
    return this;
  }

  dist(vec: Vec) {
    return Math.sqrt((vec[0] - this[0]) ** 2 + (vec[1] - this[1]) ** 2);
  }

  abs() {
    return Math.sqrt(this[0] ** 2 + this[1] ** 2);
  }

  abs2() {
    this[0] = Math.abs(this[0]);
    this[1] = Math.abs(this[1]);
    return this;
  }

  precision(precision: number) {
    this[0] = Math.floor(this[0] / precision) * precision;
    this[1] = Math.floor(this[1] / precision) * precision;
  }

  floor() {
    this[0] = Math.floor(this[0]);
    this[1] = Math.floor(this[1]);
    return this;
  }

  clone() {
    return new Vec(this);
  }

  static add(vec1: VecOrNumber, vec2: VecOrNumber) {
    if (Vec.isVec(vec1)) {
      return new Vec(vec1[0], vec1[1]).add(vec2);
    }
    return new Vec(vec1, vec1).add(vec2);
  }

  static sub(vec1: VecOrNumber, vec2: VecOrNumber) {
    if (Vec.isVec(vec1)) {
      return new Vec(vec1[0], vec1[1]).sub(vec2);
    }
    return new Vec(vec1, vec1).sub(vec2);
  }

  static mul(vec1: VecOrNumber, vec2: VecOrNumber) {
    if (Vec.isVec(vec1)) {
      return new Vec(vec1[0], vec1[1]).mul(vec2);
    }
    return new Vec(vec1, vec1).mul(vec2);
  }

  static abs(vec: Vec) {
    return new Vec(vec.x, vec.y).abs();
  }

  static isVec = Array.isArray;

  toString(): string {
    return `Vec{${this.join(",")}}`;
  }
}

export class Trait {
  id: string;
  enabled = true;

  entity: Track;

  constructor(id: string, entity: Track) {
    this.id = id;
    this.entity = entity;

    this.created();
  }

  created() {
    // ...
  }

  start() {
    // called on animation start
  }

  stop() {
    // called on animation stop
  }

  input(inputState: InputState) {
    // input tick
  }

  update() {
    // update tick (fixed tickrate)
  }
}

export class PointerTrait extends Trait {
  grabbing = false;
  grabbedStart = new Vec();
  grabDelta = new Vec();

  borderBounce = 0.1;
  borderResistance = 0.3;

  constructor(
    id: string,
    entity: Track,
    options: {
      borderBounce?: number;
      borderResistance?: number;
    } = {},
  ) {
    super(id, entity);

    this.borderBounce = options.borderBounce ?? this.borderBounce;
    this.borderResistance = options.borderResistance ?? this.borderResistance;
  }

  moveVelocity = new Vec();

  input(inputState: InputState) {
    const e = this.entity;

    if (e.overflowscroll && e.overflowWidth < 0) {
      return;
    }

    if (inputState.grab.value && !this.grabbing) {
      this.grabbing = true;
      this.grabbedStart.set(e.mousePos);
      this.entity.dispatchEvent(new Event("pointer:grab"));
      this.entity.setTarget(undefined);
    }

    if (e.mousePos.abs()) {
      this.grabDelta.set(e.mousePos).sub(this.grabbedStart);
    }

    if (inputState.release.value) {
      this.grabbing = false;
      this.entity.dispatchEvent(new Event("pointer:release"));
    }

    this.moveVelocity.mul(0.3);

    if (this.grabbing) {
      if (inputState.move.value.abs()) {
        this.moveVelocity.add(inputState.move.value);
        e.inputForce.set(inputState.move.value).mul(-1);
      } else {
        if (this.grabbing) {
          e.inputForce.mul(0);
        }
      }
    }

    if (inputState.release.value) {
      e.inputForce.set(this.moveVelocity.clone().mul(-1));
    }

    // prevent moving in wrong direction
    if (e.vertical) {
      e.inputForce.x = 0;
    } else {
      e.inputForce.y = 0;
    }

    e.slotElement.style.pointerEvents = this.grabbing ? "none" : "";
    if (!isTouch()) e.style.cursor = this.grabbing ? "grabbing" : "";
  }

  update() {
    const e = this.entity;
    if (e.scrolling) return;

    // clamp input force
    const pos = Vec.add(e.position, e.inputForce);
    const clamped = this.getClapmedPosition(pos);
    const diff = Vec.sub(pos, clamped);

    const resitance = (!e.loop ? this.borderResistance : 0) * (1 - diff.abs() / 200);
    if (diff.abs() && this.grabbing) {
      if (e.vertical) {
        e.inputForce.mul(resitance);
      } else {
        e.inputForce.mul(resitance);
      }
    }

    const bounce = !e.loop ? this.borderBounce : 0;
    if (bounce && diff.abs() && !this.grabbing) {
      if ((e.vertical && Math.abs(diff.y)) || Math.abs(diff.x)) {
        e.inputForce.sub(diff.mul(bounce));
        e.acceleration.mul(0);
      }
    }

    if (!this.grabbing) {
      e.acceleration.add(e.inputForce);
    } else {
      e.acceleration.mul(0);
    }
  }

  getClapmedPosition(pos: Vec) {
    const e = this.entity as Track;
    let clampedPos = pos;

    const stopTop = 0;
    const stopLeft = 0;
    let stopBottom = 0;
    let stopRight = 0;

    stopBottom = e.trackHeight - e.offsetHeight;
    stopRight = e.trackWidth - e.offsetWidth;

    const align = e.align || "start";

    switch (align) {
      case "end":
        clampedPos = new Vec(
          Math.max(stopLeft, clampedPos.x),
          Math.max(stopTop, clampedPos.y),
        );
        clampedPos = new Vec(
          Math.min(stopRight, clampedPos.x),
          Math.min(stopBottom, clampedPos.y),
        );
        break;
      default:
        clampedPos = new Vec(
          Math.min(stopRight, clampedPos.x),
          Math.min(stopBottom, clampedPos.y),
        );
        clampedPos = new Vec(
          Math.max(stopLeft, clampedPos.x),
          Math.max(stopTop, clampedPos.y),
        );
        break;
    }

    return clampedPos;
  }
}

export class SnapTrait extends Trait {
  input() {
    const e = this.entity;

    if (!e.grabbing && !e.scrolling) {
      if (e.deltaVelocity.x < 0 || e.deltaVelocity.y < 0) {
        // slows down
        if (e.velocity.abs() < 1 && !e.target) {
          e.setTarget(e.getClosestItemPosition());
        }
      }
    }
  }
}

/**
 * # a-track
 *
 * - A Track is a custom element that provides a interface for scrolling content.
 * - It can be used to create carousels, slideshows, and other scrolling elements.
 * - It provides functions to go to a specific child element, emits events on changes, and optimizes ux based input device.
 *
 * ## Props
 *
 * @attribute snap (default: false) - Whether the track should snap to the closest child element.
 * @attribute loop (default: false) - Whether the track should loop back to the start when reaching the end.
 * @attribute vertical (default: false) - Whether the track should scroll vertically.
 * @attribute align (default: "left") - The alignment of the track. Can be "left" or "right".
 *
 * @example
 * ```html
 * <a-track snap class="flex w-full overflow-visible">
 *   <div class="flex-none w-full">
 *     <canvas width={720} height={480} class="w-full bg-slate-400 m-1" />
 *   </div>
 *   <div class="flex-none w-full">
 *     <canvas width={720} height={480} class="w-full bg-slate-400 m-1" />
 *   </div>
 * </a-track>
 * ```
 */
export class Track extends LitElement {
  static get styles() {
    return css`
      :host {
        display: flex;
        outline: none;
        overflow: hidden;
        touch-action: pan-y;
      }

      slot {
        display: inherit;
        flex-direction: inherit;
        flex-flow: inherit;
        justify-content: inherit;
        align-items: inherit;
        will-change: transform;
        min-width: 100%;
      }

      :host([vertical]) {
        flex-direction: column;
      }

      :host {
        overscroll-behavior: contain;
        scrollbar-width: none;
      }

      ::-webkit-scrollbar {
        width: 0px;
        height: 0px;
        background: transparent;
        display: none;
      }
    `;
  }

  render() {
    return html`<slot @slotchange=${this.onSlotChange}></slot>`;
  }

  public traits: Trait[] = [
    //
    // new SnapTrait("snap", this),
    new PointerTrait("pointer", this),
  ];

  protected updated(): void {
    const snapTrait = this.findTrait<SnapTrait>("snap");
    if (snapTrait) {
      snapTrait.enabled = this.snap;
    }
  }

  @query("slot")
  slotElement!: HTMLSlotElement;

  public get itemCount() {
    if (this.children) {
      return this.children.length - this.clones.length;
    }
    return 0;
  }

  private getItemRects() {
    return new Array(this.itemCount)
      .fill(0)
      .map((_, i) => new Vec(this.itemWidths[i], this.itemHeights[i]));
  }

  public getClosestItemPosition() {
    const posPrev = this.getToItemPosition(this.currentItem - 1);
    const posCurr = this.getToItemPosition(this.currentItem);
    const posNext = this.getToItemPosition(this.currentItem + 1);

    const prev = posPrev.clone().sub(this.position).abs();
    const curr = posCurr.clone().sub(this.position).abs();
    const next = posNext.clone().sub(this.position).abs();

    switch (Math.min(curr, next, prev)) {
      case prev:
        return posPrev;
      case next:
        return posNext;
      default:
        return posCurr;
    }
  }

  private _widths: number[] | undefined;
  private get itemWidths() {
    if (!this._widths) {
      this._widths = new Array(this.itemCount).fill(1).map((_, i) => {
        return (this.children[i] as HTMLElement)?.offsetWidth || 0;
      });
    }
    return this._widths;
  }

  private _heights: number[] | undefined;
  private get itemHeights() {
    if (!this._heights) {
      this._heights = new Array(this.itemCount).fill(1).map((_, i) => {
        return (this.children[i] as HTMLElement)?.offsetHeight || 0;
      });
    }
    return this._heights;
  }

  public get trackWidth() {
    if (!this.vertical) {
      return this.itemWidths.reduce((last, curr) => last + curr, 0);
    }
    return this.offsetWidth;
  }

  public get trackHeight() {
    if (this.vertical) {
      return this.itemHeights.reduce((last, curr) => last + curr, 0);
    }
    return this.offsetHeight;
  }

  public get currentPosition() {
    return this.vertical ? this.position.y : this.position.x;
  }

  public get overflowWidth() {
    return this.trackWidth - this.offsetWidth;
  }

  public get overflowHeight() {
    return this.trackHeight - this.offsetHeight;
  }

  public currentItem = 0;

  public get value() {
    return this.currentItem % this.itemCount;
  }

  public set value(index: string | number) {
    const i = +index;
    this.currentItem = i;
    const pos = this.getToItemPosition(i);
    if (pos) this.setTarget(pos);
  }

  private animation: number | undefined;
  private tickRate = 1000 / 144;
  private lastTick = 0;
  private accumulator = 0;

  public grabbing = false;
  private scrollTimeout;

  public scrolling = false;
  public mousePos = new Vec();
  public inputForce = new Vec();

  public origin = new Vec();
  private lastPosition = new Vec();
  public position = new Vec();
  private lastVelocity = new Vec();
  public velocity = new Vec();
  public acceleration = new Vec();
  public direction = new Vec();

  public drag = 0.95;

  public target?: Vec;
  private targetForce = new Vec();
  private targetStart = new Vec();
  private targetEasing: Easing = "linear";

  private transitionAt = 0;
  private transitionTime = 750;
  private transition = 0;

  private inputState: InputState = {
    grab: {
      value: false,
    },
    release: {
      value: false,
    },
    move: {
      value: new Vec(), // delta
    },
    format: {
      value: false,
    },
    leave: {
      value: false,
    },
    enter: {
      value: false,
    },
  };

  public trait(callback: (t) => void) {
    for (const t of this.traits) {
      try {
        if (t?.enabled) {
          callback(t);
        }
      } catch (err) {
        console.error(`Error in trait '${t.id}': ${(err as Error).message}`);
      }
    }
  }

  public addTrait(id: string, TraitType: typeof Trait) {
    const trait = new TraitType(id, this);
    if (trait instanceof Trait) {
      this.traits.unshift(trait);
    }
  }

  public removeTrait(trait: Trait) {
    this.traits.splice(this.traits.indexOf(trait), 1);
  }

  public findTrait<T extends Trait>(id: string): T | undefined {
    for (const trait of this.traits) {
      if (trait.id === id) {
        return trait as T;
      }
    }
    return undefined;
  }

  @property({ type: Boolean, reflect: true }) vertical = false;
  @property({ type: Boolean, reflect: true }) loop = false;

  /**
   * Enable snapping to items
   */
  @property({ type: Boolean, reflect: true }) snap = false;

  /**
   * item alignment in the track. "start" (left/top) or "end" (right/bottom)
   */
  @property({ type: String }) align: "start" | "end" = "start";

  /**
   * only scroll when items are overflown
   */
  @property({ type: Boolean, reflect: true }) overflowscroll = false;

  private pointerEnter = (e) => {
    this.inputState.enter.value = true;
  };

  private pointerLeave = (e) => {
    this.inputState.leave.value = true;
  };

  private pointerDown = (e) => {
    this.mousePos.x = e.x;
    this.mousePos.y = e.y;

    this.setTarget(undefined);
  };

  private pointerUp = (e) => {
    this.mousePos.mul(0);

    if (this.grabbing) {
      this.grabbing = false;
      e.preventDefault();

      this.inputState.release.value = true;
    }
  };

  private pointerMove = (pointerEvent: PointerEvent) => {
    const moveEvent = new CustomEvent("move");
    this.dispatchEvent(moveEvent);

    if (moveEvent.defaultPrevented) {
      return;
    }

    const pos = new Vec(pointerEvent.x, pointerEvent.y);
    const delta = Vec.sub(pos, this.mousePos);

    if (!this.grabbing && delta.abs() > 3) {
      if (this.vertical && this.mousePos.y && Math.abs(delta.x) < Math.abs(delta.y)) {
        this.grabbing = true;
        this.inputState.grab.value = true;
      } else if (this.mousePos.x && Math.abs(delta.y) < Math.abs(delta.x)) {
        this.grabbing = true;
        this.inputState.grab.value = true;
      }
    }

    if (this.grabbing) {
      this.inputState.move.value.add(delta.clone());
      this.mousePos.set(pos);
    }

    pointerEvent.preventDefault();
  };

  private onWheel = (wheelEvent: WheelEvent) => {
    const moveEvent = new CustomEvent("move");
    this.dispatchEvent(moveEvent);

    if (moveEvent.defaultPrevented) {
      return;
    }

    if (wheelEvent.target !== this) {
      this.setTarget(undefined);
      clearTimeout(this.scrollTimeout);

      this.scrolling = true;
      this.scrollTimeout = setTimeout(() => {
        this.scrolling = false;
      }, 200);
    }

    const threshold = this.vertical
      ? Math.abs(wheelEvent.deltaX) < Math.abs(wheelEvent.deltaY)
      : Math.abs(wheelEvent.deltaX) > Math.abs(wheelEvent.deltaY);

    if (threshold) {
      this.acceleration.mul(0);

      if (this.loop) {
        this.inputForce.add(new Vec(wheelEvent.deltaX, wheelEvent.deltaY));
      } else {
        if (this.vertical) {
          const pos = this.position.y + wheelEvent.deltaY;
          this.inputForce.y =
            Math.max(Math.min(pos, this.overflowHeight), 0) - this.position.y;
        } else {
          const pos = this.position.x + wheelEvent.deltaX;
          this.inputForce.x =
            Math.max(Math.min(pos, this.overflowWidth), 0) - this.position.x;
        }
      }

      wheelEvent.preventDefault();
    }
  };

  private onKeyDown = (e) => {
    const Key = {
      prev: this.vertical ? "ArrowUp" : "ArrowLeft",
      next: this.vertical ? "ArrowDown" : "ArrowRight",
    };

    if (e.key === Key.prev) {
      this.moveBy(-1, "linear");
      e.preventDefault();
    }
    if (e.key === Key.next) {
      this.moveBy(1, "linear");
      e.preventDefault();
    }
  };

  private onSlotChange = (e) => {
    this.format();
  };

  format() {
    this.inputState.format.value = true;
    this._widths = undefined;
    this._heights = undefined;

    // apply align prop
    switch (this.align) {
      case "start":
        this.origin.set([0, 0]);
        break;
      case "end":
        this.origin.set([this.offsetWidth, this.offsetHeight]);
        break;
    }

    this.dispatchEvent(new CustomEvent("format", { bubbles: true }));
  }

  /**
   * Get the position of the item at the given index, relative to the current item.
   */
  public getToItemPosition(index = 0) {
    const rects = this.getItemRects();
    const pos = this.origin.clone();

    const currentIndex = index;

    if (currentIndex < 0) {
      // only happens when loop is enabled
      for (let i = 0; i > currentIndex; i--) {
        if (this.vertical) {
          pos.y -= rects[i]?.y || 0;
        } else {
          pos.x -= rects[i]?.x || 0;
        }
      }
    } else if (currentIndex > this.itemCount) {
      // only happens when loop is enabled
      for (let i = 0; i < currentIndex; i++) {
        if (this.vertical) {
          pos.y += rects[i % this.itemCount]?.y || 0;
        } else {
          pos.x += rects[i % this.itemCount]?.x || 0;
        }
      }
    } else {
      for (let i = 0; i < currentIndex; i++) {
        if (this.vertical) {
          // is vertical not looping
          pos.y += rects[i]?.y || 0;
        } else {
          // not vertical not looping
          pos.x += rects[i]?.x || 0;
        }
      }
    }

    return pos;
  }

  public setTarget(vec: Vec | Array<number> | undefined, ease?: Easing) {
    let easing = ease;

    if (!easing) {
      // auto easing
      easing = this.transition === 0 || this.transition === 1 ? "ease" : "linear";
    }

    if (vec !== undefined) {
      this.transitionAt = Date.now();
      this.targetStart.set(this.position);
    }
    this.targetEasing = easing;

    if (vec) {
      if (!this.target) {
        this.target = new Vec();
      }
      this.target.x = vec[0];
      this.target.y = vec[1];
    } else {
      this.target = undefined;
    }
  }

  public moveBy(byItems: number, easing?: Easing) {
    let i = this.currentItem + byItems;
    if (!this.loop) {
      i = Math.min(Math.max(0, i), this.itemCount - 1);
    }
    const pos = this.getToItemPosition(i);
    this.setTarget(pos, easing);
  }

  public moveTo(index: number, easing?: Easing) {
    this.moveBy(index - this.currentItem, easing);
  }

  public startAnimate() {
    if (!this.animation) {
      this.tick();
      this.trait((t) => t.start());
      this.drawUpdate();
    }
  }

  public stopAnimate() {
    if (this.animation) {
      cancelAnimationFrame(this.animation);
      this.animation = undefined;
      this.lastTick = 0;
      this.trait((t) => t.stop());
    }
  }

  private tick(ms = 0) {
    if (!this.lastTick) this.lastTick = ms;
    if (ms - this.lastTick > 1000) this.lastTick = ms;

    const deltaTick = ms - this.lastTick;
    this.lastTick = ms;

    this.accumulator += deltaTick;

    const lastPosition = this.position.clone();

    this.updateInputs();

    let ticks = 0;
    const maxTicks = 10;
    while (this.accumulator >= this.tickRate && ticks < maxTicks) {
      ticks++;
      this.accumulator -= this.tickRate;

      this.updateTick();
    }

    const deltaPosition = Vec.sub(this.position, lastPosition);

    const currItem = this.getCurrentItem();
    if (deltaPosition.abs() > 0.01 || currItem !== this.currentItem) {
      this.computeCurrentItem();
    }

    this.animation = requestAnimationFrame(this.tick.bind(this));
  }

  private computeCurrentItem() {
    const currItem = this.getCurrentItem();

    this.currentItem = currItem;
    this.dispatchEvent(
      new CustomEvent<number | string>("change", {
        detail: this.value,
        bubbles: true,
      }),
    );

    let i = 0;
    for (const child of this.children) {
      if (i === this.currentItem) {
        child.setAttribute("active", "");
      } else {
        child.removeAttribute("active");
      }
      i++;
    }

    this.drawUpdate();
  }

  private updateInputs() {
    this.trait((t) => t.input(this.inputState));

    this.direction.add(this.inputForce).sign();

    // clear
    const state = this.inputState;
    state.move.value.mul(0);
    state.grab.value = false;
    state.format.value = false;
    state.leave.value = false;
    state.enter.value = false;
    state.release.value = false;
  }

  public get deltaVelocity() {
    return Vec.sub(this.velocity.abs(), this.lastVelocity.abs());
  }

  private updateTick() {
    this.lastPosition = this.position.clone();
    this.lastVelocity = this.velocity.clone();

    this.trait((t) => t.update());

    this.acceleration.add(this.inputForce);
    this.position.add(this.acceleration);

    this.inputForce.mul(0);
    this.acceleration.mul(this.drag);

    if (this.target !== undefined) {
      switch (this.targetEasing) {
        case "ease":
          {
            this.transition = timer(this.transitionAt, this.transitionTime);
            const easedDelta = Vec.sub(this.target, this.targetStart).mul(
              Ease.easeInOutCirc(this.transition),
            );
            this.targetForce.set(this.targetStart).add(easedDelta).sub(this.position);
          }
          break;
        case "linear":
          {
            const prog = Vec.sub(this.position, this.target).abs() / Vec.abs(this.target);
            this.transition = Math.round(prog * 100) / 100 || 0;

            const delta = Vec.sub(this.targetForce.set(this.target), this.position);
            this.targetForce.set(
              delta
                .mod([this.trackWidth, this.trackHeight])
                .mul(42 / this.transitionTime),
            );
          }
          break;
        default:
          this.targetForce.set(Vec.sub(this.targetForce.set(this.target), this.position));
          break;
      }
    }

    // loop
    if (this.loop) {
      const start = this.origin.clone();
      const max = new Vec(start.x + this.trackWidth, start.y + this.trackHeight);

      if (this.position.y >= max.y) {
        this.position.y = start.y;
        if (this.target) {
          this.target.y -= max.y - start.y;
        }
      }
      if (this.position.y < start.y) {
        this.position.y = max.y;
        if (this.target) {
          this.target.y += max.y - start.y;
        }
      }

      if (this.position.x >= max.x) {
        this.position.x = start.x;
        if (this.target) {
          this.target.x -= max.x - start.x;
        }
      }
      if (this.position.x < start.x) {
        this.position.x = max.x;
        if (this.target) {
          this.target.x += max.x - start.x;
        }
      }
    }

    // update final position
    this.position.add(this.targetForce);
    this.targetForce.mul(0);

    this.velocity = Vec.sub(this.position, this.lastPosition);

    // TODO: need to self fix positon, sometimes NaN on innital load and resize
    // this.position[0] = this.position[0] || 0;
    // this.position[1] = this.position[1] || 0;
  }

  private getCurrentItem() {
    const trackSize = this.vertical ? this.trackHeight : this.trackWidth;
    const currentAngle = (this.currentPosition / trackSize) * 360;

    let minDist = Number.POSITIVE_INFINITY;
    let closestIndex = 0;

    const rects = this.getItemRects();
    const axes = this.vertical ? 1 : 0;

    for (let i = -1; i < this.itemCount + 1; i++) {
      const itemIndex = i % this.itemCount;
      const rect = rects[itemIndex];

      if (!rect) continue;

      const currentItemAngle = (rect[axes] / trackSize) * 360;
      const itemAngle = (currentItemAngle * itemIndex) % 360;
      const deltaAngle = angleDist(itemAngle, currentAngle);

      const offset = Math.floor(i / this.itemCount) * this.itemCount;

      if (Math.abs(deltaAngle) <= minDist) {
        minDist = Math.abs(deltaAngle);
        closestIndex = itemIndex;
        if (currentAngle > 180) {
          closestIndex += offset;
        }
      }
    }

    return closestIndex;
  }

  public getItemAtPosition(pos: Vec) {
    const rects = this.getItemRects();
    let px = 0;

    if (pos.x > 0) {
      for (const item of rects) {
        if (px + item.x > pos.x % this.trackWidth) {
          const offset = Math.floor(pos.x / this.trackWidth) * this.itemCount;
          return {
            domIndex: offset + rects.indexOf(item),
            index: rects.indexOf(item),
          };
        }
        px += item.x;
      }
    } else {
      for (const item of [...rects].reverse()) {
        if (px - item.x < pos.x % -this.trackWidth) {
          const offset = Math.floor(pos.x / this.trackWidth) * this.itemCount;
          return {
            domIndex: offset + rects.indexOf(item),
            index: rects.indexOf(item),
          };
        }
        px -= item.x;
      }
    }
    return null;
  }

  private clones: HTMLElement[] = [];

  private drawUpdate() {
    this.scrollLeft = Math.min(this.position.x, this.scrollWidth);
    this.scrollTop = Math.min(this.position.y, this.scrollHeight);

    const scrollPos = new Vec(this.scrollLeft, this.scrollTop);
    const diff = Vec.sub(scrollPos, this.position);
    if (this.slotElement) {
      this.slotElement.style.transform = `translateX(${diff.x}px) translateY(${diff.y}px)`;
    }

    if (this.loop) {
      const visibleItems: number[] = [];
      let lastItem: number | null = null;
      for (let x = -this.offsetWidth; x < this.offsetWidth + this.offsetWidth; x += 100) {
        const item = this.getItemAtPosition(this.position.clone().add([x, 0]));
        if (item != null && item.index !== lastItem) {
          // clone nodes if possible
          if (item.domIndex >= 0) {
            const child = this.children[item.domIndex];
            const realChild = this.children[item.index];

            if (!child && realChild) {
              const clone = realChild.cloneNode(true) as HTMLElement;
              this.clones.push(clone);
              clone.classList.add("ghost");
              this.appendChild(clone);
            }
          } else {
            // TODO: generate ghots on the left side; need to be position with transforms
            const child = this.children[item.domIndex];
            const realChild = this.children[item.index];
            // console.log(item.index);

            // if (!child && realChild) {
            //   const clone = realChild.cloneNode(true) as HTMLElement;
            //   this.clones.push(clone);
            //   clone.classList.add("ghost");
            //   this.appendChild(clone);
            // }
          }

          visibleItems.push(item.index);

          lastItem = item.index;
        }
      }
    }

    this.dispatchEvent(new CustomEvent("scroll"));
  }

  private observer: IntersectionObserver | undefined;

  private onIntersect(intersections) {
    for (const entry of intersections) {
      if (entry.isIntersecting) {
        this.startAnimate();
      } else {
        this.stopAnimate();
      }
    }
  }

  connectedCallback(): void {
    super.connectedCallback();

    this.observer = new IntersectionObserver(this.onIntersect.bind(this), {});

    // stop last animation if there was one
    this.stopAnimate();

    this.tabIndex = 0;

    window.addEventListener("pointermove", this.pointerMove);
    this.addEventListener("pointerdown", this.pointerDown);
    window.addEventListener("pointerup", this.pointerUp);
    window.addEventListener("pointercancel", this.pointerUp);
    this.addEventListener("pointerleave", this.pointerLeave);
    this.addEventListener("pointerenter", this.pointerEnter);
    this.addEventListener("keydown", this.onKeyDown);
    this.addEventListener("wheel", this.onWheel, { passive: false });

    window.addEventListener("resize", this.format.bind(this), {
      passive: true,
    });
    window.addEventListener("load", this.format.bind(this), { capture: true });

    this.dispatchEvent(new CustomEvent("change", { detail: this.value, bubbles: true }));

    this.observer.observe(this);

    // needs markup to exist
    this.format();
    this.computeCurrentItem();

    this.dispatchEvent(new CustomEvent("load", { bubbles: false }));
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();

    this.stopAnimate();

    window.removeEventListener("pointermove", this.pointerMove);
    this.removeEventListener("pointerdown", this.pointerDown);
    window.removeEventListener("pointerup", this.pointerUp);
    window.removeEventListener("pointercancel", this.pointerUp);
    this.removeEventListener("pointerleave", this.pointerLeave);
    this.removeEventListener("pointerenter", this.pointerEnter);
    this.removeEventListener("keydown", this.onKeyDown);
    this.removeEventListener("wheel", this.onWheel);

    window.removeEventListener("resize", this.format.bind(this));
    window.removeEventListener("load", this.format.bind(this));

    this.observer?.unobserve(this);
  }
}

customElements.define("a-track", Track);

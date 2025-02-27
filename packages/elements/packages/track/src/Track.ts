import { LitElement, type PropertyValues, css, html } from "lit";
import { property } from "lit/decorators/property.js";
import { Vec2 } from "./Vec.js";

/**
 * The Track implements a trait system, which can be used to add new behaviours to the track.
 *
 * Custom traits can be added to the track by calling the Track.addTrait method.
 *
 * Or the Track class can be extended to override add new behaviours entirely.
 * @example
 * ```js
 * import { type InputState, PointerTrait, Track, type Trait } from "@sv/elements/track";
 *
 * export class CustomTrack extends Track {
 *   public traits: Trait[] = [
 *     new PointerTrait(),
 *     // satefies the "Trait" interface
 *     {
 *       id: "custom-trait",
 *       input(track: Track, inputState: InputState) {
 *         if (inputState.release.value) {
 *           // log track posiiton on pointer/touch release
 *           console.log(track.posiiton);
 *         }
 *       },
 *     },
 *   ];
 * }
 *
 * customElements.define("custom-track", CustomTrack);
 * ```
 */
export interface Trait<T extends Track = Track> {
  id: string;

  /** format event */
  format?(track: T): void;

  /** called on animation start */
  start?(track: T): void;

  /** called on animation stop */
  stop?(track: T): void;

  /** input update (variable tickrate) */
  input?(track: T, inputState: InputState): void;

  /** update tick (fixed tickrate) */
  update?(track: T): void;
}

/**
 * The PointerTrait addes the ability to move the track with the mouse or touch inputs by dragging.
 *
 * @example
 * ```js
 * new PointerTrait({
 *   borderBounce?: number;
 *   borderResistance?: number;
 * })
 * ```
 */
export class PointerTrait implements Trait {
  id = "pointer";

  grabbing = false;
  grabbedStart = new Vec2();
  grabDelta = new Vec2();

  borderBounce = 0.1;
  borderResistance = 0.3;

  moveDrag = 0.5;

  constructor(
    options: {
      borderBounce?: number;
      borderResistance?: number;
    } = {},
  ) {
    this.borderBounce = options.borderBounce ?? this.borderBounce;
    this.borderResistance = options.borderResistance ?? this.borderResistance;
  }

  moveVelocity = new Vec2();

  input(track: Track, inputState: InputState) {
    if (track.overflowscroll && track.overflowWidth <= 0) {
      return;
    }

    if (inputState.grab.value && !this.grabbing) {
      this.grabbing = true;
      this.grabbedStart.set(track.mousePos);
      track.dispatchEvent(new Event("pointer:grab"));
      track.setTarget(undefined);
    }

    if (track.mousePos.abs()) {
      this.grabDelta.set(track.mousePos).sub(this.grabbedStart);
    }

    // TODO: might want to give every trait a "inputForce", so I dont have to mutate the tracks fields.

    if (this.grabbing) {
      if (inputState.move.value.abs()) {
        this.moveVelocity.add(inputState.move.value);
        track.inputForce.set(inputState.move.value.clone().mul(-1));
      } else {
        track.inputForce.mul(0);
      }
    }

    if (inputState.release.value) {
      this.grabbing = false;
      track.dispatchEvent(new Event("pointer:release"));

      track.inputForce.set(this.moveVelocity.clone().mul(-1));
    }

    // prevent moving in wrong direction
    if (track.vertical) {
      track.inputForce.x = 0;
    } else {
      track.inputForce.y = 0;
    }

    if (track.slotElement) {
      track.slotElement.style.pointerEvents = this.grabbing ? "none" : "";
      // TOOD: maybe the inert is enough here, not sure how browser support is.
      track.slotElement.inert = this.grabbing;
    }
    if (!isTouch()) track.style.cursor = this.grabbing ? "grabbing" : "";
  }

  update(track: Track) {
    this.moveVelocity.mul(this.moveDrag);

    if (this.grabbing) {
      track.drag = 0;
    } else {
      track.drag = 0.95;
    }

    // clamp input force
    const pos = Vec2.add(track.position, track.inputForce);
    const clamped = this.getClapmedPosition(track, pos);
    const diff = Vec2.sub(pos, clamped);

    if (!track.loop && diff.abs() && this.grabbing) {
      const resitance = this.borderResistance * (1 - diff.abs() / 200);

      if (track.vertical) {
        track.inputForce.mul(resitance);
      } else {
        track.inputForce.mul(resitance);
      }
    }

    const bounce = this.borderBounce;
    if (!track.loop && bounce && diff.abs() && !this.grabbing) {
      if ((track.vertical && Math.abs(diff.y)) || Math.abs(diff.x)) {
        track.inputForce.sub(diff.mul(bounce));
        track.acceleration.mul(0);
      }
    }
  }

  getClapmedPosition(e: Track, pos: Vec2) {
    let clampedPos = pos;

    const bounds = e.scrollBounds;

    switch (e.align) {
      case "center":
        clampedPos = new Vec2(
          Math.min(bounds.right, clampedPos.x),
          Math.min(bounds.bottom, clampedPos.y),
        );
        clampedPos = new Vec2(
          Math.max(bounds.left, clampedPos.x),
          Math.max(bounds.top, clampedPos.y),
        );
        break;
      default:
        clampedPos = new Vec2(
          Math.min(bounds.right, clampedPos.x),
          Math.min(bounds.bottom, clampedPos.y),
        );
        clampedPos = new Vec2(
          Math.max(bounds.left, clampedPos.x),
          Math.max(bounds.top, clampedPos.y),
        );
        break;
    }

    return clampedPos;
  }
}

/**
 * The SnapTrait addes the snapping of items to the track.
 */
export class SnapTrait implements Trait {
  id = "snap";

  format(track: Track) {
    if (
      (track.vertical && track.position.y < track.overflowHeight) ||
      track.position.x < track.overflowWidth
    ) {
      // only when it was on a child already
      track.setTarget(
        track.current !== undefined
          ? track.getToItemPosition(track.current)
          : track.getClosestItemPosition(),
        "ease",
      );
    }
  }

  input(track: Track) {
    if (track.grabbing || track.target) return;

    // Only when decelerating
    if (track.deltaVelocity[track.currentAxis] > 0) return;

    switch (track.align) {
      case "center":
        break;
      default:
        if (!track.loop) {
          // Ignore if target is out of bounds
          if (!track.vertical && track.position.x - track.overflowWidth > 0) return;
          if (track.vertical && track.position.y - track.overflowHeight > 0) return;

          // dont snap if at the beginning
          if (track.position.x <= 0 && track.position.y <= 0) return;
        }
    }

    // Project the current velocity to determine the target item.
    // This checks lastVelocity, because I don't know why velocity is 0,0 at random points.
    const vel = Math.round(track.lastVelocity[track.currentAxis] * 10) / 10;
    const dir = Math.sign(vel);
    const power = Math.max(Math.round(track.lastVelocity.abs() / 40), 1) * dir;

    if (!track.loop) {
      // disable snap when past maxIndex
      if (track.maxIndex && power > 0 && track.currentIndex + power >= track.maxIndex)
        return;
    }

    if (Math.abs(vel) > 8) {
      track.acceleration.mul(0.25);
      track.inputForce.mul(0.125);
      track.setTarget(track.getToItemPosition(track.currentItem + power), "linear");
    } else {
      track.setTarget(track.getToItemPosition(track.currentItem), "linear");
    }
  }
}

function getCSSChildren(element: Element) {
  const children: Element[] = [];
  for (const child of element.children) {
    const display = window.getComputedStyle(child, null).display;
    if (display === "contents") {
      if (child instanceof HTMLSlotElement) {
        children.push(...child.assignedElements());
      } else {
        // could be recursive
        children.push(...child.children);
      }
    } else {
      children.push(child);
    }
  }
  return children;
}

/**
 * A Track is a custom element that provides a interface for scrolling content.
 * It can be used to create carousels, slideshows, and other scrolling elements.
 * It provides functions to go to a specific child element, emits events on changes, and optimizes ux based on input device.
 *
 * @customEvent format - Emitted when: slots changed, window load and resize or children size changes. Can be canceled.
 * @customEvent change - Emitted when the current index changed.
 * @customEvent scroll - Emitted when the position changed.
 * @customEvent move - Emitted when the position is about to cahnge by a user action. Can be canceled.
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
 *
 */
export class Track extends LitElement {
  static Vec2 = Vec2;

  static get styles() {
    return css`
      :host {
        display: flex;
        outline: none;
        overflow: hidden;
      }

      .debug {
        position: absolute;
        z-index: 100;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
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
        touch-action: pan-y;
      }

      :host([vertical]) {
        touch-action: pan-x;
      }

      :host {
        overscroll-behavior: none;
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
    return html`
      <slot @slotchange=${this.onSlotChange}></slot>
      ${this.debug ? html`<div class="debug">${this.debugCanvas}</div>` : null}
    `;
  }

  public get slotElement() {
    return this.shadowRoot?.children?.[0] as HTMLSlotElement | undefined;
  }

  public traits: Trait[] = [new PointerTrait()];

  protected updated(_changedProperties: PropertyValues): void {
    if (_changedProperties.has("current") && this.current !== undefined) {
      this.setTarget(this.getToItemPosition(this.current), "ease");
    }

    if (_changedProperties.has("snap")) {
      if (this.snap) {
        this.addTrait(new SnapTrait());
      } else {
        const snapTrait = this.findTrait<SnapTrait>("snap");
        if (snapTrait) this.removeTrait(snapTrait);
      }
    }

    if (_changedProperties.has("align")) {
      this.format();
    }
  }

  private _children: Element[] = [];

  public get items() {
    return this._children;
  }

  private updateItems() {
    this._children = getCSSChildren(this);
    this.format();
  }

  public get itemCount() {
    if (this.items) {
      // TODO: respect left clones too
      return this.items.length - this.clones.length;
    }
    return 0;
  }

  private getItemRects() {
    return new Array(this.itemCount)
      .fill(0)
      .map((_, i) => new Vec2(this.itemWidths[i], this.itemHeights[i]));
  }

  /**
   * Get the absolute position of the closest item to the current position.
   * @argument offset - offset the position by a number
   */
  public getClosestItemPosition(offset = 0) {
    const posPrev = this.getToItemPosition(this.currentItem + -offset);
    const posCurr = this.getToItemPosition(this.currentItem + offset);
    const posNext = this.getToItemPosition(this.currentItem + (offset + 1));

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

  private _widths: number[] | undefined = undefined;
  private get itemWidths() {
    if (!this._widths) {
      // TODO: respect left children too
      this._widths = new Array(this.itemCount).fill(1).map((_, i) => {
        // TODO: offsetWidth doesn't take transforms in consideration, so we use. Maybe use getBoundingClientRect
        return (this.items[i] as HTMLElement)?.offsetWidth || 0;
      });
    }
    return this._widths;
  }

  private _heights: number[] | undefined = undefined;
  private get itemHeights() {
    if (!this._heights) {
      // TODO: respect left children too
      this._heights = new Array(this.itemCount).fill(1).map((_, i) => {
        return (this.items[i] as HTMLElement)?.offsetHeight || 0;
      });
    }
    return this._heights;
  }

  public get trackWidth() {
    if (!this.vertical) {
      return this.itemWidths.reduce((last, curr) => last + curr, 0);
    }
    return this.width;
  }

  public get trackHeight() {
    if (this.vertical) {
      return this.itemHeights.reduce((last, curr) => last + curr, 0);
    }
    return this.height;
  }

  private _width;
  public get width() {
    if (this._width === undefined) {
      this._width = this.offsetWidth;
    }
    return this._width;
  }

  private _height;
  public get height() {
    if (this._height === undefined) {
      this._height = this.offsetHeight;
    }
    return this._height;
  }

  public get currentPosition() {
    return this.vertical ? this.position.y : this.position.x;
  }

  public get overflowWidth() {
    return this.trackWidth - this.width;
  }

  public get overflowHeight() {
    return this.trackHeight - this.height;
  }

  public currentItem = 0;

  public get currentIndex() {
    return this.currentItem % this.itemCount;
  }

  public get currentAxis() {
    return this.vertical ? 1 : 0;
  }

  public get maxIndex() {
    if (this.align === "start") {
      // get index of item at the end of the track
      if (this.vertical) {
        const lastItem = this.getItemAtPosition(
          // adds a buffer of 3 for margin of error for layout
          new Vec2(0, this.overflowHeight + 3 - this.origin.y),
        );
        if (lastItem) return lastItem.index;
      } else {
        const lastItem = this.getItemAtPosition(
          // adds a buffer of 3 for margin of error for layout
          new Vec2(this.overflowWidth + 3 - this.origin.x, 0),
        );
        if (lastItem) return lastItem.index;
      }
    }

    return this.itemCount - 1;
  }

  public get minIndex() {
    return 0;
  }

  private getScrollBounds() {
    let stopTop = 0;
    let stopLeft = 0;
    let stopBottom = 0;
    let stopRight = 0;

    stopBottom = this.overflowHeight;
    stopRight = this.overflowWidth;

    const firstItemHeight = this.itemHeights[0] || 0;
    const firstItemWidth = this.itemWidths[0] || 0;

    const lastItemWidth = this.itemWidths[this.itemCount - 1] || 0;
    const lastItemHeight = this.itemHeights[this.itemCount - 1] || 0;

    switch (this.align) {
      case "center":
        // horizontal
        stopLeft -= this.width / 2 - firstItemWidth / 2;
        stopRight += this.width / 2 - lastItemWidth / 2;

        // vertical
        stopTop -= this.height / 2 - firstItemHeight / 2;
        stopBottom += this.height / 2 - lastItemHeight / 2;
        break;
      default:
        break;
    }

    return {
      top: stopTop,
      left: stopLeft,
      bottom: stopBottom,
      right: stopRight,
    };
  }

  scrollBounds = {
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  };

  private animation: number | undefined;
  private tickRate = 1000 / 144;
  private lastTick = 0;
  private accumulator = 0;

  public grabbing = false;

  public mousePos = new Vec2();
  public inputForce = new Vec2();

  public drag = 0.95;
  public origin = new Vec2();
  public position = new Vec2();
  public velocity = new Vec2();
  public direction = new Vec2();
  public acceleration = new Vec2();
  public lastVelocity = new Vec2();
  private lastPosition = new Vec2();

  public target?: Vec2;
  public targetEasing: Easing = "linear";
  private targetForce = new Vec2();
  private targetStart = new Vec2();

  public transitionTime = 350;

  private transitionAt = 0;
  private transition = 0;

  private inputState: InputState = {
    grab: {
      value: false,
    },
    scroll: {
      value: false,
    },
    release: {
      value: false,
    },
    move: {
      value: new Vec2(), // delta
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

  private trait(callback: (t: Trait) => void) {
    for (const t of this.traits) {
      try {
        callback(t);
      } catch (err) {
        console.error(`[a-track] error in trait '${t.id}': ${(err as Error).message}`);
      }
    }
  }

  /** Add a trait. */
  public addTrait<T extends Trait>(trait: T) {
    this.traits.push(trait);
  }

  /** Remove a trait. */
  public removeTrait<T extends Track>(trait: Trait<T>) {
    this.traits.splice(this.traits.indexOf(trait), 1);
  }

  /** Get a trait by id. */
  public findTrait<T extends Trait>(id: string): T | undefined {
    for (const trait of this.traits) {
      if (trait.id === id) {
        return trait as T;
      }
    }
    return undefined;
  }

  /** The index of the current item. */
  @property({ type: Number, reflect: true }) current: number | undefined;

  /** Whether the track should scroll vertically, instead of horizontally. */
  @property({ type: Boolean, reflect: true }) vertical = false;

  /** Whether the track should loop back to the start when reaching the end. */
  @property({ type: Boolean, reflect: true }) loop = false;

  /** Whether the track should snap to the closest child element. */
  @property({ type: Boolean, reflect: true }) snap = false;

  /** Item alignment in the track. "start" (left/top) or "center" */
  @property({ type: String }) align: "start" | "center" = "start";

  // TODO: simpler interface for behaviour configuration like this, maybe this should just be default behaviour?
  /** Only scroll when items are overflown. Like "overflow: auto". */
  @property({ type: Boolean, reflect: true }) overflowscroll = false;

  @property({ type: Boolean }) debug = false;

  private observedChildren = new Set<Node>();

  private onSlotChange = () => {
    this.updateItems();

    for (const node of this.observedChildren) {
      if (node instanceof HTMLElement && !this.items.includes(node)) {
        this.resizeObserver?.unobserve(node);
        this.observedChildren.delete(node);
      }
    }

    for (const node of this.items) {
      if (node instanceof HTMLElement) {
        node.ariaRoleDescription = "slide";
      }

      if (node instanceof HTMLElement && !this.observedChildren.has(node)) {
        this.observedChildren.add(node);
        this.resizeObserver?.observe(node);
      }
    }
  };

  private format = () => {
    this.inputState.format.value = true;
    this._width = undefined;
    this._height = undefined;
    this._widths = undefined;
    this._heights = undefined;

    // apply align prop
    switch (this.align) {
      case "start":
        this.origin.set([0, 0]);
        break;
      case "center":
        if (this.vertical) {
          this.origin.set([0, -this.height / 2]);
        } else {
          this.origin.set([-this.width / 2, 0]);
        }
        break;
    }

    this.scrollBounds = this.getScrollBounds();

    const formatEvent = new CustomEvent("format", {
      bubbles: true,
      cancelable: true,
    });
    this.dispatchEvent(formatEvent);

    if (!formatEvent.defaultPrevented) {
      this.trait((t) => t.format?.(this));

      if (this.position.x > this.overflowWidth || this.position.y > this.overflowHeight) {
        this.setTarget(undefined);
      }
    }
  };

  /**
   * Get the index of the item that contains given element. Returns -1 if it is not in any item.
   */
  public elementItemIndex(ele: HTMLElement) {
    let index = 0;
    for (const child of this.items) {
      if (child.contains(ele)) return index;
      index++;
    }
    return -1;
  }

  /**
   * Get the position of the item at the given index, relative to the current item.
   */
  public getToItemPosition(index = 0) {
    const rects = this.getItemRects();
    const pos = this.origin.clone();

    let currentIndex = index;

    if (!this.loop) {
      // TODO: config to respect maxIndex, if we dont want to scroll past the overflowidth, when moving to an item index target
      const maxIndex = this.maxIndex;
      currentIndex = Math.min(Math.max(this.minIndex, currentIndex), maxIndex);
    }

    if (currentIndex < 0) {
      // only happens when loop is enabled
      for (let i = 0; i > currentIndex; i--) {
        pos[this.currentAxis] -= rects[i]?.[this.currentAxis] || 0;
      }
    } else if (currentIndex > this.itemCount) {
      // only happens when loop is enabled
      for (let i = 0; i < currentIndex; i++) {
        pos[this.currentAxis] += rects[i % this.itemCount]?.[this.currentAxis] || 0;
      }
    } else {
      let lastIndex = 0;
      for (let i = 0; i < currentIndex; i++) {
        pos[this.currentAxis] += rects[i]?.[this.currentAxis] || 0;
        lastIndex = i;
      }

      if (this.align === "center") {
        // adds half of the current item to the position to center it
        pos[this.currentAxis] +=
          (rects[Math.min(lastIndex + 1, currentIndex)]?.[this.currentAxis] || 0) / 2;
      }
    }

    return pos;
  }

  /**
   * Set the target position to transition to.
   */
  public setTarget(vec: Vec2 | Array<number> | undefined, ease?: Easing) {
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
        this.target = new Vec2();
      }
      this.target.x = vec[0];
      this.target.y = vec[1];
    } else {
      this.target = undefined;
    }
  }

  /**
   * Move by given count of items.
   */
  public moveBy(byItems: number, easing?: Easing) {
    let i = this.currentItem + byItems;
    if (!this.loop) {
      i = Math.min(Math.max(0, i), this.itemCount - 1);
    }
    const pos = this.getToItemPosition(i);
    this.setTarget(pos, easing);
  }

  /**
   * Move to index of item.
   */
  public moveTo(index: number, easing?: Easing) {
    this.moveBy(index - this.currentItem, easing);
  }

  public startAnimate() {
    if (!this.animation) {
      this.tick();
      this.trait((t) => t.start?.(this));
      this.drawUpdate();
    }
  }

  public stopAnimate() {
    if (this.animation) {
      cancelAnimationFrame(this.animation);
      this.animation = undefined;
      this.lastTick = 0;
      this.trait((t) => t.stop?.(this));
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

    const deltaPosition = Vec2.sub(this.position, lastPosition);

    const currItem = this.getCurrentItem();
    if (deltaPosition.abs() > 0.01 || currItem !== this.currentItem) {
      this.computeCurrentItem();
    }

    this.animation = requestAnimationFrame(this.tick.bind(this));
  }

  private computeCurrentItem() {
    const currItem = this.getCurrentItem();

    const changed = this.currentItem !== currItem;
    this.currentItem = currItem;

    let i = 0;
    for (const child of this.items) {
      if (i === this.currentItem) {
        child.setAttribute("active", "");
      } else {
        child.removeAttribute("active");
      }
      i++;
    }

    this.drawUpdate();

    if (changed) {
      this.dispatchEvent(
        new CustomEvent<number | string>("change", {
          detail: this.currentItem,
          bubbles: true,
        }),
      );
    }
  }

  private updateInputs() {
    this.trait((t) => t.input?.(this, this.inputState));

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
    return Vec2.sub(this.velocity.abs(), this.lastVelocity.abs());
  }

  private updateTick() {
    this.lastPosition = this.position.clone();
    this.lastVelocity = this.velocity.clone();

    this.acceleration.mul(this.drag);

    this.trait((t) => t.update?.(this));

    this.acceleration.add(this.inputForce);
    this.inputForce.mul(0);

    this.position.add(this.acceleration);

    if (this.target) {
      switch (this.targetEasing) {
        // case "smooth":
        //   {
        //     // TODO: implement exponential smoothing
        //   }
        //   break;
        case "ease":
          {
            this.transition = timer(this.transitionAt, this.transitionTime);
            const easedDelta = Vec2.sub(this.target, this.targetStart).mul(
              Ease.easeInOutCirc(this.transition),
            );
            this.targetForce.set(this.targetStart).add(easedDelta).sub(this.position);
          }
          break;
        case "linear":
          {
            const prog =
              Vec2.sub(this.position, this.target).abs() / Vec2.abs(this.target);
            this.transition = Math.round(prog * 100) / 100 || 0;

            const delta = Vec2.sub(this.targetForce.set(this.target), this.position);

            const a = delta.mod([this.trackWidth, this.trackHeight]);
            if (a.isNaN()) {
              // TODO: fix this
              a.x = a.x || 0;
              a.y = a.y || 0;
            }

            this.targetForce.set(a.mul(42 / this.transitionTime));
          }
          break;
        default:
          this.targetForce.set(
            Vec2.sub(this.targetForce.set(this.target), this.position),
          );
          break;
      }
    }

    // loop
    if (this.loop) {
      const start = this.origin.clone();
      const max = new Vec2(start.x + this.trackWidth, start.y + this.trackHeight);

      if (this.vertical) {
        // y
        if (this.position.y >= max.y) {
          this.position.y = start.y;
          if (this.target) this.target.y -= max.y - start.y;
        } else if (this.position.y < start.y) {
          this.position.y = max.y;
          if (this.target) this.target.y += max.y - start.y;
        }
      } else {
        // x
        if (Math.round(this.position.x) >= max.x) {
          this.position.x = start.x;
          if (this.target) this.target.x -= max.x - start.x;
        } else if (Math.round(this.position.x) < start.x) {
          this.position.x = max.x;
          if (this.target) this.target.x += max.x - start.x;
        }
      }
    }

    // update final position
    this.position.add(this.targetForce);
    this.targetForce.set(0);

    this.velocity = Vec2.sub(this.position, this.lastPosition);
  }

  debugCanvas = document.createElement("canvas");

  private getCurrentItem() {
    let ctx: CanvasRenderingContext2D | null = null;
    if (this.debug) {
      ctx = this.debugCanvas.getContext("2d");
      ctx?.translate(0.5, 0.5);
      this.debugCanvas.width = 200;
      this.debugCanvas.height = 200;
      this.debugCanvas.style.width = "100px";
      this.debugCanvas.style.height = "100px";
    }

    const trackSize = this.vertical ? this.trackHeight : this.trackWidth;
    const currentAngle = (this.currentPosition / trackSize) * Math.PI * 2;

    let minDist = Number.POSITIVE_INFINITY;
    let closestAngle = 0;
    let closestIndex = 0;

    const rects = this.getItemRects();

    const PI2 = Math.PI * 2;

    const originAngle = (this.origin[this.currentAxis] / trackSize || 0) * PI2;

    const axes = this.vertical ? 1 : 0;
    // all items angles
    const angles = rects.reduce((acc, rect, i) => {
      acc[i] = (rect[axes] / trackSize) * PI2;
      return acc;
    }, [] as number[]);

    for (let i = -1; i < this.itemCount + 1; i++) {
      const itemIndex = i % this.itemCount;
      const rect = rects[itemIndex];

      // when -1 is nothing go next (with loop enabled, its the last item)
      if (!rect) continue;

      let itemAngle = originAngle;

      let lastIndex = 0;
      for (let j = 0; j < itemIndex; j++) {
        if (j < itemIndex) {
          itemAngle += angles[j] || 0;
        }
        lastIndex = j;
      }

      if (this.align === "center") {
        // adds half of the current item to the position to center it
        itemAngle += (angles[Math.min(lastIndex + 1, this.currentIndex)] || 0) / 2;
      }

      if (this.debug && ctx) {
        // draw a line from the center to the current position with angle
        ctx.strokeStyle = `hsl(0, 0%, ${(i / this.itemCount) * 100}%)`;
        ctx.beginPath();
        ctx.moveTo(100, 100);
        ctx.lineTo(100 + Math.cos(itemAngle) * 69, 100 + Math.sin(itemAngle) * 69);
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      const deltaAngle = angleDist(itemAngle, currentAngle);

      const offset = Math.floor(i / this.itemCount) * this.itemCount;

      if (Math.abs(deltaAngle) <= minDist) {
        minDist = Math.abs(deltaAngle);
        closestIndex = itemIndex;
        if (currentAngle > PI2 / 2) {
          closestIndex += offset;
        }

        closestAngle = itemAngle;
      }
    }

    if (this.debug && ctx) {
      // draw a line from the center to the current position with angle
      ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
      ctx.beginPath();
      ctx.moveTo(100, 100);
      ctx.lineTo(
        100 + Math.cos(currentAngle + originAngle) * 69,
        100 + Math.sin(currentAngle + originAngle) * 69,
      );
      ctx.arc(
        100,
        100,
        69,
        currentAngle + originAngle,
        currentAngle + originAngle + (this.width / trackSize) * PI2,
      );
      ctx.lineTo(100, 100);
      ctx.fill();

      // print current position
      ctx.font = "24px sans-serif";
      ctx.fillStyle = "#fff";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(
        `${this.currentPosition.toFixed(1)} / ${trackSize.toFixed(1)}`,
        42,
        18,
      );

      // print current position index
      ctx.font = "24px sans-serif";
      ctx.fillStyle = "#fff";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(closestIndex.toString(), 6, 18);

      // draw a line from the center to the current position with angle
      ctx.strokeStyle = "yellow";
      ctx.beginPath();
      ctx.moveTo(100, 100);
      ctx.lineTo(100 + Math.cos(closestAngle) * 69, 100 + Math.sin(closestAngle) * 69);
      ctx.lineWidth = 3;
      ctx.stroke();

      const targetAngle = this.target ? (this.target.x / trackSize) * PI2 : undefined;

      if (targetAngle) {
        // draw a line from the center to the current position with angle
        ctx.strokeStyle = "blue";
        ctx.beginPath();
        ctx.moveTo(100, 100);
        ctx.lineTo(100 + Math.cos(closestAngle) * 50, 100 + Math.sin(closestAngle) * 50);
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    }

    if (this.debug && ctx) {
      // draw a line from the center to the current position with angle
      ctx.strokeStyle = "lime";
      ctx.beginPath();
      ctx.moveTo(100, 100);
      ctx.lineTo(100 + Math.cos(originAngle) * 69, 100 + Math.sin(originAngle) * 69);
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    return closestIndex;
  }

  /**
   * Get the item at a specific position.
   */
  public getItemAtPosition(pos: Vec2) {
    const rects = this.getItemRects();
    let px = 0;

    if (pos[0] > 0) {
      for (const item of rects) {
        if (px + item.x > pos[0] % this.trackWidth) {
          const offset = Math.floor(pos[0] / this.trackWidth) * this.itemCount;
          return {
            width: item.x,
            height: item.y,
            domIndex: offset + rects.indexOf(item),
            index: rects.indexOf(item),
          };
        }
        px += item.x;
      }
    } else {
      for (const item of [...rects].reverse()) {
        if (px - item.x < pos[0] % -this.trackWidth) {
          const offset = Math.floor(pos[0] / this.trackWidth) * this.itemCount;
          return {
            width: item.x,
            height: item.y,
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

    const scrollPos = new Vec2(this.scrollLeft, this.scrollTop);
    const diff = Vec2.sub(scrollPos, this.position);
    if (this.slotElement) {
      if (diff.abs() > 1.5) {
        this.slotElement.style.transform = `translateX(${diff.x}px) translateY(${diff.y}px)`;
      } else {
        this.slotElement.style.transform = "translateX(0px) translateY(0px)";
      }
    }

    if (this.loop) {
      const visibleItems: number[] = [];
      let lastItem: number | null = null;
      for (let x = -this.width; x < this.width + this.width; x += 100) {
        const item = this.getItemAtPosition(this.position.clone().add([x, 0]));
        if (item != null && item.index !== lastItem) {
          // clone nodes if possible
          if (item.domIndex >= 0) {
            const child = this.items[item.domIndex];
            const realChild = this.items[item.index];

            if (!child && realChild) {
              const clone = realChild.cloneNode(true) as HTMLElement;
              clone.tabIndex = -1;
              clone.inert = true;
              clone.classList.add("ghost");
              this.clones.push(clone);
              this.appendChild(clone);
            }
          } else {
            // TODO: generate ghots on the left side; need to be position with transforms
            const child = this.items[item.domIndex];
            const realChild = this.items[item.index];
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

  private resizeObserver?: ResizeObserver;

  listener<T extends Event>(
    host: HTMLElement | typeof globalThis,
    events: string | string[],
    handler: (ev: T) => void,
    options?: AddEventListenerOptions,
  ) {
    for (const event of Array.isArray(events) ? events : [events]) {
      // A controller is just a hook into lifecycle functions (connected, disconnected, update, updated);
      this.addController({
        hostConnected: () =>
          host.addEventListener(event, handler as EventListener, options),
        hostDisconnected: () =>
          host.removeEventListener(event, handler as EventListener, options),
      });
    }
  }

  private canMove(delta: Vec2) {
    return this.dispatchEvent(new MoveEvent(this, delta));
  }

  connectedCallback(): void {
    super.connectedCallback();

    this.updateItems();

    this.ariaRoleDescription = "carousel";
    this.role = "region";

    this.listener(this, "focusin", (e: FocusEvent) => {
      const item = this.elementItemIndex(e.target as HTMLElement);
      const dist = Vec2.dist2(this.getToItemPosition(item), this.position);
      const rect = this.getItemRects()[item];

      if (!rect) return;

      if (
        dist.x + rect.x > this.width ||
        dist.x < 0 ||
        dist.y + rect.y > this.height ||
        dist.y < 0
      ) {
        this.moveTo(item);
      }
    });

    this.listener(this, "keydown", (e: KeyboardEvent) => {
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
    });

    this.listener(this, "pointerdown", (e: PointerEvent) => {
      if (e.button !== 0) return; // only left click

      // Try to focus this element when clicked on for arrow key navigation,
      // will only work when tabindex=0.
      this.focus();

      this.mousePos.x = e.x;
      this.mousePos.y = e.y;

      this.setTarget(undefined);
      this.acceleration.set(0);

      e.preventDefault();
      e.stopPropagation();
    });

    this.listener(this, "pointerleave", () => {
      this.inputState.leave.value = true;
    });

    this.listener(this, "pointerenter", () => {
      this.inputState.enter.value = true;
    });

    this.listener(window, "pointermove", (pointerEvent: PointerEvent) => {
      const pos = new Vec2(pointerEvent.x, pointerEvent.y);
      const delta = Vec2.sub(pos, this.mousePos);

      if (!this.canMove(delta)) return;

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

        pointerEvent.preventDefault();
        pointerEvent.stopPropagation();
      }
    });

    // TODO: put this in a trait so it can be disabled
    this.listener(
      this,
      "wheel",
      (wheelEvent: WheelEvent) => {
        if (wheelEvent.ctrlKey === true) {
          // its a pinch zoom gesture
          return;
        }
        if (this.overflowscroll && this.overflowWidth <= 0) {
          // respect overflowscroll
          return;
        }

        const delta = new Vec2(wheelEvent.deltaX, wheelEvent.deltaY);

        if (!this.canMove(delta)) return;

        const deltaThreshold = Vec2.abs(delta);
        const axisThreshold = this.vertical
          ? Math.abs(delta.x) < Math.abs(delta.y)
          : Math.abs(delta.x) > Math.abs(delta.y);

        if (axisThreshold && deltaThreshold > 2) {
          wheelEvent.preventDefault();

          this.setTarget(undefined);

          this.grabbing = true;
          this.inputState.scroll.value = true;

          this.acceleration.mul(0);

          if (this.vertical) {
            this.inputForce.y = wheelEvent.deltaY;
          } else {
            this.inputForce.x = wheelEvent.deltaX;
          }
        } else {
          this.grabbing = false;
        }
      },
      { passive: false },
    );

    this.listener(window, ["pointerup", "pointercancel"], (e: PointerEvent) => {
      this.mousePos.mul(0);

      if (this.grabbing) {
        this.grabbing = false;
        e.preventDefault();
        e.stopPropagation();

        this.inputState.release.value = true;
      }
    });

    const intersectionObserver = new IntersectionObserver((intersections) => {
      for (const entry of intersections) {
        if (entry.isIntersecting) {
          this.startAnimate();
        } else {
          this.stopAnimate();
        }
      }
    });

    this.addController({
      hostConnected: () => intersectionObserver.observe(this),
      hostDisconnected: () => intersectionObserver.disconnect(),
    });

    // TODO: diff the container size and appliy to position of track
    this.resizeObserver = new ResizeObserver(debounce(() => this.format()));

    this.addController({
      hostConnected: () => this.resizeObserver?.observe(this),
      hostDisconnected: () => this.resizeObserver?.disconnect(),
    });

    this.computeCurrentItem();
  }

  disconnectedCallback(): void {
    this.stopAnimate();
    super.disconnectedCallback();
  }
}

export class MoveEvent extends CustomEvent<{
  delta: Vec2;
  direction: Vec2;
  velocity: Vec2;
  position: Vec2;
}> {
  constructor(track: Track, delta: Vec2) {
    super("move", {
      cancelable: true,
      detail: {
        delta: delta,
        direction: track.direction.clone(),
        velocity: track.velocity.clone(),
        position: track.position.clone(),
      },
    });
  }
}

function mod(a: number, n: number) {
  return a - Math.floor(a / n) * n;
}

function angleDist(a: number, b: number) {
  return mod(b - a + 180, 360) - 180;
}

export function timer(start: number, time: number) {
  return Math.min((Date.now() - start) / time, 1);
}

export type InputState = {
  grab: {
    value: boolean;
  };
  scroll: {
    value: boolean;
  };
  move: {
    value: Vec2;
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

export type Easing = "ease" | "linear" | "none";

export const Ease = {
  easeInOutCirc(x: number) {
    return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
  },
  easeOutSine(x: number) {
    return Math.sin((x * Math.PI) / 2);
  },
};

export function isTouch() {
  return !!navigator.maxTouchPoints || "ontouchstart" in window;
}

function debounce<T>(callback: (arg: T) => void) {
  let timeout: Timer;

  return (arg: T) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => callback(arg), 80);
  };
}

import { css, html, LitElement, type PropertyValues } from "lit";
import { property } from "lit/decorators/property.js";

// import { DebugTrait } from "./debug.js";

const defaultTraits = [
  //
  // new DebugTrait(),
];

const PI2 = Math.PI * 2;

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
  resize: {
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

/**
 * The Track implements a trait system, which can be used to add new behaviours to the track.
 *
 * Custom traits can be added to the track by calling the Track.addTrait method.
 *
 * Or the Track class can be extended to override add new behaviours entirely.
 * @example
 * ```js
 * import { type InputState, Track, type Trait } from "@sv/elements/track";
 *
 * export class CustomTrack extends Track {
 *   public traits: Trait[] = [
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

  /** draw (variable tickrate) */
  draw?(track: T): void;
}

/**
 * The SnapTrait addes the snapping of items to the track.
 */
export class SnapTrait implements Trait {
  id = "snap";

  input(track: Track) {
    if (track.interacting || track.target) return;

    // only when decelerating, but also when not moving
    const movement = track.velocity.clone().precision(0.1).abs();
    if (movement !== 0 && movement < 0.1) return;

    // Ignore if target is out of bounds
    // (-1 becuase the transition might leave it at 99.999 instead of 100 for example)
    if (!track.vertical && track.position.x - track.scrollBounds.right > -1) return;
    if (track.vertical && track.position.y - track.scrollBounds.bottom > -1) return;
    if (!track.vertical && track.position.x <= track.scrollBounds.left) return;
    if (track.vertical && track.position.y <= track.scrollBounds.top) return;

    // Project the current velocity to determine the target item.
    const velocity = Math.round(track.velocity[track.currentAxis] * 10) / 10;

    const powerThreshold = 100;
    const power =
      Math.max(Math.round(track.velocity.abs() / powerThreshold), 1) *
      Math.sign(velocity);

    const velocityThreshold = 8;

    let toIndex = track.currentItem;

    if (Math.abs(velocity) > velocityThreshold) {
      // apply inertia to snap target
      track.acceleration.mul(0.25);
      track.inputForce.mul(0.125);

      toIndex = track.currentItem + power;
    }

    // if projected position is past maxIndex
    if (toIndex > track.maxIndex) {
      // go to end of bounds
      track.setTarget(track.trackOverflow, "linear");
    } else {
      track.setTarget(track.getToItemPosition(toIndex), "linear");
    }

    if (!track.target) {
      throw new Error("Track target not set, but snap");
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
  static get styles() {
    return css`
      :host {
        display: flex;
        outline: none;
        overflow: hidden;
        touch-action: pan-y;
        overscroll-behavior: none;
        scrollbar-width: none;
      }
      :host([vertical]) {
        flex-direction: column;
      }
      :host([vertical]) {
        touch-action: pan-x;
      }
      slot {
        all: inherit;
        will-change: transform;
        height: auto;
        min-width: 100%;
        overflow: visible;
        padding: 0;
        margin: 0;
        border: none;
        outline: none;
      }
      ::-webkit-scrollbar {
        width: 0px;
        height: 0px;
        background: transparent;
        display: none;
      }
      .debug {
        position: absolute;
        z-index: 10;
        pointer-events: none;
      }
    `;
  }

  public traits: Trait[] = [...defaultTraits];

  constructor() {
    super();

    this.addEventListener("wheel", this.onWheel, { passive: false });

    this.addEventListener("focusin", this.onFocusIn);

    this.addEventListener("keydown", this.onKeyDown);

    this.addEventListener("pointerdown", this.onPointerDown);
    this.addEventListener("touchstart", this.onPointerDown);

    this.addEventListener("pointerleave", () => {
      this.inputState.leave.value = true;
    });

    this.addEventListener("pointerenter", () => {
      this.inputState.enter.value = true;
    });
  }

  connectedCallback(): void {
    super.connectedCallback();

    this.updateItems();

    this.ariaRoleDescription = "carousel";

    this.role = this.role || "region"; // fallback to region if no role is set

    this.listener(window, "pointermove", this.onPointerMove);
    this.listener(window, "touchmove", this.onPointerMove);
    this.listener(window, ["pointerup", "pointercancel"], this.onPointerUpOrCancel);

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

    const debouncedFormat = debounce(() => this.onFormat());
    this.resizeObserver = new ResizeObserver((e) => {
      this.updateLayout();
      debouncedFormat(e);
    });

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

  render() {
    return html`
      <slot part="track" @slotchange=${this.onSlotChange}></slot>
      ${this.debug ? html`<div class="debug">${this.debugCanvas}</div>` : null}
    `;
  }

  public get slotElement() {
    for (const child of this.shadowRoot?.children || []) {
      if (child instanceof HTMLSlotElement) return child;
    }
    return undefined;
  }

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
      this.updateLayout();
      this.onFormat();
    }
  }

  private _children: Element[] = [];

  public get items() {
    return this._children;
  }

  private updateItems() {
    this._children = getCSSChildren(this);
    this.updateLayout();
    this.onFormat();
  }

  public get itemCount() {
    if (this.items) {
      // TODO: respect left clones too
      return this.items.length - this.clones.length;
    }
    return 0;
  }

  private _itemRects: Vec2[] | undefined = undefined;
  private get itemRects() {
    if (this._itemRects === undefined) {
      let topEdge: number | undefined;
      let leftEdge: number | undefined;

      // @ts-ignore
      this._itemRects = this.items
        .map((item) => {
          if (this.clones.includes(item)) return;

          const { width, height, top, left } = item.getBoundingClientRect();

          if (this.vertical) {
            if (!leftEdge) {
              leftEdge = left;
            } else if (left !== leftEdge) {
              return;
            }
          } else {
            if (!topEdge) {
              topEdge = top;
            } else if (top !== topEdge) {
              return;
            }
          }

          return new Vec2(width, height);
        })
        .filter(Boolean);
    }
    return this._itemRects || [];
  }

  private _itemWidths: number[] | undefined = undefined;
  private get itemWidths() {
    if (this._itemWidths === undefined) {
      // TODO: respect left children too
      this._itemWidths = this.itemRects.map((rect) => rect[0]);
    }
    return this._itemWidths;
  }

  private _itemHeights: number[] | undefined = undefined;
  private get itemHeights() {
    if (this._itemHeights === undefined) {
      // TODO: respect left children too
      this._itemHeights = this.itemRects.map((rect) => rect[1]);
    }
    return this._itemHeights;
  }

  private _itemsInView: number | undefined = undefined;
  public get itemsInView() {
    if (this._itemsInView === undefined) {
      let itemsInView = 0;

      if (this.itemCount === 0) {
        this._itemsInView = 0;
        return this._itemsInView;
      }

      const viewportSize = this.vertical ? this.height : this.width;
      const itemSizes = this.vertical ? this.itemHeights : this.itemWidths;

      if (viewportSize <= 0 || itemSizes.length === 0) {
        this._itemsInView = 1;
        return this._itemsInView;
      }

      // Start from current item and calculate how many items fit in viewport
      let accumulatedSize = 0;
      let itemIndex = this.currentIndex;

      // Count items forward from current item
      while (accumulatedSize < viewportSize) {
        const sizeIndex = itemIndex % this.itemCount;
        const size = itemSizes[sizeIndex];
        if (size === undefined) break;

        accumulatedSize += size;
        if (accumulatedSize <= viewportSize) {
          itemsInView++;
        }
        itemIndex++;

        // If not looping and we've reached the end, break
        if (!this.loop && itemIndex >= this.itemCount) {
          break;
        }

        // If looping and we've come full circle, break to avoid infinite loop
        if (this.loop && itemIndex >= this.currentIndex + this.itemCount) {
          break;
        }
      }

      // TODO: looping
      // If we have space left and looping is enabled, check backwards too
      // if (this.loop && accumulatedSize < viewportSize) {
      //   itemIndex = currentIdx - 1;
      //   while (accumulatedSize < viewportSize && itemIndex >= currentIdx - this.itemCount) {
      //     if (itemIndex < 0) {
      //       itemIndex = this.itemCount - 1;
      //     }
      //     const sizeIndex = itemIndex % this.itemCount;
      //     const size = itemSizes[sizeIndex];
      //     if (size === undefined) break;

      //     accumulatedSize += size;
      //     itemsInView++;
      //     itemIndex--;
      //   }
      // }

      this._itemsInView = Math.max(1, itemsInView);
    }

    return this._itemsInView;
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

  public get trackOverflow() {
    return new Vec2(this.overflowWidth, this.overflowHeight);
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

  public get hasOverflow() {
    if (this.vertical) {
      return this.overflowHeight > 0;
    }
    return this.overflowWidth > 0;
  }

  public get currentIndex() {
    return this.currentItem % this.itemCount;
  }

  public get currentAxis() {
    return this.vertical ? 1 : 0;
  }

  public get maxIndex() {
    if (this.loop) {
      return Number.POSITIVE_INFINITY;
    }

    if (this.overflow === "ignore") {
      // when ignored, max-index is just the last item
      return this.itemCount - 1;
    }

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

    // falls back to last item as max-index
    return this.itemCount - 1;
  }

  public get minIndex() {
    if (this.loop) {
      return Number.NEGATIVE_INFINITY;
    }
    return 0;
  }

  public get trackSize() {
    return this.vertical ? this.trackHeight : this.trackWidth;
  }

  public get currentAngle() {
    if (!this.trackSize) return 0;
    return (this.currentPosition / this.trackSize) * PI2 || 0;
  }

  public get originAngle() {
    if (!this.trackSize) return 0;
    return (this.origin[this.currentAxis] / this.trackSize) * PI2 || 0;
  }

  public get targetAngle() {
    if (!this.trackSize) return 0;
    return this.target
      ? (this.target[this.currentAxis] / this.trackSize) * PI2 || 0
      : undefined;
  }

  public itemAngles: number[] = [];

  private getScrollBounds() {
    if (this.loop) {
      return {
        top: Number.NEGATIVE_INFINITY,
        left: Number.NEGATIVE_INFINITY,
        bottom: Number.POSITIVE_INFINITY,
        right: Number.POSITIVE_INFINITY,
      };
    }

    let stopTop = 0;
    let stopLeft = 0;
    let stopBottom = 0;
    let stopRight = 0;

    const firstItemHeight = this.itemHeights[0] || 0;
    const firstItemWidth = this.itemWidths[0] || 0;

    const lastItemWidth = this.itemWidths[this.itemCount - 1] || 0;
    const lastItemHeight = this.itemHeights[this.itemCount - 1] || 0;

    stopBottom = this.overflowHeight;
    stopRight = this.overflowWidth;

    if (this.overflow === "ignore") {
      stopBottom += this.height - lastItemHeight;
      stopRight += this.width - lastItemWidth;
    }

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

  private toClapmedPosition(pos: Vec2) {
    let clampedPos = pos;

    const bounds = this.scrollBounds;

    switch (this.align) {
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

  public scrollBounds = {
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  };

  private animation: number | undefined;
  private tickRate = 1000 / 145;
  private lastTick = 0;
  private accumulator = 0;

  public currentItem = 0;

  public grabbing = false;

  public mouseDown = false;
  public mousePos = new Vec2();

  // Force applied to the acceleration every frame
  public inputForce = new Vec2();

  public origin = new Vec2();
  public position = new Vec2();

  public drag = 0.95;
  public borderBounce = 0.1;
  public borderResistance = 0.3;

  public moveVelocity = new Vec2();

  // Average velocity over multiple frames
  public velocity = new Vec2();

  // Delta of velocity compared to the last frame
  public deltaVelocity = new Vec2();

  // Direction of the inputForce
  public direction = new Vec2();

  // Acceleration that is applied to the position every frame
  public acceleration = new Vec2();

  public target?: Vec2;
  public targetEasing: Easing = "linear";
  private targetForce = new Vec2();
  private targetStart = new Vec2();

  private dragMultiplier = 0.95;

  public transitionTime = 420;
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
    resize: {
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

  /** The index of the current item. */
  @property({ type: Number, reflect: true }) public current: number | undefined;

  /** Whether the track should scroll vertically, instead of horizontally. */
  @property({ type: Boolean, reflect: true }) public vertical = false;

  /** Whether the track should loop back to the start when reaching the end. */
  @property({ type: Boolean, reflect: true }) public loop = false;

  /** Whether the track should snap to the closest child element. */
  @property({ type: Boolean, reflect: true }) public snap = false;

  /** Item alignment in the track. "start" (left/top) or "center" */
  @property({ type: String }) public align: "start" | "center" = "start";

  /** Change the overflow behavior.
   * - "auto" - Only scrollable when necessary.
   * - "scroll" - Always scrollable.
   * - "ignore" - Ignore any overflow.
   */
  @property({ type: String }) public overflow: "auto" | "scroll" | "ignore" = "auto";

  @property({ type: Boolean }) public debug = false;

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
   * Get the position of the item to the given index, relative to the current item.
   */
  public getToItemPosition(index = 0) {
    if (Number.isNaN(index)) {
      throw new Error("Invalid index");
    }

    const targetIndex = this.loop
      ? index
      : Math.min(Math.max(index, 0), this.itemCount - 1);

    const sizes = this.vertical ? this.itemHeights : this.itemWidths;
    const pos = new Vec2();

    pos[this.currentAxis] = findMinDistance(
      this.position[this.currentAxis] - this.origin[this.currentAxis],
      targetIndex,
      sizes,
      this.trackSize,
      this.loop,
    );

    pos[this.currentAxis] += this.origin[this.currentAxis];

    if (this.align === "center") {
      // adds half of the current item to the position to center it
      pos[this.currentAxis] += (sizes[targetIndex] || 0) / 2;
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
    const toIndex = this.currentItem + byItems;

    if (this.overflow !== "ignore" && this.overflowWidth > 0 && toIndex > this.maxIndex) {
      this.setTarget(this.trackOverflow, easing);
    } else {
      const pos = this.getToItemPosition(toIndex);
      this.setTarget(pos, easing);
    }
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

  private frames: number[] = [];

  private tick(ms = 0) {
    if (!this.lastTick) this.lastTick = ms;
    if (ms - this.lastTick > 1000) this.lastTick = ms;

    const deltaTick = ms - this.lastTick;
    this.lastTick = ms;
    this.accumulator += deltaTick;

    const lastPosition = this.position.clone();

    if (this.frames.length > 0) {
      this.frames.length = 0;
      this.updateInputs();
    }

    let ticks = 0;
    const maxTicks = 100;
    while (this.accumulator >= this.tickRate && ticks < maxTicks) {
      ticks++;
      this.accumulator -= this.tickRate;
      this.frames.push(this.tickRate);

      this.updateTick(this.tickRate);
    }

    const deltaPosition = Vec2.sub(this.position, lastPosition);
    const currItem = this.getCurrentItem();
    if (deltaPosition.abs() > 0.01 || currItem !== this.currentItem) {
      this.computeCurrentItem();
      this.drawUpdate();
    }

    // reset lazily computed itemsInView value
    this._itemsInView = undefined;

    this.trait((t) => t.draw?.(this));

    this.animation = requestAnimationFrame(this.tick.bind(this));
  }

  private computeCurrentItem() {
    const currItem = this.getCurrentItem();

    if (Number.isNaN(currItem)) {
      throw new Error("Invalid index");
    }

    let i = 0;
    for (const child of this.items) {
      if (i % this.itemCount === currItem) {
        child.setAttribute("active", "");
      } else {
        child.removeAttribute("active");
      }
      i++;
    }

    if (this.currentItem !== currItem) {
      this.currentItem = currItem;

      this.dispatchEvent(
        new CustomEvent<number | string>("change", {
          detail: this.currentItem,
          bubbles: true,
        }),
      );
    }
  }

  private updateInputs() {
    if (this.inputState.grab.value === true) {
      // grab change
      this.grabbing = true;
      this.dispatchEvent(new Event("pointer:grab"));
      this.setTarget(undefined);
    }

    if (this.grabbing) {
      if (this.inputState.move.value.abs()) {
        this.moveVelocity.add(this.inputState.move.value);
        this.inputForce.set(this.inputState.move.value.inverse());
      } else {
        this.inputForce.mul(0);
      }
    }

    if (this.inputState.release.value) {
      this.grabbing = false;
      this.dispatchEvent(new Event("pointer:release"));

      this.inputForce.set(this.moveVelocity.inverse());
    }

    // prevent moving in wrong direction
    if (this.vertical) {
      this.inputForce.x = 0;
    } else {
      this.inputForce.y = 0;
    }

    if (this.slotElement) {
      this.slotElement.inert = this.grabbing;
    }
    if (!isTouch()) this.style.cursor = this.grabbing ? "grabbing" : "";

    this.direction.add(this.inputForce).sign();

    this.trait((t) => t.input?.(this, this.inputState));

    if (this.inputState.resize.value.abs()) {
      if (this.target) {
        this.target.add(this.inputState.resize.value);
      } else {
        this.position.add(this.inputState.resize.value);
      }
    }

    // clear
    const state = this.inputState;
    state.move.value.mul(0);
    state.resize.value.mul(0);
    state.grab.value = false;
    state.scroll.value = false;
    state.format.value = false;
    state.leave.value = false;
    state.enter.value = false;
    state.release.value = false;
  }

  public get interacting() {
    return this.inputForce.abs() > 0.5 || this.mouseDown;
  }

  private updateTick(_ms = 0) {
    const lastPosition = this.position.clone();
    const lastVelocity = this.velocity.clone();

    this.trait((t) => t.update?.(this));

    const interacting = this.target || this.interacting;

    // clamp input force
    const pos = Vec2.add(this.position, this.inputForce);
    const clamped = this.toClapmedPosition(pos);
    const diff = Vec2.sub(pos, clamped);

    if (interacting) {
      this.dragMultiplier = 0;

      if (!this.loop && diff.abs()) {
        const resitance = this.borderResistance * (1 - diff.abs() / 200);

        if (this.vertical) {
          this.inputForce.mul(resitance);
        } else {
          this.inputForce.mul(resitance);
        }
      }
    } else {
      this.dragMultiplier = this.drag;

      const bounce = this.borderBounce;
      if (!this.loop && bounce && diff.abs()) {
        if ((this.vertical && Math.abs(diff.y)) || Math.abs(diff.x)) {
          this.inputForce.sub(diff.mul(bounce));
          this.acceleration.mul(0);
        }
      }
    }

    this.moveVelocity.mul(0.6);

    this.acceleration.mul(this.dragMultiplier);

    this.acceleration.add(this.inputForce);
    this.inputForce.mul(0);

    this.velocity.mul(0.5);
    this.velocity.add(this.acceleration);

    this.deltaVelocity = Vec2.sub(this.velocity, lastVelocity);

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
              throw new Error("NaN");
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
        if (this.position.y < start.y) {
          this.position.y = max.y;
          if (this.target) this.target.y += max.y - start.y;
        } else if (this.position.y > max.y) {
          this.position.y = start.y;
          if (this.target) this.target.y -= max.y - start.y;
        }
      } else {
        // x
        if (this.position.x < start.x) {
          this.position.x = max.x;
          if (this.target) this.target.x += max.x - start.x;
        } else if (this.position.x > max.x) {
          this.position.x = start.x;
          if (this.target) this.target.x -= max.x - start.x;
        }
      }
    }

    // update final position
    this.position.add(this.targetForce);
    this.targetForce.set(0);
  }

  public debugCanvas = document.createElement("canvas");

  private getCurrentItem() {
    if (this.debug) {
      // this is only for debug information
      this.itemAngles = this.itemRects.reduce((acc, rect, i) => {
        acc[i] = (rect[this.currentAxis] / this.trackSize) * PI2;
        return acc;
      }, [] as number[]);
    }

    let positionOffset = 0;
    const sizes = this.vertical ? this.itemHeights : this.itemWidths;

    if (this.align === "center") {
      // adds half of the current item to the position to center it
      const index = findClosestItemIndex(
        this.position[this.currentAxis] - this.origin[this.currentAxis],
        sizes,
        this.trackSize,
        this.loop,
      );

      positionOffset += (sizes[index] || 0) / 2;
    }

    const index = findClosestItemIndex(
      this.position[this.currentAxis] - this.origin[this.currentAxis] - positionOffset,
      sizes,
      this.trackSize,
      this.loop,
    );

    if (Number.isNaN(index)) {
      throw new Error("Invalid index");
    }

    return index;
  }

  /**
   * Get the item at a specific position.
   */
  public getItemAtPosition(pos: Vec2) {
    // TODO: dupliacte of getCurrentItem ?
    const rects = this.itemRects;
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

  private clones: Element[] = [];

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
        const item = this.getItemAtPosition(Vec2.add(this.position, [x, 0]));
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

  private canMove(delta: Vec2) {
    if (this.overflow === "auto" && !this.hasOverflow) {
      // respect overflowscroll
      return false;
    }

    return this.dispatchEvent(new MoveEvent(this, delta));
  }

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

  private updateLayout = () => {
    const lastWidth = this._width;
    const lastHeight = this._height;
    const lastWidths = this._itemWidths;
    const lastHeights = this._itemHeights;

    this._itemRects = undefined;
    this._width = undefined;
    this._height = undefined;
    this._itemWidths = undefined;
    this._itemHeights = undefined;
    this._itemsInView = undefined;

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

    const deltaWidth = this.width - lastWidth;
    const deltaHeight = this.height - lastHeight;

    const deltaWidths = lastWidths?.map(diffArray(this.itemWidths));
    const deltaHeights = lastHeights?.map(diffArray(this.itemHeights));

    this.inputState.format.value = true;

    if (this.vertical) {
      let deltaY =
        deltaHeights?.reduce(
          (acc, val, i) => (i < this.currentIndex ? acc + val : acc),
          0,
        ) || 0;

      // Ignore this resize event, if the delta is equal to the current height
      if (this.target && this.align === "center" && deltaHeight !== this.height) {
        deltaY -= deltaHeight / 2;
      }

      if (deltaY) this.inputState.resize.value.add(0, deltaY);
    } else {
      let deltaX =
        deltaWidths?.reduce(
          (acc, val, i) => (i < this.currentIndex ? acc + val : acc),
          0,
        ) || 0;

      // Ignore this resize event, if the delta is equal to the current width
      if (this.target && this.align === "center" && deltaWidth !== this.width) {
        deltaX -= deltaWidth / 2;
      }

      if (deltaX) this.inputState.resize.value.add(deltaX, 0);
    }

    this.scrollBounds = this.getScrollBounds();
  };

  private onFormat = () => {
    const formatEvent = new CustomEvent("format", {
      bubbles: true,
      cancelable: true,
    });
    this.dispatchEvent(formatEvent);

    if (formatEvent.defaultPrevented) return;

    this.trait((t) => t.format?.(this));
  };

  public scrollDebounce?: ReturnType<typeof setTimeout>;

  private onWheel = (wheelEvent: WheelEvent) => {
    if (wheelEvent.ctrlKey === true) {
      // its a pinch zoom gesture
      return;
    }

    const delta = new Vec2(wheelEvent.deltaX, wheelEvent.deltaY);

    if (!this.canMove(delta)) return;

    const deltaThreshold = Vec2.abs(delta);
    const axisThreshold = this.vertical
      ? Math.abs(delta.x) < Math.abs(delta.y)
      : Math.abs(delta.x) > Math.abs(delta.y);

    if (axisThreshold) {
      wheelEvent.preventDefault();
    }

    if (axisThreshold && deltaThreshold > 2) {
      this.setTarget(undefined);

      this.inputState.scroll.value = true;

      if (
        this.position.x < this.scrollBounds.left - 20 ||
        this.position.y < this.scrollBounds.top - 20 ||
        this.position.x > this.scrollBounds.right + 20 ||
        this.position.y > this.scrollBounds.bottom + 20 ||
        this.scrollDebounce
      ) {
        clearTimeout(this.scrollDebounce);
        this.scrollDebounce = setTimeout(() => {
          this.scrollDebounce = undefined;
        }, 32);

        return;
      }

      if (this.vertical) {
        this.inputForce.y = delta.y;
      } else {
        this.inputForce.x = delta.x;
      }
    }
  };

  private onKeyDown = (e: KeyboardEvent) => {
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

  private onFocusIn = (e: FocusEvent) => {
    const item = this.elementItemIndex(e.target as HTMLElement);
    const dist = Vec2.dist2(this.getToItemPosition(item), this.position);
    const rect = this.itemRects[item];

    if (!rect) return;

    if (
      dist.x + rect.x > this.width ||
      dist.x < 0 ||
      dist.y + rect.y > this.height ||
      dist.y < 0
    ) {
      this.moveTo(item);
    }
  };

  private onPointerDown = (pointerEvent: PointerEvent | TouchEvent) => {
    if (pointerEvent instanceof PointerEvent) {
      if (pointerEvent.button !== 0) return; // only left click
    }

    // Try to focus this element when clicked on for arrow key navigation,
    // will only work when tabindex=0.
    this.focus();

    this.mouseDown = true;

    if (pointerEvent instanceof PointerEvent) {
      this.mousePos.x = pointerEvent.clientX;
      this.mousePos.y = pointerEvent.clientY;

      pointerEvent.preventDefault();
      pointerEvent.stopPropagation();
    } else if (pointerEvent instanceof TouchEvent) {
      this.mousePos.x = pointerEvent.touches[0]?.clientX || 0;
      this.mousePos.y = pointerEvent.touches[0]?.clientY || 0;
    }

    // stop moving when grabbing
    this.setTarget(undefined);
    this.acceleration.set(0);
  };

  private onPointerUpOrCancel = (pointerEvent: PointerEvent) => {
    this.mouseDown = false;
    this.mousePos.mul(0);

    if (this.grabbing) {
      this.grabbing = false;
      this.inputState.release.value = true;

      pointerEvent.preventDefault();
      pointerEvent.stopPropagation();
    }
  };

  private onPointerMove = (pointerEvent: PointerEvent | TouchEvent) => {
    let x = 0;
    let y = 0;

    if (pointerEvent instanceof PointerEvent) {
      x = pointerEvent.clientX;
      y = pointerEvent.clientY;
    } else if (pointerEvent instanceof TouchEvent) {
      x = pointerEvent.touches[0]?.clientX || 0;
      y = pointerEvent.touches[0]?.clientY || 0;
    }

    const pos = new Vec2(x, y);
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
  };
}

export type Easing = "ease" | "linear" | "none";

export const Ease = {
  easeInOutCirc(x: number) {
    return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
  },
  easeOutSine(x: number) {
    return Math.sin((x * Math.PI) / 2);
  },
};

function isTouch() {
  return !!navigator.maxTouchPoints || "ontouchstart" in window;
}

function debounce<T>(callback: (arg: T) => void, ms = 80) {
  let timeout: ReturnType<typeof setTimeout>;

  return (arg: T) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => callback(arg), ms);
  };
}

function mod(a: number, n: number) {
  return a - Math.floor(a / n) * n;
}

function angleDist(a: number, b: number) {
  return mod(b - a + 180, 360) - 180;
}

function timer(start: number, time: number) {
  return Math.min((Date.now() - start) / time, 1);
}

function diffArray(arr: number[]) {
  return (w: number, i: number) => {
    const b = arr[i] || 0;
    return b - w;
  };
}

function findMinDistance(
  targetPoint: number,
  targetIndex: number,
  itemWidths: number[],
  totalWidth: number,
  wrap: boolean,
) {
  // Normalize negative indices
  const normalizedIndex =
    ((targetIndex % itemWidths.length) + itemWidths.length) % itemWidths.length;

  // Calculate the base position of the target index
  let basePosition = 0;
  for (let i = 0; i < normalizedIndex; i++) {
    const width = itemWidths[i];
    if (width === undefined) {
      throw new Error("Item width is undefined");
    }
    basePosition += width;
  }

  // Consider three possible positions:
  // 1. The base position
  // 2. One wrap backwards (base - totalWidth)
  // 3. One wrap forwards (base + totalWidth)
  const positions = wrap
    ? [basePosition, basePosition - totalWidth, basePosition + totalWidth]
    : [basePosition];

  const pos = positions[0];
  if (pos === undefined) {
    throw new Error("Position is undefined");
  }

  // Find the position with the shortest distance to the target point
  let closestPosition = positions[0];
  let minDistance = Math.abs(targetPoint - pos);

  for (const position of positions) {
    const distance = Math.abs(targetPoint - position);
    if (distance < minDistance) {
      minDistance = distance;
      closestPosition = position;
    }
  }

  return closestPosition;
}

function findClosestItemIndex(
  point: number,
  itemWidths: number[],
  totalWidth: number,
  wrap: boolean,
): number {
  // Calculate cumulative positions of items
  const positions: number[] = [];
  let currentPosition = 0;

  for (const width of itemWidths) {
    positions.push(currentPosition);
    currentPosition += width;
  }

  // Find the closest item
  let closestIndex = 0;
  let minDistance = Number.POSITIVE_INFINITY;

  for (let i = 0; i < positions.length; i++) {
    // Calculate distances considering wrapping
    const itemPosition = positions[i];
    if (itemPosition === undefined) {
      throw new Error("Item position is undefined");
    }

    let distance: number;
    if (wrap) {
      distance = Math.min(
        Math.abs(point - itemPosition),
        Math.abs(point - (itemPosition + totalWidth)),
        Math.abs(point + totalWidth - itemPosition),
      );
    } else {
      distance = Math.min(Math.abs(point - itemPosition));
    }

    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = i;
    }
  }

  return closestIndex;
}

type VecOrNumber = Vec2 | number[] | number;

export class Vec2 extends Array {
  constructor(x: VecOrNumber = 0, y = 0) {
    super();

    if (Vec2.isVec(x)) {
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

  add(x: VecOrNumber, y?: number) {
    if (Vec2.isVec(x)) {
      this[0] += x[0];
      this[1] += x[1];
    } else {
      this[0] += x;
      this[1] += y === undefined ? x : y;
    }
    return this;
  }

  sub(x: VecOrNumber, y?: number) {
    if (Vec2.isVec(x)) {
      this[0] -= x[0];
      this[1] -= x[1];
    } else {
      this[0] -= x;
      this[1] -= y === undefined ? x : y;
    }
    return this;
  }

  mul(vec: VecOrNumber) {
    if (Vec2.isVec(vec)) {
      this[0] *= vec[0];
      this[1] *= vec[1];
    } else {
      this[0] *= vec;
      this[1] *= vec;
    }
    return this;
  }

  /**
   * Return a new vector inverse of the vector
   */
  inverse() {
    return new Vec2(-this[0], -this[1]);
  }

  set(x: VecOrNumber, y?: number) {
    if (Vec2.isVec(x)) {
      this[0] = x[0];
      this[1] = x[1];
    } else {
      this[0] = x;
      this[1] = y === undefined ? x : y;
    }
    return this;
  }

  mod(vec: VecOrNumber) {
    if (Vec2.isVec(vec)) {
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

  dist(vec: Vec2) {
    return Math.sqrt((vec[0] - this[0]) ** 2 + (vec[1] - this[1]) ** 2);
  }

  abs() {
    return Math.sqrt(this[0] ** 2 + this[1] ** 2);
  }

  precision(precision: number) {
    this[0] = Math.floor(this[0] / precision) * precision;
    this[1] = Math.floor(this[1] / precision) * precision;
    return this;
  }

  floor() {
    this[0] = Math.floor(this[0]);
    this[1] = Math.floor(this[1]);
    return this;
  }

  clone() {
    return new Vec2(this);
  }

  isNaN() {
    return Number.isNaN(this[0]) || Number.isNaN(this[1]);
  }

  toString(): string {
    return `Vec{${this.map((v) => v.toFixed(2)).join(",")}}`;
  }

  static add(vec1: VecOrNumber, vec2: VecOrNumber) {
    if (Vec2.isVec(vec1)) {
      return new Vec2(vec1[0], vec1[1]).add(vec2);
    }
    return new Vec2(vec1, vec1).add(vec2);
  }

  static sub(vec1: VecOrNumber, vec2: VecOrNumber) {
    if (Vec2.isVec(vec1)) {
      return new Vec2(vec1[0], vec1[1]).sub(vec2);
    }
    return new Vec2(vec1, vec1).sub(vec2);
  }

  static mul(vec1: VecOrNumber, vec2: VecOrNumber) {
    if (Vec2.isVec(vec1)) {
      return new Vec2(vec1[0], vec1[1]).mul(vec2);
    }
    return new Vec2(vec1, vec1).mul(vec2);
  }

  static abs(vec: Vec2) {
    return new Vec2(vec.x, vec.y).abs();
  }

  static dist2(vec1: Vec2, vec2: Vec2) {
    return new Vec2(vec1[0] - vec2[0], vec1[1] - vec2[1]);
  }

  static isVec = Array.isArray;
}

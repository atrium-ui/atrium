import { css, html, LitElement } from "lit";
import { property, query } from "lit/decorators.js";
import { Ease, timer, Vec } from "./utils.js";
import { AutoplayTrait, Trait, PointerTrait, AutoFocusTrait } from "./Traits.js";
import { DebugTrait } from "./traits/Debug.js";

export type InputState = {
  grab: {
    value: boolean;
  };
  move: {
    value: Vec;
  };
  swipe: {
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

type Easing = "ease" | "linear" | "none";

function mod(a, n) {
  return a - Math.floor(a / n) * n;
}

function angleDist(a, b) {
  return mod(b - a + 180, 360) - 180;
}

export class Track extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block;
        outline: none;
        overflow: hidden;
        touch-action: pan-y;
      }

      .track {
        display: flex;
        overflow: visible;
        will-change: transform;
      }

      :host([vertical]) .track {
        flex-direction: column;
      }

      debug-hud {
        display: inline-block;
        position: absolute;
        top: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1000;
        pointer-events: none;
      }
    `;
  }

  render() {
    return html`
      <div class="track">
        <slot></slot>
      </div>
    `;
  }

  @query(".track")
  public readonly track!: HTMLElement;

  get itemCount() {
    return this.children.length - this.clones.length;
  }

  getItemRects() {
    return new Array(this.itemCount)
      .fill(0)
      .map((_, i) => new Vec(this.itemWidths[i], this.itemHeights[i]));
  }

  getItemRect(index: number) {
    index = index % this.itemCount;
    return new Vec(this.itemWidths[index], this.itemHeights[index]);
  }

  getCurrentSlideRect() {
    return this.getItemRect(this.currentItem);
  }

  _widths;
  get itemWidths() {
    if (!this._widths) {
      this._widths = new Array(this.itemCount).fill(1).map((_, i) => {
        return (this.children[i] as HTMLElement)?.offsetWidth || 0;
      });
    }
    return this._widths;
  }

  _heights;
  get itemHeights() {
    if (!this._heights) {
      this._heights = new Array(this.itemCount).fill(1).map((_, i) => {
        return (this.children[i] as HTMLElement)?.offsetHeight || 0;
      });
    }
    return this._heights;
  }

  get trackWidth() {
    if (!this.vertical) {
      return this.itemWidths.reduce((last, curr) => last + curr, 0);
    }
    return this.offsetWidth;
  }

  get trackHeight() {
    if (this.vertical) {
      return this.itemHeights.reduce((last, curr) => last + curr, 0);
    }
    return this.offsetHeight;
  }

  get trackSize() {
    return this.vertical ? this.trackHeight : this.trackWidth;
  }

  get currentPosition() {
    return this.vertical ? this.position.y : this.position.x;
  }

  get overflowWidth() {
    return this.trackWidth - this.offsetWidth;
  }

  get overflowHeight() {
    return this.trackHeight - this.offsetHeight;
  }

  currentItem = 0;

  get value() {
    return this.currentItem % this.itemCount;
  }

  private animation: number | undefined;
  frameRate = 0;
  tickRate = 1000 / 144;
  lastTick = 0;
  accumulator = 0;
  frame = 0;
  lastTickFrame = 0;

  mousePos = new Vec();
  inputForce = new Vec();
  mouseGrab = false;
  private scrollTimeout;
  private canScroll = true;

  position = new Vec();
  acceleration = new Vec();
  direction = new Vec();

  get normal() {
    return this.vertical ? new Vec(0, 1) : new Vec(1, 0);
  }

  targetForce = new Vec();
  targetStart = new Vec();
  target?: Vec;
  targetEasing: Easing = "linear";

  transitionAt = 0;
  transitionTime = 750;
  transition = 0;

  inputState: InputState = {
    grab: {
      value: false,
    },
    release: {
      value: false,
    },
    move: {
      value: new Vec(), // deltaX
    },
    swipe: {
      value: new Vec(), // deltaX
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

  traits: Trait[] = [];

  trait(callback: (t) => void) {
    this.traits.forEach((t) => t && t.enabled && callback(t));
  }

  findTrait(id: string) {
    for (const trait of this.traits) {
      if (trait.id === id) {
        return trait;
      }
    }
    return undefined;
  }

  @property({ type: Boolean, reflect: true }) vertical = false;
  @property({ type: Boolean, reflect: true }) snap = false;
  @property({ type: Boolean, reflect: true }) debug = false;
  @property({ type: Boolean, reflect: true }) loop = false;
  @property({ type: Number, reflect: false }) autoplay = 0;
  @property({ type: Boolean, reflect: true }) autorun = false;

  /**
   * # overflow
   * item: scroll until the last item is active
   * fill (default): scroll until the track reaches the last item visible to fill the width of the track
   */
  @property({ type: String }) overflow: "item" | "fill" = "fill";

  /**
   * only scroll when items are overflown
   */
  @property({ type: Boolean, reflect: true }) overflowscroll = false;

  protected updated(): void {
    for (const trait of this.traits) {
      if (Track.observedAttributes.includes(trait.id)) {
        trait.enabled = this.hasAttribute(trait.id);
      }
    }
  }

  pointerEnter(e) {
    this.inputState.enter.value = true;
  }

  pointerLeave(e) {
    this.inputState.leave.value = true;
  }

  pointerDown(e) {
    this.mousePos.x = e.x;
    this.mousePos.y = e.y;

    this.setTarget(undefined);
  }

  pointerUp(e) {
    this.mousePos.mul(0);

    if (this.mouseGrab) {
      this.mouseGrab = false;
      e.preventDefault();

      this.inputState.release.value = true;
    }
  }

  pointerMove(e) {
    e.preventDefault();

    const pos = new Vec(e.x, e.y);
    const delta = Vec.sub(pos, this.mousePos);

    if (!this.mouseGrab && delta.abs() > 3) {
      if (this.vertical && this.mousePos.y && Math.abs(delta.x) < Math.abs(delta.y)) {
        this.mouseGrab = true;
        this.inputState.grab.value = true;
      } else if (this.mousePos.x && Math.abs(delta.y) < Math.abs(delta.x)) {
        this.mouseGrab = true;
        this.inputState.grab.value = true;
      }
    }

    if (this.mouseGrab) {
      this.inputState.move.value.add(delta.clone());
      this.mousePos.set(pos);
    }
  }

  onScroll() {
    clearTimeout(this.scrollTimeout);

    this.canScroll = false;

    this.scrollTimeout = setTimeout(() => {
      this.canScroll = true;
    }, 200);
  }

  onWheel(e) {
    const threshold = this.vertical
      ? Math.abs(e.deltaX) < Math.abs(e.deltaY)
      : Math.abs(e.deltaX) > Math.abs(e.deltaY);

    if (this.canScroll) {
      if (threshold) {
        const delta = new Vec(e.deltaX / 2, e.deltaY / 2);
        if (delta.abs() > 2 || this.inputState.swipe.value.abs() < 2) {
          this.inputState.swipe.value.add(delta);
          e.preventDefault();
        }
      }
    }
  }

  onKeyDown(e) {
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
  }

  format() {
    this.inputState.format.value = true;
    this._widths = undefined;
    this._heights = undefined;

    this.moveBy(0, "none");
  }

  getToItemPosition(index: number = 0) {
    const rects = this.getItemRects();
    const pos = new Vec();

    if (index < 0) {
      for (let i = 0; i > index; i--) {
        if (this.vertical) {
          pos.y -= rects[i]?.y || 0;
        } else {
          pos.x -= rects[i]?.x || 0;
        }
      }
    } else if (index > this.itemCount) {
      for (let i = 0; i < index; i++) {
        if (this.vertical) {
          pos.y += rects[i % this.itemCount]?.y || 0;
        } else {
          pos.x += rects[i % this.itemCount]?.x || 0;
        }
      }
    } else {
      for (let i = 0; i < index; i++) {
        if (this.vertical) {
          pos.y += rects[i]?.y || 0;
        } else {
          pos.x += rects[i]?.x || 0;
        }
      }
    }

    return pos;
  }

  setTarget(vec: Vec | undefined, easing: Easing = "none") {
    if (vec !== null) {
      this.transitionAt = Date.now();
      this.targetStart.set(this.position);
    }
    this.targetEasing = easing;
    this.target = vec;
  }

  moveBy(byItems: number, easing?: Easing) {
    if (!easing) {
      // auto easing
      easing = this.transition === 0 || this.transition === 1 ? "ease" : "linear";
    }

    let i = this.currentItem + byItems;
    if (!this.loop) {
      i = Math.min(Math.max(0, i), this.itemCount - 1);
    }
    const pos = this.getToItemPosition(i);
    this.setTarget(pos, easing);
  }

  moveTo(index: number, easing: Easing) {
    this.moveBy(index - this.currentItem, easing);
  }

  startAnimate() {
    if (!this.animation) {
      requestAnimationFrame(this.tick.bind(this));
      this.trait((t) => t.start());
    }
  }

  stopAnimate() {
    if (this.animation) {
      cancelAnimationFrame(this.animation);
      this.animation = undefined;
      this.trait((t) => t.stop());
    }
  }

  tick(ms = 0) {
    if (!this.lastTick) this.lastTick = ms;
    if (ms - this.lastTick > 1000) this.lastTick = ms;

    const deltaTick = ms - this.lastTick;
    this.frameRate = 1000 / deltaTick;
    this.lastTick = ms;

    this.updateInputs();

    this.accumulator += deltaTick;

    const lastPosition = this.position.clone();

    let ticks = 0;
    const maxTicks = 10;
    while (this.accumulator >= this.tickRate && ticks < maxTicks) {
      ticks++;
      this.accumulator -= this.tickRate;

      this.updateTick();
    }

    const deltaPosition = Vec.sub(this.position, lastPosition);

    if (deltaPosition.abs() > 0) {
      const currItem = this.getCurrentItem(this.position);

      if (currItem !== this.currentItem) {
        this.currentItem = currItem;
        this.dispatchEvent(new CustomEvent<number>("change", { detail: this.value }));

        let i = 0;
        for (const child of this.children) {
          if (i === this.currentItem) {
            child.setAttribute("active", "");
          } else {
            child.removeAttribute("active");
          }
          i++;
        }
      }

      this.drawUpdate();
    }

    this.frame++;

    this.animation = requestAnimationFrame(this.tick.bind(this));
  }

  updateInputs() {
    this.trait((t) => t.input(this.inputState));

    this.direction.add(this.inputForce).sign();

    // clear
    const state = this.inputState;
    state.move.value.mul(0);
    state.swipe.value.mul(0);
    state.grab.value = false;
    state.format.value = false;
    state.leave.value = false;
    state.enter.value = false;
    state.release.value = false;
  }

  updateTick() {
    this.position.add(this.acceleration);
    this.acceleration.mul(0.9);

    this.trait((t) => t.update());

    this.acceleration.add(this.inputForce);
    this.inputForce.mul(0);

    if (this.target !== undefined) {
      switch (this.targetEasing) {
        case "ease":
          {
            this.transition = timer(this.transitionAt, this.transitionTime);
            const easedDelta = Vec.sub(this.target, this.targetStart).mul(
              Ease.easeInOutCirc(this.transition)
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
              delta.mod([this.trackWidth, this.trackHeight]).mul(42 / this.transitionTime)
            );
          }
          break;
        case "none":
        default:
          this.targetForce.set(Vec.sub(this.targetForce.set(this.target), this.position));
          break;
      }
    }

    // loop
    if (this.loop) {
      const start = new Vec();
      const max = new Vec(start.x + this.trackWidth, start.y + this.trackHeight);

      if (this.vertical) {
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
      } else {
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
    }

    // update final position
    this.position.add(this.targetForce);
    this.targetForce.mul(0);

    // TODO: need to self fix positon, sometimes NaN on innital load and resize
    this.position[0] = this.position[0] || 0;
    this.position[1] = this.position[1] || 0;
  }

  getCurrentItem(pos: Vec) {
    const currentAngle = (this.currentPosition / this.trackSize) * 360;

    let minDist = Infinity;
    let angleToClosestIndex = 0;

    for (let i = -1; i < this.itemCount + 1; i++) {
      const itemIndex = i % this.itemCount;

      const currentItemAngle = (this.itemWidths[itemIndex] / this.trackSize) * 360;
      const itemAngle = (currentItemAngle * itemIndex) % 360;
      const deltaAngle = angleDist(itemAngle, currentAngle);

      const offset = Math.floor(i / this.itemCount) * this.itemCount;

      if (Math.abs(deltaAngle) <= minDist) {
        minDist = Math.abs(deltaAngle);
        angleToClosestIndex = itemIndex;
        if (currentAngle > 180) {
          angleToClosestIndex += offset;
        }
      }
    }

    return angleToClosestIndex;
  }

  getItemAtPosition(x: number) {
    const rects = this.getItemRects();
    let px = 0;
    if (x > 0) {
      for (const item of rects) {
        if (px + item.x > x % this.trackWidth) {
          const offset = Math.floor(x / this.trackWidth) * this.itemCount;
          return {
            domIndex: offset + rects.indexOf(item),
            index: rects.indexOf(item),
          };
        }
        px += item.x;
      }
    } else {
      for (const item of [...rects].reverse()) {
        if (px - item.x < x % -this.trackWidth) {
          const offset = Math.floor(x / this.trackWidth) * this.itemCount;
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

  drawUpdate() {
    if (this.track) {
      this.track.style.transform = `translate(${-this.position.x}px, ${-this.position
        .y}px)`;
    }

    if (this.loop) {
      // const visibleItems: number[] = [];
      let lastItem: number | null = null;
      for (let x = -this.offsetWidth; x < this.offsetWidth + this.offsetWidth; x += 100) {
        const item = this.getItemAtPosition(this.position.x + x);
        if (item != null && item.index !== lastItem) {
          // clone nodes if possible
          if (item.domIndex > 0) {
            const child = this.children[item.domIndex];
            const actualChild = this.children[item.index];

            if (!child && actualChild) {
              const clone = actualChild.cloneNode(true) as HTMLElement;
              this.clones.push(clone);
              clone.classList.add("ghost");
              this.appendChild(clone);
            }
          }

          // visibleItems.push(item.index);
          lastItem = item.index;
        }
      }
    }
  }

  private observer = new IntersectionObserver(this.onIntersect.bind(this), {});

  onIntersect(intersections) {
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

    // stop last animation if there was one
    this.stopAnimate();

    this.tabIndex = 0;

    window.addEventListener("pointermove", this.pointerMove.bind(this));
    this.addEventListener("pointerdown", this.pointerDown.bind(this));
    window.addEventListener("pointerup", this.pointerUp.bind(this));
    window.addEventListener("pointercancel", this.pointerUp.bind(this));
    this.addEventListener("pointerleave", this.pointerLeave.bind(this));
    this.addEventListener("pointerenter", this.pointerEnter.bind(this));
    this.addEventListener("keydown", this.onKeyDown.bind(this));
    this.addEventListener("wheel", this.onWheel.bind(this));

    window.addEventListener("resize", this.format.bind(this), { passive: true });
    window.addEventListener("scroll", this.onScroll.bind(this), { capture: true });
    window.addEventListener("load", this.format.bind(this), { capture: true });

    requestAnimationFrame(() => {
      // needs markup to exist
      this.format();
    });

    this.traits = [
      new PointerTrait("pointer", this, true),
      new AutoFocusTrait("autofocus", this),
      new DebugTrait("debug", this),
      new AutoplayTrait("autoplay", this),
    ];

    this.dispatchEvent(new CustomEvent("change", { detail: this.value }));

    this.observer.observe(this);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();

    this.stopAnimate();

    window.removeEventListener("pointermove", this.pointerMove.bind(this));
    this.removeEventListener("pointerdown", this.pointerDown.bind(this));
    window.removeEventListener("pointerup", this.pointerUp.bind(this));
    window.removeEventListener("pointercancel", this.pointerUp.bind(this));
    this.removeEventListener("pointerleave", this.pointerLeave.bind(this));
    this.removeEventListener("pointerenter", this.pointerEnter.bind(this));
    this.removeEventListener("keydown", this.onKeyDown.bind(this));
    this.removeEventListener("wheel", this.onWheel.bind(this));

    window.removeEventListener("resize", this.format.bind(this));
    window.removeEventListener("scroll", this.onScroll.bind(this));
    window.removeEventListener("load", this.format.bind(this));

    this.observer.unobserve(this);
  }
}

customElements.define("sv-track", Track);

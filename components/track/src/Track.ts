import { css, html, LitElement } from "lit";
import { property, query } from "lit/decorators.js";
import { Ease, timer, Vec } from "./utils.js";
import {
  AutoplayTrait,
  LoopTrait,
  AutorunTrait,
  Trait,
  PointerTrait,
  SnapTrait,
  AutoFocusTrait,
  DebugTrait,
} from "./Traits.js";

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

type Easing = "ease" | "linear";

export class Track extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block;
        outline: none;
        overflow: hidden;
        touch-action: pan-y;
        position: relative; /* remove this */
      }

      .track {
        display: flex;
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
        background: rgba(0, 0, 0, 0.3);
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
  private readonly track!: HTMLElement;

  get itemCount() {
    let count = 0;
    for (const child of this.children) {
      if (!child.className.includes("ghost")) {
        count++;
      }
    }
    return count;
  }

  // TODO: implement
  getItemRects() {
    return new Array(this.itemCount)
      .fill(0)
      .map((_, i) => new Vec(this.itemWidths[i], this.itemHeights[i]));
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
    return this.itemWidths.reduce((last, curr) => last + curr, 0);
  }

  get trackHeight() {
    return this.itemHeights.reduce((last, curr) => last + curr, 0);
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

  animation;
  frameRate = 0;
  tickRate = 1000 / 140;
  lastTick = 0;
  accumulator = 0;
  frame = 0;
  lastTickFrame = 0;

  mousePos = new Vec();
  inputForce = new Vec();
  mouseGrab = false;
  canScroll = true;
  scrollTimeout;

  position = new Vec();
  direction = new Vec();

  targetForce = new Vec();
  targetStart = new Vec();
  target?: Vec;
  targetEasing: Easing = "linear";

  transitionAt = 0;
  transitionTime = 500;
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

  clearInputState() {
    const state = this.inputState;
    state.move.value.mul(0);
    state.swipe.value.mul(0);
    state.grab.value = false;
    state.format.value = false;
    state.leave.value = false;
    state.enter.value = false;
    state.release.value = false;
  }

  traits: Trait[] = [];

  @property({ type: Boolean, reflect: true }) vertical = false;
  @property({ type: Boolean, reflect: true }) snap = false;
  @property({ type: Boolean, reflect: true }) debug = false;
  @property({ type: Boolean, reflect: true }) loop = false;
  @property({ type: Number, reflect: false }) autoplay = 0;
  @property({ type: Boolean, reflect: true }) autorun = false;
  @property({ type: String, reflect: true }) overflow: "item" | "full" = "item";

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

    this.requestUpdate();
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
      this.inputState.move.value.add(delta.clone().mul(-1));
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

  onFocus(e) {
    // TODO: will set target on click too.
    // const pos = this.getItemPosition([...this.children].indexOf(e.target));
    // this.setTarget(-pos);
  }

  next() {
    const t = this.transition === 0 || this.transition === 1;
    this.moveBy(1, t ? "ease" : "linear");
  }

  prev() {
    const t = this.transition === 0 || this.transition === 1;
    this.moveBy(-1, t ? "ease" : "linear");
  }

  onKeyDown(e) {
    const Key = {
      prev: this.vertical ? "ArrowUp" : "ArrowLeft",
      next: this.vertical ? "ArrowDown" : "ArrowRight",
    };

    if (e.key === Key.prev) {
      this.prev();
      e.preventDefault();
    }
    if (e.key === Key.next) {
      this.next();
      e.preventDefault();
    }
  }

  format() {
    this.inputState.format.value = true;
    this._widths = undefined;
    this._heights = undefined;

    this.requestUpdate();
  }

  getItemPosition(index: number = 0) {
    const toActualPointer = index < 0 ? index + this.itemCount : index;

    const pos = new Vec();
    for (let i = 0; i < Math.abs(toActualPointer); i++) {
      pos.x -= this.itemWidths[i] || 0;
      pos.y -= this.itemHeights[i] || 0;
    }

    if (index < 0) {
      pos.x += this.trackWidth;
      pos.y += this.trackHeight;
    }

    return pos;
  }

  setTarget(vec: Vec | undefined, easing: Easing = "linear") {
    if (vec !== null) {
      this.transitionAt = Date.now();
      this.targetStart.set(this.position);
    }
    this.targetEasing = easing;
    this.target = vec;
  }

  moveBy(byItems: number, easing: Easing = "linear") {
    let i = this.currentItem + byItems;
    if (!this.loop) {
      i = Math.min(Math.max(0, i), this.itemCount - 1);
    }
    this.setTarget(this.getItemPosition(i), easing);
  }

  moveTo(index: number, easing: Easing = "linear") {
    this.moveBy(index - this.currentItem, easing);
  }

  stopAnimate() {
    cancelAnimationFrame(this.animation);
  }

  tick(ms = 0) {
    if (!this.lastTick) this.lastTick = ms;
    if (ms - this.lastTick > 1000) this.lastTick = ms;

    const deltaTick = ms - this.lastTick;
    this.frameRate = 1000 / deltaTick;
    this.lastTick = ms;

    // handles inputs synchronously
    this.updateInputs();

    this.accumulator += deltaTick;

    let ticks = 0;
    while (this.accumulator >= this.tickRate && ticks < 10) {
      ticks++;
      this.accumulator -= this.tickRate;
      this.updateTick();
    }

    this.clearInputState();

    this.frame++;

    this.animation = requestAnimationFrame(this.tick.bind(this));
  }

  updateInputs() {
    for (const trait of this.traits) {
      if (trait && trait.enabled) {
        trait.input(this.inputState);
      }
    }

    this.direction.add(this.inputForce).sign();
  }

  updateTick() {
    for (const trait of this.traits) {
      if (trait && trait.enabled) {
        trait.update();
      }
    }

    this.position.add(this.inputForce);

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
        default:
          {
            const prog = Vec.sub(this.position, this.target).abs() / Vec.abs(this.target);
            this.transition = Math.round(prog * 100) / 100 || 0;
            this.targetForce
              .set(this.target)
              .sub(this.position)
              .mod([-this.trackWidth, -this.trackHeight])
              .mul(42 / this.transitionTime);
          }
          break;
      }
    }

    // update final position
    this.position.add(this.targetForce);
    this.targetForce.mul(0);

    // determine current item
    let currItem;
    for (let i = -1; i < this.itemCount + 1; i++) {
      const pos = this.getItemPosition(i);
      const w = (this.vertical ? this.itemHeights : this.itemWidths)[
        Math.abs(i) % this.itemCount
      ];
      const p = this.vertical ? pos.y : pos.x;
      const j = this.vertical ? this.position.y : this.position.x;

      if (this.vertical ? this.direction.x > 0 : this.direction.y > 0) {
        // to right
        if (p + w / 4 < j) {
          currItem = i - 1;
          break;
        }
      } else {
        // to left
        if (p + w / 1.25 < j) {
          currItem = i - 1;
          break;
        }
      }
    }
    if (currItem === undefined) {
      // TODO: i think there is a bug here when im at the last item and scroll past
      if (this.direction.abs() > 0) {
        currItem = 0;
      } else {
        currItem = this.itemCount - 1;
      }
    }

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

    const track = this.track;
    if (track) {
      if (this.vertical) {
        // TODO: should be handled automaticly; If im not in verical mode, position.y should be 0.
        track.style.transform = `translate(${0}px, ${this.position.y}px)`;
      } else {
        track.style.transform = `translate(${this.position.x}px, ${0}px)`;
      }
    }
  }

  connectedCallback(): void {
    super.connectedCallback();

    this.tabIndex = 0;

    window.addEventListener("pointermove", this.pointerMove.bind(this));
    this.addEventListener("pointerdown", this.pointerDown.bind(this));
    window.addEventListener("pointerup", this.pointerUp.bind(this));
    window.addEventListener("pointercancel", this.pointerUp.bind(this));
    this.addEventListener("pointerleave", this.pointerLeave.bind(this));
    this.addEventListener("pointerenter", this.pointerEnter.bind(this));
    this.addEventListener("keydown", this.onKeyDown.bind(this));
    this.addEventListener("wheel", this.onWheel.bind(this));
    this.addEventListener("focus", this.onFocus.bind(this), { capture: true });

    window.addEventListener("resize", this.format.bind(this), { passive: true });
    window.addEventListener("scroll", this.onScroll.bind(this), { capture: true });

    requestAnimationFrame(() => {
      // needs markup to exist
      this.format();
      this.stopAnimate();
      this.tick();
    });

    this.traits = [
      new PointerTrait("pointer", this, true),
      new LoopTrait("loop", this),
      new SnapTrait("snap", this),
      new AutoFocusTrait("autofocus", this, true),
      new DebugTrait("debug", this),
      new AutoplayTrait("autoplay", this),
      new AutorunTrait("autorun", this),
    ];

    this.dispatchEvent(new CustomEvent("change", { detail: this.value }));
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
    this.removeEventListener("focus", this.onFocus.bind(this));

    window.removeEventListener("resize", this.format.bind(this));
    window.removeEventListener("scroll", this.onScroll.bind(this));
  }
}

customElements.define("sv-track", Track);

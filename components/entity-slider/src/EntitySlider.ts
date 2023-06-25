import { css, html, LitElement } from "lit";
import { property, query } from "lit/decorators.js";
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
import { Ease, timer } from "./utils.js";

export type InputState = {
  grab: {
    value: boolean;
  };
  move: {
    value: number;
  };
  swipe: {
    value: number;
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

      debug-hud {
        display: inline-block;
        position: absolute;
        top: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.2);
        z-index: 1000;
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
    // TODO: bad code
    return [...this.children]
      .filter((child) => !child.classList.contains("ghost"))
      .reduce((curr) => curr + 1, 0);
  }

  get itemWidths() {
    // TODO: bad code
    return new Array(this.itemCount).fill(1).map((_, i) => {
      return this.children[i]?.clientWidth || 0;
    });
  }

  get trackWidth() {
    return this.itemWidths.reduce((last, curr) => last + curr, 0);
  }

  itemWidth = 250;
  currentItem = 0;

  animation;
  frameRate = 0;
  tickRate = 1000 / 140;
  lastTick = 0;
  accumulator = 0;
  frame = 0;
  lastTickFrame = 0;

  inputForceX = 0;

  targetForceX = 0;
  targetXStart;
  targetX;
  targetEasing: Easing = "linear";

  transitionAt = 0;
  transitionTime = 669;

  positionX = 0;
  mouseX = 0;
  mouseY = 0;

  mouseGrab = false;

  canScroll = true;
  scrollTimeout;

  inputState: InputState = {
    grab: {
      value: false,
    },
    release: {
      value: false,
    },
    move: {
      value: 0, // deltaX
    },
    swipe: {
      value: 0, // deltaX
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
    state.move.value = 0;
    state.swipe.value = 0;
    state.grab.value = false;
    state.format.value = false;
    state.leave.value = false;
    state.enter.value = false;
    state.release.value = false;
  }

  traits: Trait[] = [];

  @property({ type: Boolean, reflect: true })
  snap = false;

  @property({ type: Boolean, reflect: true })
  debug = false;

  @property({ type: Boolean, reflect: true })
  loop = false;

  @property({ type: Boolean, reflect: true })
  autoplay = false;

  @property({ type: Boolean, reflect: true })
  autorun = false;

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
    this.mouseX = e.x;
    this.mouseY = e.y;
    this.setTarget(null);
  }

  pointerUp(e) {
    this.mouseX = 0;
    this.mouseY = 0;

    if (this.mouseGrab) {
      this.mouseGrab = false;
      e.preventDefault();

      this.inputState.release.value = true;
    }

    this.requestUpdate();
  }

  pointerMove(e) {
    e.preventDefault();

    const deltaX = e.x - this.mouseX;
    const deltaY = e.y - this.mouseY;

    if (!this.mouseGrab && this.mouseX && Math.abs(deltaY) < Math.abs(deltaX)) {
      this.mouseGrab = true;
      this.inputState.grab.value = true;
    }

    if (this.mouseGrab) {
      this.inputState.move.value += -deltaX;

      this.mouseX = e.x;
      this.mouseY = e.y;
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
    if (this.canScroll && Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      this.inputState.swipe.value += e.deltaX / 2;

      e.preventDefault();
    }
  }

  onFocus(e) {
    // TODO: will set target on click too.
    // const pos = this.getItemPosition([...this.children].indexOf(e.target));
    // this.setTarget(-pos);
  }

  onKeyDown(e) {
    if (e.key === "ArrowLeft") {
      this.moveBy(-1, "ease");
    }
    if (e.key === "ArrowRight") {
      this.moveBy(1, "ease");
    }
  }

  format() {
    this.inputState.format.value = true;

    this.requestUpdate();
  }

  getItemPosition(toIndex: number = 0): number {
    const toActualPointer = toIndex < 0 ? toIndex + this.itemCount : toIndex;

    let x = 0;
    for (let i = 0; i < Math.abs(toActualPointer); i++) {
      x -= this.itemWidths[i] || 0;
    }

    if (toIndex < 0) {
      x += this.trackWidth;
    }

    return x;
  }

  setTarget(x, easing: Easing = "linear") {
    if (x !== null) {
      this.transitionAt = Date.now();
      this.targetXStart = this.positionX;
    }
    this.targetEasing = easing;
    this.targetX = x;
  }

  moveBy(byItems: number, easing: Easing = "linear") {
    const i = this.currentItem + byItems;
    const pos = this.getItemPosition(i);
    this.setTarget(pos, easing);
  }

  stopAnimate() {
    cancelAnimationFrame(this.animation);
  }

  tick(ms = 0) {
    this.animation = requestAnimationFrame(this.tick.bind(this));

    if (!this.lastTick) this.lastTick = ms;

    const deltaTick = ms - this.lastTick;
    this.frameRate = 1000 / deltaTick;
    this.lastTick = ms;

    // handles inputs synchronously
    this.updateInputs();
    this.clearInputState();

    this.accumulator += deltaTick;

    let ticks = 0;
    while (this.accumulator >= this.tickRate && ticks < 10) {
      ticks++;
      this.accumulator -= this.tickRate;
      this.updateTick();
    }

    this.frame++;
  }

  updateInputs() {
    for (const trait of this.traits) {
      if (trait && trait.enabled) trait.input(this.inputState);
    }

    this.positionX += this.inputForceX;
  }

  updateTick() {
    for (const trait of this.traits) {
      if (trait && trait.enabled) trait.update();
    }

    if (this.targetX != null) {
      switch (this.targetEasing) {
        case "ease":
          {
            const transitionTime = timer(this.transitionAt, this.transitionTime);
            const easedDelta =
              (this.targetX - this.targetXStart) * Ease.easeInOutCirc(transitionTime);
            this.targetForceX = this.targetXStart + easedDelta - this.positionX;
          }
          break;
        default:
          {
            const diff = (this.targetX - this.positionX - 1) % -this.trackWidth;
            this.targetForceX = diff * 0.1;
          }
          break;
      }
    }

    // update final position
    this.positionX += this.targetForceX;

    this.targetForceX *= 0;

    // determine current item
    let x = 0;
    let i = 0;
    for (const w of this.itemWidths) {
      x -= w;
      if (this.positionX > x) {
        this.currentItem = i;
        break;
      }
      i++;
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
      // new AutoplayTrait("autoplay", this),
      // new AutorunTrait("autorun", this),
    ];
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

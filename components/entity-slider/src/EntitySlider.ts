import { css, html, LitElement } from "lit";
import { property, query } from "lit/decorators.js";
import {
  AutoplayTrait,
  LoopTrait,
  AutorunTrait,
  Trait,
  PointerTrait,
  SnapTrait,
} from "./Traits.js";
import { Ease, timer } from "./utils.js";

export type InputState = {
  grab: {
    value: boolean;
  };
  move: {
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
      }

      .track {
        display: flex;
        will-change: transform;
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
    // TODO: "..." bad
    return [...this.children]
      .filter((child) => !child.classList.contains("ghost"))
      .reduce((curr) => curr + 1, 0);
  }

  trackWidth = this.itemCount;
  itemWidth = 250;
  currentItem = 0;

  animation;
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
    state.grab.value = false;
    state.format.value = false;
    state.leave.value = false;
    state.enter.value = false;
    state.release.value = false;
  }

  traits: Trait[] = [
    new PointerTrait("pointer", this, true),
    new LoopTrait("loop", this),
    new SnapTrait("snap", this),
    // new AutoplayTrait("autoplay", this),
    // new AutorunTrait("autorun", this),
  ];

  @property({ type: Boolean, reflect: true })
  snap = false;

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

    // TODO: optimise scrolling
    this.canScroll = false;

    this.scrollTimeout = setTimeout(() => {
      this.canScroll = true;
    }, 200);
  }

  onWheel(e) {
    if (this.canScroll && Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      this.inputState.move.value += e.deltaX / 2;

      e.preventDefault();
    }
  }

  onFocus(e) {
    const pos = this.getItemPosition([...this.children].indexOf(e.target));
    this.setTarget(-pos);
  }

  onKeyDown(e) {
    if (e.key === "ArrowLeft") {
      this.moveBy(-1);
    }
    if (e.key === "ArrowRight") {
      this.moveBy(1);
    }
  }

  format() {
    this.trackWidth = this.getItemPosition(this.itemCount);

    this.inputState.format.value = true;

    this.requestUpdate();
  }

  getItemWidth(index: number) {
    return this.children[index].clientWidth;
  }

  getItemPosition(end: number = 0) {
    let width = 0;
    let index = 0;
    for (const child of this.children) {
      if (index >= end) break;

      width += child.clientWidth;
      index++;
    }
    return width;
  }

  setTarget(x, easing: Easing = "linear") {
    if (x !== null) {
      this.transitionAt = Date.now();
      this.targetXStart = this.positionX;
    }
    this.targetEasing = easing;
    this.targetX = x;
  }

  moveBy(items: number, easing: Easing = "linear") {
    // TODO: fix this
    const index = this.currentItem + items;
    const pos = -this.getItemPosition(index);
    // console.log("to item", this.currentItem + items, pos);
    this.setTarget(pos, easing);
  }

  stopAnimate() {
    cancelAnimationFrame(this.animation);
  }

  tick(ms = 0) {
    this.animation = requestAnimationFrame(this.tick.bind(this));

    if (!this.lastTick) this.lastTick = ms;

    const deltaTick = ms - this.lastTick;
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

  setPos(x) {
    this.positionX = x;
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
            const diff = (this.targetX - this.positionX) % -this.trackWidth;
            this.targetForceX = diff * 0.1;
          }
          break;
      }
    }

    // update final position
    this.positionX += this.targetForceX;

    this.targetForceX *= 0;

    this.currentItem = 0;
    for (let i = 0; i < this.itemCount; i++) {
      const x = -this.getItemPosition(this.currentItem + 1);
      const width = this.getItemWidth(this.currentItem);
      if (this.positionX - width / 2 >= x) {
        break;
      } else {
        this.currentItem++;
      }
    }

    window.currentItem = this.currentItem;
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
      this.tick();
    });
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

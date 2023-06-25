import { css, html, LitElement, PropertyValueMap } from "lit";
import { property, query } from "lit/decorators.js";
import { AutoplayTrait, LoopTrait, AutorunTrait, Trait, PointerTrait } from "./Traits.js";
import { Ease, timer } from "./utils.js";

export type InputState = {
  grab: {
    value: boolean;
  };
  move: {
    value: boolean;
    detlaX: number;
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

export class EntitySlider extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block;
        outline: none;
        overflow: hidden;
        touch-action: pan-y;
      }

      .tile-track {
        display: flex;
        will-change: transform;
      }
    `;
  }

  render() {
    return html`
      <div
        tabindex="0"
        class="tile-slider"
        style="${`--width: ${this.itemWidth.toFixed(2)}`}"
        @wheel="${(e) => this.onWheel(e)}"
      >
        <div class="tile-track">
          <slot></slot>
        </div>
      </div>
    `;
  }

  @query(".tile-track")
  private readonly track!: HTMLElement;

  defalutWidth = 7;
  defaultTransitionTime = 669;

  get itemCount() {
    return [...this.children]
      .filter((child) => !child.classList.contains("ghost"))
      .reduce((curr) => curr + 1, 0);
  }

  trackWidth = 0;
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
  targetEasing = "linear";

  positionX = 0;
  mouseX = 0;
  mouseY = 0;

  mouseGrab = false;

  transitionAt = 0;
  transitionTime = this.defaultTransitionTime;

  canScroll = true;
  scrollTimeout;

  traits: Trait[] = [
    new PointerTrait("pointer", this, true),
    new LoopTrait("loop", this),
    // new AutoplayTrait("autoplay", this),
    // new AutorunTrait("autorun", this),
  ];

  inputState: InputState = {
    grab: {
      value: false,
    },
    release: {
      value: false,
    },
    move: {
      value: false,
      detlaX: 0,
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
    state.move.value = false;
    state.move.detlaX = 0;
    state.grab.value = false;
    state.format.value = false;
    state.leave.value = false;
    state.enter.value = false;
    state.release.value = false;
  }

  protected updated(): void {
    for (const trait of this.traits) {
      if (trait.id === "loop") {
        trait.enabled = !!this.loop;
      }
      if (trait.id === "autoplay") {
        trait.enabled = !!this.autoplay;
      }
      if (trait.id === "autorun") {
        trait.enabled = !!this.autorun;
      }
    }
  }

  @property({ type: Boolean, reflect: true })
  loop = false;

  @property({ type: Boolean, reflect: true })
  autoplay = false;

  @property({ type: Boolean, reflect: true })
  autorun = false;

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
      this.inputState.move.value = true;
      this.inputState.move.detlaX += -deltaX;

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
    if (this.canScroll && Math.abs(e.deltaX)) {
      this.inputState.move.value = true;
      this.inputState.move.detlaX += e.deltaX / 2;

      e.preventDefault();
    }
  }

  format() {
    this.itemWidth = this.children[0]?.clientWidth || this.itemWidth;
    this.trackWidth = this.getItemPosition(this.itemCount);

    this.inputState.format.value = true;

    this.requestUpdate();
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

  setTarget(x, easing = "linear") {
    if (x !== null) {
      this.transitionAt = Date.now();
      this.targetXStart = this.positionX;
    }
    this.targetEasing = easing;
    this.targetX = x;
  }

  moveBy(columns, easing) {
    this.setTarget(-this.itemWidth * (this.currentItem + columns), easing);
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
            this.targetForceX = diff;
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
      if (this.positionX > x) {
        break;
      } else {
        this.currentItem++;
      }
    }
  }

  connectedCallback(): void {
    super.connectedCallback();

    window.addEventListener("pointermove", this.pointerMove.bind(this));
    this.addEventListener("pointerdown", this.pointerDown.bind(this));
    window.addEventListener("pointerup", this.pointerUp.bind(this));
    window.addEventListener("pointercancel", this.pointerUp.bind(this));
    this.addEventListener("pointerleave", this.pointerLeave.bind(this));
    this.addEventListener("pointerenter", this.pointerEnter.bind(this));

    window.addEventListener("resize", this.format.bind(this));
    window.addEventListener("scroll", this.onScroll.bind(this));

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

    window.removeEventListener("resize", this.format.bind(this));
    window.removeEventListener("scroll", this.onScroll.bind(this));
  }
}

customElements.define("sv-entity-slider", EntitySlider);

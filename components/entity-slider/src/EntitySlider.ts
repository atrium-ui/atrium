import { css, html, LitElement, PropertyValueMap } from "lit";
import { property, query } from "lit/decorators.js";
import { AutoplayTrait, LoopTrait, AutorunTrait, Trait, PointerTrait } from "./Traits.js";
import { Ease, isTouch, timer } from "./utils.js";

export type InputState = {
  grab: {
    pressed: boolean;
  };
  move: {
    pressed: boolean;
    detlaX: number;
  };
  release: {
    pressed: boolean;
  };
  format: {
    pressed: boolean;
  };
  leave: {
    pressed: boolean;
  };
  enter: {
    pressed: boolean;
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
  tickRate = 1;
  lastTick = 0;

  inputForceX = 0;

  targetForceX = 0;
  targetXStart;
  targetX;
  targetEasing = "linear";

  positionX = 0;
  mouseX = 0;
  mouseY = 0;

  transitionAt = 0;
  transitionTime = this.defaultTransitionTime;

  canScroll = true;
  scrollTimeout;

  traits: Trait[] = [
    new PointerTrait("pointer", this),
    new LoopTrait("loop", this),
    new AutoplayTrait("autoplay", this),
    new AutorunTrait("autorun", this),
  ];

  inputState: InputState = {
    grab: {
      pressed: false,
    },
    release: {
      pressed: false,
    },
    move: {
      pressed: false,
      detlaX: 0,
    },
    format: {
      pressed: false,
    },
    leave: {
      pressed: false,
    },
    enter: {
      pressed: false,
    },
  };

  clearInputState() {
    const state = this.inputState;
    state.move.pressed = false;
    state.move.detlaX = 0;
    state.grab.pressed = false;
    state.format.pressed = false;
    state.leave.pressed = false;
    state.enter.pressed = false;
    state.release.pressed = false;
  }

  protected updated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    for (const [key, value] of _changedProperties) {
      for (const trait of this.traits) {
        if (trait.id === key.toString().replace("enable", "").toLocaleUpperCase()) {
          trait.enabled = !!value;
        }
      }
    }
  }

  @property({ type: Boolean, reflect: true })
  enableLoop = false;

  @property({ type: Boolean, reflect: true })
  enableAutoplay = false;

  @property({ type: Boolean, reflect: true })
  enableAutorun = false;

  getTrackWidth() {
    let width = 0;
    let index = 0;
    for (const child of this.children) {
      if (index >= this.itemCount) break;

      width += child.clientWidth;
      index++;
    }
    return width;
  }

  format() {
    this.itemWidth = this.children[0]?.clientWidth || this.itemWidth;
    this.trackWidth = this.getTrackWidth();

    this.inputState.format.pressed = true;

    this.requestUpdate();
  }

  pointerEnter(e) {
    this.inputState.enter.pressed = true;
  }

  pointerLeave(e) {
    this.inputState.leave.pressed = true;
  }

  pointerDown(e) {
    this.mouseX = e.x;
    this.mouseY = e.y;
    this.setTarget(null);
  }

  mouseGrab = false;

  pointerUp(e) {
    this.mouseX = 0;
    this.mouseY = 0;

    if (this.mouseGrab) {
      this.mouseGrab = false;
      e.preventDefault();

      this.inputState.release.pressed = true;
    }

    this.requestUpdate();
  }

  pointerMove(e) {
    e.preventDefault();

    const deltaX = e.x - this.mouseX;
    const deltaY = e.y - this.mouseY;

    if (!this.mouseGrab && this.mouseX && Math.abs(deltaY) < Math.abs(deltaX)) {
      this.mouseGrab = true;
      this.inputState.grab.pressed = true;
    }

    if (this.mouseGrab) {
      this.inputState.move.pressed = true;

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
      this.inputState.move.pressed = true;
      this.inputState.move.detlaX += e.deltaX / 2;

      e.preventDefault();
    }
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

    this.tickRate = ms - this.lastTick;
    this.lastTick = ms;

    // handles inputs synchronously
    this.checkInputs();
    this.clearInputState();

    this.updateTick(this.tickRate * 0.01);
  }

  checkInputs() {
    for (const trait of this.traits) {
      if (trait && trait.enabled) trait.input(this.inputState);
    }
  }

  updateTick(deltaTick = 1) {
    for (const trait of this.traits) {
      if (trait && trait.enabled) trait.update(deltaTick);
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
            this.targetForceX = diff * deltaTick;
          }
          break;
      }
    }

    // update final position
    this.positionX = this.positionX + this.targetForceX + this.inputForceX;

    // TODO: this is wrong
    this.currentItem = Math.abs(
      Math.round((this.positionX / this.trackWidth) * this.itemCount)
    );

    this.targetForceX *= 0;
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

    // TODO: idk; needs markup to exist
    requestAnimationFrame(() => {
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

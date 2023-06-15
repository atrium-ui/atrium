import { css, html, LitElement } from "lit";
import { query } from "lit/decorators.js";
import { AutoplayTrait, LoopTrait, AutorunTrait, Trait } from "./Traits.js";
import { Ease, timer } from "./utils.js";

type InputReleaseEvent = {
  type: "release";
};

type InputGrabEvent = {
  type: "grab";
};

type InputMoveEvent = {
  type: "move";
  deltaX: number;
};

type InputFormatEvent = {
  type: "format";
};

type InputLeaveEvent = {
  type: "leave";
};

type InputEnterEvent = {
  type: "enter";
};

export type InputEvent =
  | InputReleaseEvent
  | InputGrabEvent
  | InputMoveEvent
  | InputFormatEvent
  | InputLeaveEvent
  | InputEnterEvent;

export class EntitySlider extends LitElement {
  render() {
    return html`
      <div
        tabindex="0"
        class="${`tile-slider ${this.grabbing ? "grabbing" : ""}`}"
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

  static get styles() {
    return css`
      :host {
        display: block;
        outline: none;
        overflow: hidden;
        touch-action: pan-y;
      }

      .tile-slider.grabbing {
        cursor: grabbing;
      }

      .tile-slider.grabbing .tile-track {
        pointer-events: none;
      }

      .tile-track {
        display: flex;
        will-change: transform;
      }
    `;
  }

  defalutWidth = 7;
  defaultTransitionTime = 669;

  width = this.defalutWidth;
  itemWidth = 480;
  acceleration = 0;
  lastTick = 0;
  targetXStart;
  targetX;
  targetEasing = "linear";
  positionX = 0;
  mouseX = 0;
  transitionAt = 0;
  transitionTime = this.defaultTransitionTime;
  currentItem = 0;
  grabbing = false;
  scrollTimeout;
  canScroll = true;
  animation;
  tickRate = 1;
  inputs: InputEvent[] = [];
  // prettier-ignore
  traits: Trait[] = [
    new LoopTrait(this),
    new AutoplayTrait(this),
    new AutorunTrait(this),
  ];

  getGridWidth() {
    return this.itemWidth * this.width;
  }

  format() {
    const firstCell = this.shadowRoot?.querySelector(".tile");
    this.itemWidth = firstCell?.clientWidth || this.itemWidth;

    if (globalThis.innerWidth < 700) {
      this.itemWidth = globalThis.innerWidth / 2;
    } else if (globalThis.innerWidth < 1800) {
      this.itemWidth = 370;
    } else {
      this.itemWidth = 480;
    }

    this.inputs.push({ type: "format" });

    this.requestUpdate();
  }

  pointerEnter(e) {
    this.inputs.push({ type: "enter" });
  }

  pointerLeave(e) {
    this.inputs.push({ type: "leave" });

    this.pointerUp(e);
  }

  pointerDown(e) {
    this.mouseX = e.x;
    this.setTarget(null);
  }

  pointerUp(e) {
    this.mouseX = 0;

    if (this.grabbing) {
      e.preventDefault();

      this.grabbing = false;

      this.inputs.push({ type: "release" });
    }

    this.requestUpdate();
  }

  pointerMove(e) {
    e.preventDefault();

    if (this.mouseX && !this.grabbing) {
      this.grabbing = true;

      this.inputs.push({ type: "grab" });
    }

    if (this.grabbing) {
      this.inputs.push({
        type: "move",
        deltaX: e.x - this.mouseX,
      });

      this.mouseX = e.x;
    }

    this.requestUpdate();
  }

  onScroll() {
    clearTimeout(this.scrollTimeout);

    this.canScroll = false;

    this.scrollTimeout = setTimeout(() => {
      this.canScroll = true;
    }, 200);
  }

  onWheel(e) {
    if (this.canScroll && e.deltaX) {
      this.inputs.push({
        type: "move",
        deltaX: -e.deltaX / 2,
      });

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
    this.updateInputs();

    this.updateTick(this.tickRate * 0.01);

    const track = this.track;
    if (track) {
      track.style.transform = `translateX(${this.positionX.toFixed(2)}px)`;
    }
  }

  updateInputs() {
    let inputAcceleration = 0;

    for (const input of this.inputs) {
      if (input.type === "move") {
        // TODO: doesnt maatch cursor movement
        inputAcceleration += input.deltaX || 0;
      }

      for (const trait of this.traits) {
        trait.input(input);
      }
    }

    this.inputs.length = 0;
    if (inputAcceleration) this.acceleration = inputAcceleration;
  }

  updateTick(deltaTick = 1) {
    for (const trait of this.traits) {
      trait.update(deltaTick);
    }

    const maxX = -this.getGridWidth();
    if (this.targetX != null) {
      switch (this.targetEasing) {
        case "ease":
          {
            const transitionTime = timer(this.transitionAt, this.transitionTime);
            const easedDelta =
              (this.targetX - this.targetXStart) * Ease.easeInOutCirc(transitionTime);
            this.acceleration = this.targetXStart + easedDelta - this.positionX;
          }
          break;
        default:
          {
            const diff = (this.targetX - this.positionX) % maxX;
            this.acceleration = diff * deltaTick;
          }
          break;
      }
    }

    this.positionX = this.positionX + this.acceleration;
    this.positionX = Math.min(0, this.positionX);
    this.positionX = Math.max(maxX - 1, this.positionX);
    this.acceleration *= 0.9; // drag

    this.currentItem = Math.abs(Math.round((this.positionX / this.getGridWidth()) * this.width));
  }

  onMounted() {
    this.format();
    this.tick();

    this.addEventListener("pointermove", this.pointerMove.bind(this));
    this.addEventListener("pointerdown", this.pointerDown.bind(this));
    this.addEventListener("pointerup", this.pointerUp.bind(this));
    this.addEventListener("pointercancel", this.pointerUp.bind(this));
    this.addEventListener("pointerleave", this.pointerLeave.bind(this));
    this.addEventListener("pointerenter", this.pointerEnter.bind(this));

    window.addEventListener("resize", this.format.bind(this));
    window.addEventListener("scroll", this.onScroll.bind(this));
  }

  onUnmounted() {
    this.stopAnimate();

    this.removeEventListener("pointermove", this.pointerMove.bind(this));
    this.removeEventListener("pointerdown", this.pointerDown.bind(this));
    this.removeEventListener("pointerup", this.pointerUp.bind(this));
    this.removeEventListener("pointercancel", this.pointerUp.bind(this));
    this.removeEventListener("pointerleave", this.pointerLeave.bind(this));
    this.removeEventListener("pointerenter", this.pointerEnter.bind(this));

    window.removeEventListener("resize", this.format.bind(this));
    window.removeEventListener("scroll", this.onScroll.bind(this));
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.onMounted();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.onUnmounted();
  }
}

customElements.define("sv-entity-slider", EntitySlider);

/**
 * @license
 * Copyright (c) 2024 Atrium Contributors
 * SPDX-License-Identifier: MIT
 */

import { LitElement, html, css } from "lit";
import { property } from "lit/decorators/property.js";

declare global {
  interface HTMLElementTagNameMap {
    "a-transition": Transition;
  }
}

function msFromCSS(string: string) {
  const unit = string.match(/m?s/)?.[0];
  let ms = Number.parseFloat(string);
  if (unit === "s") {
    ms *= 1000;
  }
  return ms;
}

/**
 * Transitions dom elements between two state automatically.
 *
 * @example
 * ```html
 * <a-transition>
 *   <div>Changing Content</div>
 * </a-transition>
 * ```
 *
 * @see https://atrium-ui.dev/elements/a-transition/
 */
class Transition extends LitElement {
  // TODO: these should also work with page navigations

  static get styles() {
    return css`
      :host {
        display: block;
        transition-duration: 0.3s;
        transition-timing-function: ease-in-out;
      }
      slot {
        display: inherit;
      }
    `;
  }

  render() {
    return html`<slot></slot>`;
  }

  /**
   * What type of transition to use.
   * - size: Transition just the size of the element.
   * - transition: Usees the View-Transitions API
   * - animation: Animate layout changes using CSS animations with the FLIP technique.
   */
  @property({ type: String })
  public type: "size" | "transition" | "animation" = "size";

  /**
   * Set a custom "view-transition-name"
   */
  @property({ type: String })
  public name = Math.random().toString(36).substring(2, 9);

  get content() {
    return this.shadowRoot?.children[0] as HTMLElement | undefined;
  }

  observer?: MutationObserver;

  childrenCache?: Element[];

  lock = false;

  lastHeight = this.offsetHeight;
  lastWidth = this.offsetWidth;

  initialised = false;

  updated() {
    if (this.type === "size") {
      this.animateSizes();
    }

    if (this.type === "transition") {
      // @ts-ignore
      this.style.setProperty("view-transition-name", this.name);
    }
  }

  connectedCallback(): void {
    super.connectedCallback();

    this.observer = new MutationObserver(async () => {
      if (this.type === "size") {
        this.requestUpdate();
      }

      if (this.type === "transition" && !this.lock) {
        this.lock = true;
        await this.transitionChildChanges();
        this.lock = false;
      }

      if (this.type === "animation") {
        await this.animateLayout();
        this.cacheLayout();
      }
    });

    this.observer.observe(this, {
      childList: true,
      attributes: true,
      subtree: true,
      characterData: true,
    });

    window.addEventListener("resize", this.onResize);

    requestAnimationFrame(() => this.initialise());
  }

  initialise() {
    this.initialised = true;
    this.lastHeight = this.offsetHeight;
    this.lastWidth = this.offsetWidth;
    this.cacheLayout();
  }

  disconnectedCallback(): void {
    window.removeEventListener("resize", this.onResize);
    this.observer?.disconnect();
    super.disconnectedCallback();
  }

  onResize = () => {
    if (this.type === "size") {
      this.lastHeight = this.content?.offsetHeight || 0;
      this.lastWidth = this.content?.offsetWidth || 0;
    }
  };

  startLayout: Map<Element, DOMRect> = new Map();

  async animateLayout() {
    const delayMultiplier = 150;
    const duration = 400;
    const easeFunction = "cubic-bezier(0.31, 0.17, 0, 1.01)";

    if (this.initialised) {
      const targetLayout: Map<Element, DOMRect> = new Map();
      for (const child of this.children) {
        targetLayout.set(child, child.getBoundingClientRect());
      }

      // animate by deltas
      let index = 0;
      for (const [child] of targetLayout.entries()) {
        const start = this.startLayout.get(child);
        const target = targetLayout.get(child);

        const delay = (1 - index / targetLayout.size) * delayMultiplier;

        if (!start) {
          // new element
          child.animate([{ transform: "scale(0)" }, { transform: "scale(1)" }], {
            duration,
            delay,
            easing: easeFunction,
            fill: "backwards",
          });
          continue;
        }

        if (!target) {
          // element disappeared
          continue;
        }

        const { x, y } = start
          ? {
              x: target.x - start.x,
              y: target.y - start.y,
            }
          : { x: 0, y: 0 };

        child.animate(
          [
            { transform: `translate(${-x}px, ${-y}px)` },
            { transform: "translate(0px, 0px)" },
          ],
          {
            duration,
            delay,
            easing: easeFunction,
            fill: "backwards",
          },
        );

        index++;
      }
    }
  }

  cacheLayout() {
    const delayMultiplier = 150;

    for (const child of this.children) {
      this.startLayout.set(child, child.getBoundingClientRect());
    }
    for (let index = 0; index < this.startLayout.size; index++) {
      const child = this.children[index] as HTMLElement;
      const delay = (1 - index / this.startLayout.size) * delayMultiplier;
      child.style.transitionDelay = `${delay}ms`;
    }
  }

  async transitionChildChanges() {
    // cache current dom nodes for later use

    const lastChildren = this.childrenCache;

    this.childrenCache = Array.from(this.children);

    if (lastChildren) {
      // remove current children, that are stored in childrenCache
      for (const child of this.children) {
        child.remove();
      }
      // append last children to dom
      for (const child of lastChildren) {
        this.appendChild(child);
      }

      // start transition
      // @ts-ignore
      const transition = document.startViewTransition(() => {
        // remove old children
        for (const child of this.children) {
          child.remove();
        }
        // remount new children
        if (this.childrenCache) {
          for (const child of this.childrenCache) {
            this.appendChild(child);
          }
        }
      });

      await transition.finished;
    }
  }

  async animateSizes() {
    if (!this.initialised) {
      return;
    }

    const height = this.offsetHeight;
    const width = this.offsetWidth;

    const easing = getComputedStyle(this).getPropertyValue("transition-timing-function");
    const duration = msFromCSS(
      getComputedStyle(this).getPropertyValue("transition-duration"),
    );

    const animation = this.animate(
      [
        {
          height: `${this.lastHeight}px`,
          width: `${this.lastWidth}px`,
        },
        {
          height: `${height}px`,
          width: `${width}px`,
        },
      ],
      {
        duration,
        easing,
      },
    );

    if (animation) {
      await animation.finished;
    }

    this.lastHeight = height;
    this.lastWidth = width;
  }
}

try {
  customElements.define("a-transition", Transition);
} catch (err) {
  console.warn("a-transition already defined");
}

export { Transition };

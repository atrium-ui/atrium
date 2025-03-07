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
 * @see https://svp.pages.s-v.de/atrium/elements/a-transition/
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
   * Whether the blur is enabled or not.
   */
  @property({ type: String })
  public type: "size" | "animation" = "size";

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

    if (this.type === "animation") {
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

      if (this.type === "animation" && !this.lock) {
        this.lock = true;
        await this.animateChildChanges();
        this.lock = false;
      }
    });

    this.observer.observe(this, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    window.addEventListener("resize", this.onResize);

    requestAnimationFrame(() => {
      this.initialised = true;
      this.lastHeight = this.offsetHeight;
      this.lastWidth = this.offsetWidth;
    });
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

  async animateChildChanges() {
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

    await this.animate(
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
    ).finished;

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

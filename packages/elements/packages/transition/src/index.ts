/**
 * @license
 * Copyright (c) 2024 Atrium Contributors
 * SPDX-License-Identifier: MIT
 */

import { LitElement, html, css } from "lit";

declare global {
  interface HTMLElementTagNameMap {
    "a-transition": Transition;
  }
}

const globalTransitionStyles = `

  @keyframes move-out {
    to {
      transform: translateX(-100px);
      opacity: 0;
    }
  }

  @keyframes move-in {
    from {
      transform: translateX(200px);
      opacity: 0;
    }
  }

  ::view-transition-old(a-transition) {
    animation: 0.33s ease both move-out;
  }
  ::view-transition-new(a-transition) {
    animation: 0.33s ease both move-in;
  }

  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation: none;
  }
`;

let globalStyles: HTMLStyleElement;

/**
 * Transitions dom elements with the View Transition API.
 *
 * @example
 * ```html
 * <a-transition>
 *   <div>Changing Content</div>
 * </a-transition>
 * ```
 */
export class Transition extends LitElement {
  // TODO: these should also work with page navigations

  static get styles() {
    return css`
      :host {
        view-transition-name: a-transition;
      }
    `;
  }

  render() {
    return html`<slot></slot>`;
  }

  observer = new MutationObserver(async () => {
    if (!this.lock) {
      this.lock = true;
      await this.slotChangeCallback();
      this.lock = false;
    }
  });

  childrenCache?: Element[];
  lock = false;

  setChildReferences() {
    this.childrenCache = Array.from(this.children);
  }

  connectedCallback(): void {
    super.connectedCallback();
    // cache current dom nodes for later use

    this.observer.observe(this, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    if (!globalStyles) {
      const styles = document.createElement("style");
      styles.innerHTML = globalTransitionStyles;
      document.head.appendChild(styles);
      globalStyles = styles;
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();

    this.observer.disconnect();
  }

  async slotChangeCallback() {
    // cache current dom nodes for later use

    const lastChildren = this.childrenCache;

    this.setChildReferences();

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
}

customElements.define("a-transition", Transition);

/**
 * @license
 * Copyright (c) 2024 Atrium Contributors
 * SPDX-License-Identifier: MIT
 */

import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

declare global {
  interface HTMLElementTagNameMap {
    "a-transition": Transition;
  }
}

/**
 * Transition element
 *
 * @example
 * ```html
 * <a-transition>
 *   <div>Content</div>
 * </a-transition>
 * ```
 */
export class Transition extends LitElement {
  // @property({ type: String, attribute: "active-attribute" })
  // public activeAttribute = "selected";

  render() {
    return html`<slot />`;
  }

  onChange() {
    // @ts-ignore
    const transition = document.startViewTransition(() => displayNewImage());
  }

  connectedCallback(): void {
    // cache current dom nodes for later use
  }

  slotChangeCallback() {
    // cache current dom nodes for later use
    // mount old nodes, start transition, and mount new nodes again
  }
}

customElements.define("a-transition", Transition);

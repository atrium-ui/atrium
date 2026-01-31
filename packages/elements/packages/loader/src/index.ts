/**
 * @license
 * Copyright (c) 2024 Atrium Contributors
 * SPDX-License-Identifier: MIT
 */

import { LoaderElement } from "./LoaderElement.js";

declare global {
  interface HTMLElementTagNameMap {
    "a-loader": LoaderElement;
  }
}

try {
  customElements.define("a-loader", LoaderElement);
} catch (err) {
  console.warn("a-loader already defined");
}

export { LoaderElement };

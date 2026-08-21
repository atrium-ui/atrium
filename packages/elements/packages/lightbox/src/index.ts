/**
 * @license
 * Copyright (c) 2024 Atrium Contributors
 * SPDX-License-Identifier: MIT
 */

import { Lightbox } from "./Lightbox.js";

try {
  if (typeof window !== "undefined") {
    customElements.define("a-lightbox", Lightbox);
  }
} catch (err) {
  console.warn("a-lightbox already defined");
}

export { Lightbox };

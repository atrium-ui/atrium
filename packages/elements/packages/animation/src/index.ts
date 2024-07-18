/**
 * @license
 * Copyright (c) 2024 Atrium Contributors
 * SPDX-License-Identifier: MIT
 */

import { AnimationElement } from "./AnimationElement.js";

try {
  customElements.define("a-animation", AnimationElement);
} catch (err) {
  console.warn("a-animation already defined");
}

export { AnimationElement };

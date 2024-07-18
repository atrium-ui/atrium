/**
 * @license
 * Copyright (c) 2024 Atrium Contributors
 * SPDX-License-Identifier: MIT
 */

import { ToggleElement } from "./Toggle.js";

try {
  customElements.define("a-toggle", ToggleElement);
} catch (err) {
  console.warn("a-toggle already defined");
}

export { ToggleElement };

/**
 * @license
 * Copyright (c) 2024 Atrium Contributors
 * SPDX-License-Identifier: MIT
 */

import { Blur } from "./Blur.js";

try {
  customElements.define("a-blur", Blur);
} catch (err) {
  console.warn("a-blur already defined");
}

export { Blur };

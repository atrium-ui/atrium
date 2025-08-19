/**
 * @license
 * Copyright (c) 2024 Atrium Contributors
 * SPDX-License-Identifier: MIT
 */

import { Range } from "./components/Range.js";

try {
  customElements.define("a-range", Range);
} catch (err) {
  console.warn("a-range already defined");
}

export { Range };

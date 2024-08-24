/**
 * @license
 * Copyright (c) 2024 Atrium Contributors
 * SPDX-License-Identifier: MIT
 */

import { Expandable } from "./Expandable";

try {
  customElements.define("a-expandable", Expandable);
} catch (err) {
  console.warn("a-expandable already defined");
}

export { Expandable };

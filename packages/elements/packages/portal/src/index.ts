/**
 * @license
 * Copyright (c) 2024 Atrium Contributors
 * SPDX-License-Identifier: MIT
 */

import { Portal } from "./Portal.js";

try {
  if (typeof window !== "undefined") {
    customElements.define("a-portal", Portal);
  }
} catch (err) {
  console.warn("a-portal already defined");
}

export { Portal };

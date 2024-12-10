/**
 * @license
 * Copyright (c) 2024 Atrium Contributors
 * SPDX-License-Identifier: MIT
 */

import { BoxElement } from "./Box";

try {
  customElements.define("a-box", BoxElement);
} catch (err) {
  console.warn("a-box already defined");
}

export { BoxElement };

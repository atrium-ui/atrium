/**
 * @license
 * Copyright (c) 2024 Atrium Contributors
 * SPDX-License-Identifier: MIT
 */

import { BoxElement } from "./Box.js";

if ("customElements" in globalThis && !customElements.get("a-box")) {
  customElements.define("a-box", BoxElement);
}

export { BoxElement };

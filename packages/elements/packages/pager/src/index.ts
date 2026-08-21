/**
 * @license
 * Copyright (c) 2024 Atrium Contributors
 * SPDX-License-Identifier: MIT
 */

import { PagerElement } from "./Pager.js";

try {
  customElements.define("a-pager", PagerElement);
} catch (err) {
  console.warn("a-pager already defined");
}

export { PagerElement };

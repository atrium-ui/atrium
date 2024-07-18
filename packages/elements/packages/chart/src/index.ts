/**
 * @license
 * Copyright (c) 2024 Atrium Contributors
 * SPDX-License-Identifier: MIT
 */

import { ChartElement } from "./ChartElement.js";

try {
  customElements.define("a-chart", ChartElement);
} catch (err) {
  console.warn("a-chart already defined");
}

export { ChartElement };

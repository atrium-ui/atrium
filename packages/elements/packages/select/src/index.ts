/**
 * @license
 * Copyright (c) 2024 Atrium Contributors
 * SPDX-License-Identifier: MIT
 */

import "@sv/elements/expandable";
import { OptionElement } from "./Option";
import { Select } from "./Select";

try {
  customElements.define("a-option", OptionElement);
  customElements.define("a-select", Select);
} catch (err) {
  console.warn("a-select already defined");
}

export { OptionElement, Select };

/**
 * @license
 * Copyright (c) 2024 Atrium Contributors
 * SPDX-License-Identifier: MIT
 */

import "@atrium-ui/elements/expandable";
import { OptionElement } from "./Option";
import { Select } from "./Select";

if (!customElements.get("a-select")) {
  customElements.define("a-option", OptionElement);
  customElements.define("a-select", Select);
} else {
  console.warn("a-select already defined");
}

export { OptionElement, Select };

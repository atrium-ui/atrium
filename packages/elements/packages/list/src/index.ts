/**
 * @license
 * Copyright (c) 2024 Atrium Contributors
 * SPDX-License-Identifier: MIT
 */

import "@sv/elements/expandable";
import { OptionElement } from "./Option";
import { List } from "./List";

if (!customElements.get("a-list")) {
  customElements.define("a-option", OptionElement);
  customElements.define("a-list", List);
} else {
  console.warn("a-list already defined");
}

export { OptionElement, List };

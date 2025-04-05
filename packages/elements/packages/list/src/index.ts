/**
 * @license
 * Copyright (c) 2024 Atrium Contributors
 * SPDX-License-Identifier: MIT
 */

import "@atrium-ui/elements/expandable";
import { ListItem, List } from "./List";

if (!customElements.get("a-list")) {
  customElements.define("a-list-item", ListItem);
  customElements.define("a-list", List);
} else {
  console.warn("a-list already defined");
}

export { ListItem, List };

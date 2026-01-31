/**
 * @license
 * Copyright (c) 2024 Atrium Contributors
 * SPDX-License-Identifier: MIT
 */

import "@sv/elements/expandable";
import { ListItemElement, ListElement } from "./List.js";

if (!customElements.get("a-list")) {
  customElements.define("a-list-item", ListItemElement);
  customElements.define("a-list", ListElement);
} else {
  console.warn("a-list already defined");
}

export { ListItemElement as ListItem, ListElement as List };
